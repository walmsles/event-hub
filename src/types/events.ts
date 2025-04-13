/**
 * Event types for the EventHub system
 * 
 * @description
 * This file contains all the event-related interfaces used throughout the EventHub system.
 * These interfaces provide type safety for events published to system channels.
 */
import { ValidationResult } from './config';
import { ConnectionState } from './lifecycle';
import { ComponentType, ConfigEvent as ConfigEventType,LifecycleEvent as LifecycleEventType } from './system-channels';

/**
 * Base interface for all system events
 */
export interface SystemEvent {
  /**
   * Timestamp when the event was created (milliseconds since epoch)
   */
  timestamp: number;
  
  /**
   * Type of the event
   */
  type: string;
  
  /**
   * Component that generated the event
   */
  source: {
    /**
     * Type of component
     */
    type: ComponentType;
    
    /**
     * ID of the component
     */
    id: string;
  };
}

/**
 * State change event
 */
export interface StateChangeEvent extends SystemEvent {
  /**
   * Type of the event
   */
  type: 'state-change';
  
  /**
   * Previous state
   */
  previousState?: ConnectionState;
  
  /**
   * New state
   */
  newState: ConnectionState;
}

/**
 * Lifecycle event
 */
export interface LifecycleEventData extends SystemEvent {
  /**
   * Type of the event
   */
  type: 'lifecycle';
  
  /**
   * Lifecycle action
   */
  action: LifecycleEventType;
  
  /**
   * Error if action is 'error'
   */
  error?: Error;
  
  /**
   * Additional data
   */
  data?: Record<string, unknown>;
}

/**
 * Configuration event
 */
export interface ConfigEventData extends SystemEvent {
  /**
   * Type of the event
   */
  type: 'config';
  
  /**
   * Configuration action
   */
  action: ConfigEventType;
  
  /**
   * Configuration data
   */
  config: Record<string, unknown>;
  
  /**
   * Validation result if action is 'validated' or 'error'
   */
  validation?: ValidationResult;
}

/**
 * Transport event
 */
export interface TransportEvent extends SystemEvent {
  /**
   * Type of the event
   */
  type: 'transport';
  
  /**
   * Transport action
   */
  action: 'connected' | 'disconnected' | 'message-received' | 'message-sent' | 'error';
  
  /**
   * Message data if action is 'message-received' or 'message-sent'
   */
  message?: unknown;
  
  /**
   * Error if action is 'error'
   */
  error?: Error;
}

/**
 * Connector event
 */
export interface ConnectorEvent extends SystemEvent {
  /**
   * Type of the event
   */
  type: 'connector';
  
  /**
   * Connector action
   */
  action: 'connected' | 'disconnected' | 'message-published' | 'message-received' | 'error';
  
  /**
   * Channel the message was published to or received from
   */
  channel?: string;
  
  /**
   * Message data if action is 'message-published' or 'message-received'
   */
  message?: unknown;
  
  /**
   * Error if action is 'error'
   */
  error?: Error;
}

/**
 * Error event
 */
export interface ErrorEvent extends SystemEvent {
  /**
   * Type of the event
   */
  type: 'error';
  
  /**
   * Error that occurred
   */
  error: Error;
  
  /**
   * Context in which the error occurred
   */
  context?: Record<string, unknown>;
  
  /**
   * Severity of the error
   */
  severity: 'warning' | 'error' | 'fatal';
}

/**
 * Union type of all system events
 */
export type EventTypes = 
  | StateChangeEvent
  | LifecycleEventData
  | ConfigEventData
  | TransportEvent
  | ConnectorEvent
  | ErrorEvent;
