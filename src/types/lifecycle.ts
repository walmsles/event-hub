/**
 * Lifecycle state enum
 */
export enum LifecycleState {
  CREATED = 'created',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

/**
 * Connection state interface
 */
export interface ConnectionState {
  /**
   * Status of the connection
   */
  status: LifecycleState | string;
  
  /**
   * Timestamp of the state change
   */
  timestamp: number;
  
  /**
   * Type of component
   */
  componentType: string;
  
  /**
   * ID of the component
   */
  componentId?: string;
  
  /**
   * Error if status is 'error'
   */
  error?: Error;
}

/**
 * Initialization options
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
}

/**
 * Lifecycle management interface
 */
export interface LifecycleManager {
  /**
   * Initialize the component
   */
  initialize(): Promise<void>;
  
  /**
   * Start the component
   */
  start(): Promise<void>;
  
  /**
   * Stop the component
   */
  stop(): Promise<void>;
  
  /**
   * Destroy the component and clean up resources
   */
  destroy(): Promise<void>;
  
  /**
   * Get the current state of the component
   */
  getState(): ConnectionState;
  
  /**
   * Register a callback to be notified of state changes
   * @param callback Function to call when state changes
   * @returns Function to unregister the callback
   */
  onStateChange(callback: (state: ConnectionState) => void): () => void;
}
