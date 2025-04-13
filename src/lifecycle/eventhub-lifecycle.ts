/**
 * EventHub lifecycle management
 */
import { EventHub } from '../event-hub';
import { ConnectionState, EventHubConfig, LifecycleManager, LifecycleState } from '../types';
import { DefaultLifecycleHooks, ILifecycleHooks } from '../types/lifecycle-hooks';
import { getStateChannel } from '../types/system-channels';

/**
 * EventHub lifecycle manager
 */
export class EventHubLifecycle implements LifecycleManager {
  /**
   * EventHub instance
   */
  private eventHub: EventHub;
  
  /**
   * Current state
   */
  private state: ConnectionState;
  
  /**
   * Configuration
   */
  private config?: EventHubConfig;
  
  /**
   * Lifecycle hooks
   */
  private hooks: ILifecycleHooks;
  
  /**
   * State change callbacks
   */
  private stateChangeCallbacks: Set<(state: ConnectionState) => void> = new Set();
  
  /**
   * Create an EventHub lifecycle manager
   * 
   * @param eventHub EventHub instance
   * @param config Optional configuration
   * @param hooks Optional lifecycle hooks
   */
  constructor(eventHub: EventHub, config?: EventHubConfig, hooks?: ILifecycleHooks) {
    this.eventHub = eventHub;
    this.config = config;
    this.hooks = hooks || new DefaultLifecycleHooks();
    
    this.state = {
      status: LifecycleState.CREATED,
      timestamp: Date.now(),
      componentType: 'eventhub'
    };
  }
  
  /**
   * Update the configuration
   * 
   * @param config New configuration
   */
  async configure(config: EventHubConfig): Promise<void> {
    this.config = config;
  }
  
  /**
   * Initialize the EventHub
   */
  async initialize(): Promise<void> {
    try {
      // Call before initialize hook if provided
      if (this.hooks?.beforeInitialize) {
        await this.hooks.beforeInitialize();
      }
      
      // Update state
      this.updateState(LifecycleState.INITIALIZING);
      
      // Initialization logic here
      
      // Update state
      this.updateState(LifecycleState.INITIALIZED);
      
      // Call after initialize hook if provided
      if (this.hooks?.afterInitialize) {
        await this.hooks.afterInitialize();
      }
      
      // Auto-connect if configured
      if (this.config?.autoConnect) {
        await this.start();
      }
    } catch (error) {
      this.updateState(LifecycleState.ERROR, error as Error);
      throw error;
    }
  }
  
  /**
   * Start the EventHub (connect all components)
   */
  async start(): Promise<void> {
    try {
      // Call before connect hook if provided
      if (this.hooks?.beforeConnect) {
        await this.hooks.beforeConnect();
      }
      
      // Update state
      this.updateState(LifecycleState.CONNECTING);
      
      // Connect all transports
      const transports = this.eventHub.getAllTransports();
      for (const [, transport] of transports.entries()) {
        await transport.connect();
      }
      
      // Connect all connectors
      const connectors = this.eventHub.getAllConnectors();
      for (const [, connector] of connectors.entries()) {
        await connector.connect();
      }
      
      // Update state
      this.updateState(LifecycleState.CONNECTED);
      
      // Call after connect hook if provided
      if (this.hooks?.afterConnect) {
        await this.hooks.afterConnect();
      }
    } catch (error) {
      this.updateState(LifecycleState.ERROR, error as Error);
      throw error;
    }
  }
  
  /**
   * Stop the EventHub (disconnect all components)
   */
  async stop(): Promise<void> {
    try {
      // Call before disconnect hook if provided
      if (this.hooks?.beforeDisconnect) {
        await this.hooks.beforeDisconnect();
      }
      
      // Update state
      this.updateState(LifecycleState.DISCONNECTING);
      
      // Disconnect all connectors first
      const connectors = this.eventHub.getAllConnectors();
      for (const [, connector] of connectors.entries()) {
        await connector.disconnect();
      }
      
      // Then disconnect all transports
      const transports = this.eventHub.getAllTransports();
      for (const [, transport] of transports.entries()) {
        await transport.disconnect();
      }
      
      // Update state
      this.updateState(LifecycleState.DISCONNECTED);
      
      // Call after disconnect hook if provided
      if (this.hooks?.afterDisconnect) {
        await this.hooks.afterDisconnect();
      }
    } catch (error) {
      this.updateState(LifecycleState.ERROR, error as Error);
      throw error;
    }
  }
  
  /**
   * Destroy the EventHub (disconnect and clean up all components)
   */
  async destroy(): Promise<void> {
    try {
      // Call before destroy hook if provided
      if (this.hooks?.beforeDestroy) {
        await this.hooks.beforeDestroy();
      }
      
      // Disconnect first if connected
      if (this.state.status === LifecycleState.CONNECTED) {
        await this.stop();
      }
      
      // Update state
      this.updateState(LifecycleState.DESTROYED);
      
      // Call after destroy hook if provided
      if (this.hooks?.afterDestroy) {
        await this.hooks.afterDestroy();
      }
    } catch (error) {
      this.updateState(LifecycleState.ERROR, error as Error);
      throw error;
    }
  }
  
  /**
   * Get the current state
   * 
   * @returns Current state
   */
  getState(): ConnectionState {
    return { ...this.state };
  }
  
  /**
   * Register a callback for state changes
   * 
   * @param callback Function to call when state changes
   * @returns Function to unregister the callback
   */
  onStateChange(callback: (state: ConnectionState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }
  
  /**
   * Update the state and notify callbacks
   * 
   * @param status New status
   * @param error Optional error
   */
  private updateState(status: LifecycleState, error?: Error): void {
    this.state = {
      status,
      timestamp: Date.now(),
      componentType: 'eventhub',
      error
    };
    
    // Notify all callbacks
    for (const callback of Array.from(this.stateChangeCallbacks)) {
      try {
        callback({ ...this.state });
      } catch (callbackError) {
        console.error('Error in state change callback:', callbackError);
      }
    }
    
    // Publish state change event
    this.eventHub.publish(getStateChannel('eventhub'), { ...this.state })
      .catch(err => console.error('Error publishing state change:', err));
  }
  
  /**
   * Get the current configuration
   * 
   * @returns Current configuration
   */
  getConfig(): EventHubConfig | undefined {
    return this.config ? { ...this.config } : undefined;
  }
}
