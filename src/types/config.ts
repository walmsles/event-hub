/**
 * Configuration types for the EventHub system
 * 
 * @description
 * This file contains all the configuration interfaces used throughout the EventHub system.
 * These interfaces provide type safety for configuring transports, connectors, and the EventHub itself.
 */
import { InitOptions } from './lifecycle';

/**
 * Configuration for a transport
 */
export interface TransportConfig {
  /**
   * Unique identifier for the transport
   */
  id: string;
  
  /**
   * Type of transport to create
   */
  type: string;
  
  /**
   * Optional configuration options for the transport
   */
  options?: Record<string, unknown>;
  
  /**
   * Initialization options for the transport
   */
  init?: InitOptions;
}

/**
 * Configuration for a connector
 */
export interface ConnectorConfig {
  /**
   * Unique identifier for the connector
   */
  id: string;
  
  /**
   * Type of connector to create
   */
  type: 'source' | 'sink';
  
  /**
   * Optional configuration options for the connector
   */
  options?: {
    /**
     * ID of the transport to use with this connector
     */
    transportId?: string;
    
    /**
     * Channel to subscribe to or publish on
     */
    channel?: string;
    
    /**
     * Multiple channels to subscribe to or publish on
     */
    channels?: string[];
    
    /**
     * Additional options specific to the connector implementation
     */
    [key: string]: unknown;
  };
  
  /**
   * Initialization options for the connector
   */
  init?: InitOptions;
}

/**
 * Configuration for an EventHub
 */
export interface EventHubConfig {
  /**
   * Transports to create
   */
  transports?: TransportConfig[];
  
  /**
   * Connectors to create
   */
  connectors?: ConnectorConfig[];
  
  /**
   * Debug mode configuration
   */
  debug?: boolean;
  
  /**
   * Default options to apply to all transports
   */
  defaultTransportOptions?: Record<string, unknown>;
  
  /**
   * Default options to apply to all connectors
   */
  defaultConnectorOptions?: Record<string, unknown>;
  
  /**
   * Default initialization options
   */
  defaultInitOptions?: InitOptions;
  
  /**
   * Whether to automatically connect all components after initialization
   */
  autoConnect?: boolean;
  
  /**
   * Whether to publish system events to the EventHub
   */
  publishSystemEvents?: boolean;
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  /**
   * Whether the validation was successful
   */
  valid: boolean;
  
  /**
   * Error message if validation failed
   */
  error?: string;
  
  /**
   * Field that failed validation
   */
  field?: string;
  
  /**
   * Nested validation results for complex objects
   */
  nested?: Record<string, ValidationResult>;
}
