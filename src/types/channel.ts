/**
 * Channel type definitions
 */

/**
 * Type representing a unique identifier for a channel in the event system
 */
export type ChannelId = string;

/**
 * Type representing a unique identifier for a callback subscription
 */
export type CallbackId = number;

/**
 * Event callback function type
 */
export type EventCallback<TData> = (data: TData) => void | Promise<void>;

/**
 * Subscription options
 */
export interface SubscribeOptions {
  /**
   * Whether to replay the last event when subscribing
   */
  replay?: boolean;
  
  /**
   * Group name for the subscription
   */
  group?: string;
}

/**
 * Subscription object returned from subscribe
 */
export interface Subscription {
  /**
   * Unique ID for the subscription
   */
  id: number;
  
  /**
   * Function to unsubscribe
   */
  unsubscribe: () => void;
}

/**
 * Callback list type
 */
export type CallbackList<TData> = Map<CallbackId, EventCallback<TData>>;

/**
 * Channel metrics
 */
export interface ChannelMetrics {
  /**
   * Number of events published on the channel
   */
  publishCount: number;
  
  /**
   * Number of errors that occurred during callback execution
   */
  errorCount: number;
  
  /**
   * Timestamp of the last publish
   */
  lastPublishTime: number;
}

/**
 * Channel interface
 */
export interface IChannel<TData> {
  /**
   * Subscribe to events on the channel
   * 
   * @param callback Function to call when an event is published
   * @param options Optional subscription options
   * @returns Subscription object
   */
  subscribe(callback: EventCallback<TData>, options?: SubscribeOptions): Subscription;
  
  /**
   * Publish an event to the channel
   * 
   * @param data Event data
   */
  publish(data: TData): Promise<void>;
  
  /**
   * Get the last event published on the channel
   */
  readonly lastEvent: TData | undefined;
  
  /**
   * Get the name of the channel
   */
  readonly name: string;
  
  /**
   * Get the callbacks subscribed to the channel
   */
  readonly callbacks: CallbackList<TData>;
  
  /**
   * Get the metrics for the channel
   */
  readonly metrics: ChannelMetrics;
}
