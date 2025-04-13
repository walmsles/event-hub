import { ConnectorFactory } from "./factory/connector-factory";
import { TransportFactory } from "./factory/transport-factory";
import { EventHubLifecycle } from "./lifecycle/eventhub-lifecycle";
import { ILifecycleHooks } from "./types/lifecycle-hooks";
import { getConfigChannel } from "./types/system-channels";
import { Channel } from "./channel";
import { BaseConnector } from "./connector";
import { BaseTransport } from "./transport";
import { 
  ConnectionState, 
  ConnectorConfig, 
  EventCallback, 
  EventHubConfig, 
  SubscribeOptions, 
  Subscription, 
  TransportConfig, 
  WildCardChannel 
} from "./types";

/**
 * Implements the EventHub which enables a simple publish/subscribe mechanism for loosely coupled event passing between
 * registered components.
 *
 * @class EventHub
 * @description
 * This class manages multiple channels for event communication. It allows components to subscribe to specific channels,
 * publish events to channels, and retrieve the last event published on a channel. The EventHub acts as a central
 * coordinator for all event-based communication within an application.
 *
 * Key features:
 * - Dynamic channel creation: Channels are created on-demand when publishing or subscribing.
 * - Type-safe events: Each channel can handle a specific event type.
 * - Last event retrieval: Ability to get the most recent event from any channel.
 * - Subscription management: Easy subscription and unsubscribe mechanism.
 * - Factory-based component creation: Create transports and connectors from configuration.
 * - Lifecycle management: Manage the lifecycle of components.
 *
 * @property {Map<string, Channel<any>>} channels - Private property that stores all the channels managed by the event hub.
 * Each key is a channel name, and the value is the corresponding Channel instance.
 *
 * @method subscribe - Allows components to subscribe to a specific channel and receive events published on that channel.
 * @method publish - Allows components to publish an event to a specific channel, notifying all subscribers.
 * @method lastEvent - Retrieves the last event that was published on a specified channel.
 * @method configure - Configures the EventHub with transports and connectors.
 * @method connect - Connects all components.
 * @method disconnect - Disconnects all components.
 *
 * @example
 * // Basic usage
 * const eventHub = new EventHub();
 * const subscription = eventHub.subscribe('userLogin', (user) => console.log(`${user} logged in`));
 * eventHub.publish('userLogin', 'Alice');
 * // Output: Alice logged in
 * console.log(eventHub.lastEvent('userLogin')); // Output: Alice
 * subscription.unsubscribe();
 * 
 * // Advanced usage with configuration
 * const eventHub = new EventHub({
 *   transports: [{
 *     id: 'ws1',
 *     type: 'websocket',
 *     options: { url: 'wss://example.com' }
 *   }],
 *   connectors: [{
 *     id: 'source1',
 *     type: 'source',
 *     options: { transportId: 'ws1', channel: 'notifications' }
 *   }]
 * });
 * 
 * await eventHub.connect();
 */
export class EventHub {
  /**
   * Holds the list of channels created by publish/subscribe methods of the EventHub
   *
   * @private
   */
  private channels: Map<string, Channel<any>> = new Map();
  
  /**
   * Transport factory for creating transport instances
   * @private
   */
  private transportFactory?: TransportFactory;
  
  /**
   * Connector factory for creating connector instances
   * @private
   */
  private connectorFactory?: ConnectorFactory;
  
  /**
   * Map of transport instances by ID
   * @private
   */
  private transports?: Map<string, BaseTransport<unknown, unknown>>;
  
  /**
   * Map of connector instances by ID
   * @private
   */
  private connectors?: Map<string, BaseConnector>;
  
  /**
   * Lifecycle manager for the EventHub
   * @private
   */
  private lifecycle?: EventHubLifecycle;
  
  /**
   * Current configuration
   * @private
   */
  private config?: EventHubConfig;

  /**
   * Creates a new EventHub instance.
   *
   * @description
   * The constructor initializes a wildcard channel object.
   * Channels are created dynamically as they are subscribed to or published to.
   * If a configuration is provided, the EventHub will be configured with the specified
   * transports and connectors.
   * 
   * @param config Optional configuration for the EventHub
   * @param lifecycleHooks Optional lifecycle hooks implementation
   */
  constructor(config?: EventHubConfig, lifecycleHooks?: ILifecycleHooks) {
    // Create the Wildcard Channel
    this.getOrCreateChannel<any>(WildCardChannel);
    
    // Initialize factories and component maps if configuration is provided
    if (config) {
      this.initializeFactories();
      
      // Apply initial configuration
      this.configure(config, lifecycleHooks).catch(error => {
        console.error('Error applying initial configuration:', error);
      });
    }
  }
  
  /**
   * Initialize factories and component maps
   * @private
   */
  private initializeFactories(): void {
    if (!this.transportFactory) {
      this.transportFactory = new TransportFactory();
    }
    
    if (!this.connectorFactory) {
      this.connectorFactory = new ConnectorFactory(this);
    }
    
    if (!this.transports) {
      this.transports = new Map<string, BaseTransport<unknown, unknown>>();
    }
    
    if (!this.connectors) {
      this.connectors = new Map<string, BaseConnector>();
    }
  }

  /**
   * Get a channel by name
   * @private
   */
  private getChannel(channel: string) : Channel<any>|undefined {
    return this.channels.get(channel);
  }

  /**
   * Get or create a channel by name
   * @private
   */
  private getOrCreateChannel<TData>(channel: string): Channel<TData> {
    if (!channel || typeof channel !== 'string') {
      throw new TypeError('Channel name must be a non-empty string');
    }
    if (!this.channels.has(channel)) {
        this.channels.set(channel, new Channel<TData>(channel));
    }
    return this.channels.get(channel) as Channel<TData>;
  }

  /**
   * Get the Channel Count for the EventHub
   * 
   * @returns the channel count (number)
   */
  get channelCount() {
    return this.channels.size;
  }

  /**
   * Get the callback count for a channel
   * 
   * @param channel The channel name
   * @returns The number of callbacks registered for the channel
   */
  callbackCount(channel: string) {
    const ch = this.getChannel(channel);
    if (ch) {
        return ch.callbacks.size;
    }
    return 0;
  }

  /**
   * Enable unsubscribing from an entire group of subscriptions.
   *
   * @param group The group name to unsubscribe
   */
  unsubscribeGroup(group: string): void {
    // Unsubscribe group from all channels that might have it
    this.channels.forEach(channel => {
      channel.unsubscribeGroup(group);
    });
  }

  /**
   * Subscribes to all events sent on a specific channel of the event hub.
   *
   * @template TData The type of event that this subscription handles.
   * @param {string} channel - The name of the channel to subscribe to.
   * @param {EventCallback<TData>} callback - The function to be called by the EventHub for each event published on this channel.
   * @param {SubscribeOptions} [options] - Optional settings for the subscription including replay and group.
   * @returns {Subscription} An object containing the unsubscribe method and the subscription ID.
   */
  subscribe<TData>(channel: string, callback: EventCallback<TData>, options?: SubscribeOptions): Subscription {
    const ch = this.getOrCreateChannel<TData>(channel);
    return ch.subscribe(callback, options);
  }

  /**
   * Publishes an event to a specific channel on the event hub.
   *
   * @template TData The type of event being published.
   * @param {string} channel - The name of the channel to publish the event to.
   * @param {TData} data - The event data to be sent to each subscriber of the channel.
   */
  async publish<TData>(channel: string, data: TData): Promise<void> {
    const ch = this.getOrCreateChannel<TData>(channel);
    await ch.publish(data);
    
    // Also publish to wildcard channel
    if (channel !== WildCardChannel) {
        await this.getOrCreateChannel<any>(WildCardChannel).publish(data);
    }
  }

  /**
   * Retrieves the last event that was published on a specific channel.
   *
   * @template TEvent The type of event expected from this channel.
   * @param {string} channel - The name of the channel to retrieve the last event from.
   * @returns {TEvent | undefined} The last event that was published on the channel, or undefined if no event has been published.
   */
  lastEvent<TData>(channel: string): TData | undefined {
    return this.getOrCreateChannel<TData>(channel).lastEvent;
  }
  
  /**
   * Configure the EventHub with the provided configuration
   * 
   * @param config EventHub configuration
   * @param lifecycleHooks Optional lifecycle hooks implementation
   */
  public async configure(config: EventHubConfig, lifecycleHooks?: ILifecycleHooks): Promise<void> {
    try {
      // Initialize factories if not already initialized
      this.initializeFactories();
      
      // Store the configuration
      this.config = { ...config };
      
      // Initialize lifecycle manager if not already initialized
      if (!this.lifecycle) {
        this.lifecycle = new EventHubLifecycle(this, config, lifecycleHooks);
      } else {
        // Update existing lifecycle manager with new configuration
        await this.lifecycle.configure(config);
      }
      
      // Publish configuration event
      await this.publish(getConfigChannel('set', 'eventhub'), config);
      
      // Create transports if provided
      if (config.transports && Array.isArray(config.transports)) {
        for (const transportConfig of config.transports) {
          await this.createTransport(transportConfig);
        }
      }
      
      // Create connectors if provided
      if (config.connectors && Array.isArray(config.connectors)) {
        for (const connectorConfig of config.connectors) {
          await this.createConnector(connectorConfig);
        }
      }
      
      // Publish configuration applied event
      await this.publish(getConfigChannel('apply', 'eventhub'), {
        success: true,
        timestamp: Date.now()
      });
    } catch (error) {
      // Publish configuration error event
      await this.publish(getConfigChannel('error', 'eventhub'), {
        error,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  /**
   * Register a transport type with the factory
   * 
   * @param type Transport type identifier
   * @param implementation Transport implementation constructor
   */
  public registerTransport(
    type: string, 
    implementation: new (...args: any[]) => BaseTransport<unknown, unknown>
  ): void {
    this.initializeFactories();
    this.transportFactory!.register(type, implementation);
  }
  
  /**
   * Register a connector type with the factory
   * 
   * @param type Connector type identifier
   * @param implementation Connector implementation constructor
   */
  public registerConnector(
    type: string, 
    implementation: new (...args: any[]) => BaseConnector
  ): void {
    this.initializeFactories();
    this.connectorFactory!.register(type, implementation);
  }
  
  /**
   * Create a transport from configuration
   * 
   * @param config Transport configuration
   * @returns The created transport instance
   */
  public async createTransport(config: TransportConfig): Promise<BaseTransport<unknown, unknown>> {
    this.initializeFactories();
    
    // Check if transport with this ID already exists
    if (this.transports!.has(config.id)) {
      throw new Error(`Transport with ID '${config.id}' already exists`);
    }
    
    // Apply default options if configured
    const mergedConfig = {
      ...config,
      options: {
        ...(this.config?.defaultTransportOptions || {}),
        ...(config.options || {})
      }
    };
    
    // Create the transport
    const transport = this.transportFactory!.createWithValidation(mergedConfig);
    
    // Store the transport
    this.transports!.set(config.id, transport);
    
    // Publish transport created event
    await this.publish(getConfigChannel('apply', 'transport', config.id), {
      transportId: config.id,
      transportType: config.type,
      timestamp: Date.now()
    });
    
    return transport;
  }
  
  /**
   * Create a connector from configuration
   * 
   * @param config Connector configuration
   * @returns The created connector instance
   */
  public async createConnector(config: ConnectorConfig): Promise<BaseConnector> {
    this.initializeFactories();
    
    // Check if connector with this ID already exists
    if (this.connectors!.has(config.id)) {
      throw new Error(`Connector with ID '${config.id}' already exists`);
    }
    
    // Apply default options if configured
    const mergedConfig = {
      ...config,
      options: {
        ...(this.config?.defaultConnectorOptions || {}),
        ...(config.options || {})
      }
    };
    
    // Handle transport creation/resolution if transportId is specified
    if (mergedConfig.options?.transportId) {
      const transportId = mergedConfig.options.transportId;
      
      // If the transport doesn't exist yet, check if we have a transport config for it
      if (!this.transports!.has(transportId) && this.config?.transports) {
        const transportConfig = this.config.transports.find(t => t.id === transportId);
        if (transportConfig) {
          // Create the transport first
          await this.createTransport(transportConfig);
        } else {
          throw new Error(`Transport with ID '${transportId}' not found for connector '${config.id}'`);
        }
      } else if (!this.transports!.has(transportId)) {
        throw new Error(`Transport with ID '${transportId}' not found for connector '${config.id}'`);
      }
      
      // Add the transport instance to the options
      const transport = this.transports!.get(transportId);
      mergedConfig.options.transport = transport;
    }
    
    // Create the connector - the implementation may create its own transport if needed
    const connector = this.connectorFactory!.createWithValidation(mergedConfig);
    
    // Store the connector
    this.connectors!.set(config.id, connector);
    
    // Publish connector created event
    await this.publish(getConfigChannel('apply', 'connector', config.id), {
      connectorId: config.id,
      connectorType: config.type,
      timestamp: Date.now()
    });
    
    return connector;
  }
  
  /**
   * Connect all components
   */
  public async connect(): Promise<void> {
    if (!this.lifecycle) {
      // Initialize with default lifecycle if not already initialized
      this.initializeFactories();
      this.lifecycle = new EventHubLifecycle(this, this.config);
    }
    
    // Initialize the lifecycle
    await this.lifecycle.initialize();
    
    // Start the lifecycle (connects all components)
    await this.lifecycle.start();
  }
  
  /**
   * Disconnect all components
   */
  public async disconnect(): Promise<void> {
    if (!this.lifecycle) {
      throw new Error('EventHub has not been initialized with components to disconnect');
    }
    
    // Stop the lifecycle (disconnects all components)
    await this.lifecycle.stop();
  }
  
  /**
   * Get a transport by ID
   * 
   * @param id Transport ID
   * @returns The transport instance or undefined if not found
   */
  public getTransport(id: string): BaseTransport<unknown, unknown> | undefined {
    return this.transports?.get(id);
  }
  
  /**
   * Get a connector by ID
   * 
   * @param id Connector ID
   * @returns The connector instance or undefined if not found
   */
  public getConnector(id: string): BaseConnector | undefined {
    return this.connectors?.get(id);
  }
  
  /**
   * Get all registered transports
   * 
   * @returns Map of transport instances by ID
   */
  public getAllTransports(): Map<string, BaseTransport<unknown, unknown>> {
    return new Map(this.transports || []);
  }
  
  /**
   * Get all registered connectors
   * 
   * @returns Map of connector instances by ID
   */
  public getAllConnectors(): Map<string, BaseConnector> {
    return new Map(this.connectors || []);
  }
  
  /**
   * Get the current state of the EventHub
   * 
   * @returns The current connection state
   */
  public getState(): ConnectionState | undefined {
    return this.lifecycle?.getState();
  }
  
  /**
   * Register a callback for state changes
   * 
   * @param callback Function to call when state changes
   * @returns Function to unregister the callback
   */
  public onStateChange(callback: (state: ConnectionState) => void): () => void {
    if (!this.lifecycle) {
      this.initializeFactories();
      this.lifecycle = new EventHubLifecycle(this, this.config);
    }
    
    return this.lifecycle.onStateChange(callback);
  }
  
  /**
   * Destroy the EventHub and all components
   */
  public async destroy(): Promise<void> {
    if (this.lifecycle) {
      // Destroy the lifecycle (cleans up all components)
      await this.lifecycle.destroy();
    }
    
    // Clear all maps
    this.transports?.clear();
    this.connectors?.clear();
  }
  
  /**
   * Get the current configuration
   * 
   * @returns The current configuration or undefined if not configured
   */
  public getConfig(): EventHubConfig | undefined {
    return this.config ? { ...this.config } : undefined;
  }
}





