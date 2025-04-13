/**
 * Lifecycle management types for the EventHub system
 * 
 * @description
 * This file contains all the lifecycle-related interfaces and enums used throughout the EventHub system.
 * These types provide a consistent way to manage component lifecycles and state.
 */
import { ComponentType } from './system-channels';

/**
 * Lifecycle state for components
 */
export enum LifecycleState {
  /**
   * Component is in the process of initializing
   */
  INITIALIZING = 'initializing',
  
  /**
   * Component is initialized but not yet connected
   */
  INITIALIZED = 'initialized',
  
  /**
   * Component is in the process of connecting
   */
  CONNECTING = 'connecting',
  
  /**
   * Component is successfully connected
   */
  CONNECTED = 'connected',
  
  /**
   * Component is in the process of disconnecting
   */
  DISCONNECTING = 'disconnecting',
  
  /**
   * Component is disconnected
   */
  DISCONNECTED = 'disconnected',
  
  /**
   * Component encountered an error
   */
  ERROR = 'error'
}

/**
 * State of a connection
 */
export interface ConnectionState {
  /**
   * Current status of the connection
   */
  status: LifecycleState;
  
  /**
   * Timestamp when the state was updated (milliseconds since epoch)
   */
  timestamp: number;
  
  /**
   * Error that occurred, if any
   */
  error?: Error;
  
  /**
   * Component ID that this state belongs to
   */
  componentId: string;
  
  /**
   * Component type (transport or connector)
   */
  componentType: ComponentType;
  
  /**
   * Additional metadata about the state
   */
  metadata?: Record<string, unknown>;
}

/**
 * Component initialization options
 */
export interface InitOptions {
  /**
   * Whether to auto-connect after initialization
   */
  autoConnect?: boolean;
  
  /**
   * Timeout for connection attempts in milliseconds
   */
  connectionTimeout?: number;
  
  /**
   * Whether to enable debug logging
   */
  debug?: boolean;
  
  /**
   * Retry configuration
   */
  retry?: {
    /**
     * Maximum number of retry attempts
     */
    maxAttempts: number;
    
    /**
     * Base delay between retries in milliseconds
     */
    baseDelay: number;
    
    /**
     * Maximum delay between retries in milliseconds
     */
    maxDelay: number;
    
    /**
     * Whether to use exponential backoff
     */
    exponential: boolean;
  };
  
  /**
   * Additional component-specific options
   */
  [key: string]: unknown;
}

/**
 * EventHub configuration
 */
export interface EventHubConfig {
  /**
   * Whether to enable debug logging
   */
  debug?: boolean;
  
  /**
   * Whether to auto-connect components after initialization
   */
  autoConnect?: boolean;
  
  /**
   * Additional configuration options
   */
  [key: string]: unknown;
}
