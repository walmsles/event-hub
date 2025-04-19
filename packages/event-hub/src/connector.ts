/**
 * Core Connector Classes
 * 
 * @description
 * Connectors are one-way data flow components that connect to a transport 
 * and publish/subscribe to the EventHub. They provide the bridge between
 * external data sources/sinks and the internal event system.
 */
import { EventHub } from './event-hub';
import { SinkTransport,SourceTransport } from './transport';
import { Subscription } from './types';

/**
 * Implements an inbound data flow from an external transport to the EventHub
 * 
 * @template TInput The type of raw data received from the transport
 * @template TOutput The type of processed data published to the EventHub
 * 
 * @description
 * SourceConnector establishes a one-way data flow from an external source into the EventHub.
 * It connects to a source transport that receives data from an external system and publishes
 * that data to a specified channel in the EventHub.
 * 
 * @example
 * // Define the types for your connector
 * interface ProcessedMessage {
 *   messageId: string;
 *   content: string;
 *   sender: string;
 *   timestamp: Date;
 * }
 * 
 * // Create a WebSocket source transport (implementation details omitted)
 * class WebSocketSource extends SourceTransport<string, ProcessedMessage> {
 *   // Implementation details...
 * }
 * 
 * // Create a connector that bridges the WebSocket source to the EventHub
 * class ChatConnector extends SourceConnector<string, ProcessedMessage> {
 *   constructor(eventHub: EventHub, url: string) {
 *     // Create the transport
 *     const transport = new WebSocketSource(url);
 *     
 *     // Initialize the connector with the transport and target channel
 *     super(eventHub, transport, "chat-messages");
 *   }
 *   
 *   // You can add custom methods specific to your connector
 *   getConnectionStatus() {
 *     return this.transport.isConnected() ? "Connected" : "Disconnected";
 *   }
 * }
 * 
 * // Usage in your application
 * const eventHub = new EventHub();
 * const chatConnector = new ChatConnector(eventHub, "wss://chat.example.com");
 * 
 * // Connect to start the flow of events from WebSocket to EventHub
 * await chatConnector.connect();
 * 
 * // Now you can subscribe to the chat messages in your application
 * eventHub.subscribe<ProcessedMessage>("chat-messages", (message) => {
 *   // Display the message in your UI
 *   displayChatMessage(message);
 * });
 * 
 * // Later, disconnect when no longer needed
 * await chatConnector.disconnect();
 */
export abstract class SourceConnector<TInput, TOutput> {
    /** The EventHub instance where events will be published */
    readonly eventHub: EventHub;
    /** The transport that receives data from the external source */
    readonly transport: SourceTransport<TInput, TOutput>;
    /** The channel where received events will be published */
    protected channel: string;

    /**
     * Creates a new SourceConnector instance
     * 
     * @param eventHub The EventHub instance to publish events to
     * @param transport The transport that will receive external data
     * @param channel The channel name where events will be published
     */
    constructor(
        eventHub: EventHub,
        transport: SourceTransport<TInput, TOutput>,
        channel: string
    ) {
        this.eventHub = eventHub;
        this.transport = transport;
        this.channel = channel;
    }
    
    /**
     * Establishes the connection to the external source
     * 
     * @description
     * This method performs two steps:
     * 1. Registers a handler with the transport to publish received data to the EventHub
     * 2. Connects the transport to start receiving data
     * 
     * @throws {Error} If connection fails or EventHub is not available
     */
    async connect(): Promise<void> {
        // First register the EventHub Handler
        this.transport.onData(async (data: TOutput) => {
            await this.eventHub.publish(this.channel, data);
        });

        await this.transport.connect();
    };

    /**
     * Terminates the connection to the external source
     * 
     * @description
     * Disconnects the transport, which stops the flow of data from the external source.
     * Any queued or in-flight messages may be lost.
     * 
     * @throws {Error} If disconnection fails
     */
    async disconnect(): Promise<void> {
        await this.transport.disconnect();
    }
}

/**
 * Implements an outbound data flow from the EventHub to an external transport
 * 
 * @template TInput The type of data received from the EventHub
 * @template TOutput The type of processed data sent to the transport
 * 
 * @description
 * SinkConnector establishes a one-way data flow from the EventHub to an external system.
 * It subscribes to a specified channel in the EventHub and forwards all events to a
 * sink transport that sends the data to an external system.
 * 
 * @example
 * // Define the types for your connector
 * interface OutgoingMessage {
 *   type: 'chat' | 'status';
 *   content: string;
 *   timestamp: number;
 * }
 * 
 * // Create a WebSocket sink transport (implementation details omitted)
 * class WebSocketSink extends SinkTransport<OutgoingMessage, string> {
 *   // Implementation details...
 * }
 * 
 * // Create a connector that bridges the EventHub to the WebSocket sink
 * class ChatOutputConnector extends SinkConnector<OutgoingMessage, string> {
 *   constructor(eventHub: EventHub, url: string) {
 *     // Create the transport
 *     const transport = new WebSocketSink(url);
 *     
 *     // Initialize the connector with the transport and source channel
 *     super(eventHub, transport, "outgoing-messages");
 *   }
 *   
 *   // You can add custom methods specific to your connector
 *   sendSystemMessage(content: string) {
 *     // Publish a system message to the EventHub channel
 *     this.eventHub.publish<OutgoingMessage>("outgoing-messages", {
 *       type: 'status',
 *       content: content,
 *       timestamp: Date.now()
 *     });
 *   }
 * }
 * 
 * // Usage in your application
 * const eventHub = new EventHub();
 * const chatOutput = new ChatOutputConnector(eventHub, "wss://chat.example.com");
 * 
 * // Connect to start the flow of events from EventHub to WebSocket
 * await chatOutput.connect();
 * 
 * // Now you can publish messages to the EventHub and they'll be sent to the WebSocket
 * eventHub.publish<OutgoingMessage>("outgoing-messages", {
 *   type: 'chat',
 *   content: 'Hello, everyone!',
 *   timestamp: Date.now()
 * });
 * 
 * // Or use the convenience method
 * chatOutput.sendSystemMessage("User has joined the chat");
 * 
 * // Later, disconnect when no longer needed
 * await chatOutput.disconnect();
 */
export abstract class SinkConnector<TInput, TOutput> {
    /** The EventHub instance to subscribe to for events */
    readonly eventHub: EventHub;
    /** The transport that sends data to the external system */
    readonly transport: SinkTransport<TInput, TOutput>;
    /** The channel to subscribe to for events */
    readonly channel: string;
    /** The subscription to the EventHub channel */
    protected subscription?: Subscription;

    /**
     * Creates a new SinkConnector instance
     * 
     * @param eventHub The EventHub instance to subscribe to
     * @param transport The transport that will send data externally
     * @param channel The channel name to subscribe to
     */
    constructor(
        eventHub: EventHub,
        transport: SinkTransport<TInput, TOutput>,
        channel: string
    ) {
        this.eventHub = eventHub;
        this.transport = transport;
        this.channel = channel;
    }
    
    /**
     * Establishes the connection to the external system
     * 
     * @description
     * This method performs two steps:
     * 1. Subscribes to the specified EventHub channel
     * 2. Connects the transport to enable sending data
     * 
     * @throws {Error} If connection fails or EventHub is not available
     */
    connect(): Promise<void> {
        // Subscribe to the Channel to receive events
        this.subscription = this.eventHub.subscribe(this.channel, async (data: TInput) => {
            await this.transport.send(data);
        });

        return this.transport.connect();
    }

    /**
     * Terminates the connection to the external system
     * 
     * @description
     * This method:
     * 1. Unsubscribes from the EventHub channel to stop receiving events
     * 2. Disconnects the transport
     * Any queued or in-flight messages may be lost.
     * 
     * @throws {Error} If disconnection fails
     */
    disconnect(): Promise<void> {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        return this.transport.disconnect();
    }
}
