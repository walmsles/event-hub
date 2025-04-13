/**
 * Configuration types for EventHub
 */

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
    type: 'source' | 'sink' | 'both';
    
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
         * Additional options
         */
        [key: string]: unknown;
    };
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
     * Whether to auto-connect after initialization
     */
    autoConnect?: boolean;
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
}
