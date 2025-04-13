/**
 * System channel definitions for the EventHub
 * 
 * @description
 * This file defines the standard system channels used by the EventHub for internal
 * communication, state management, and lifecycle events. These channels follow a
 * hierarchical pattern to allow for flexible subscription patterns.
 */

/**
 * Component types in the system
 */
export type ComponentType = 'transport' | 'connector' | 'eventhub';

/**
 * Lifecycle event types
 */
export type LifecycleEvent = 'initialized' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';

/**
 * Configuration event types
 */
export type ConfigEvent = 'updated' | 'validated' | 'error';

/**
 * System channel namespace with strongly typed channel strings
 */
export const SYSTEM_CHANNELS = {
  /**
   * State management channels
   */
  STATE: {
    /**
     * Root channel for all state events
     */
    ROOT: 'system:state' as const,
    
    /**
     * Transport state events
     * Subscribe to 'system:state:transports/*' for all transport states
     */
    TRANSPORTS: 'system:state:transports' as const,
    
    /**
     * Connector state events
     * Subscribe to 'system:state:connectors/*' for all connector states
     */
    CONNECTORS: 'system:state:connectors' as const,
    
    /**
     * EventHub state events
     */
    EVENTHUB: 'system:state:eventhub' as const
  },
  
  /**
   * Lifecycle event channels
   */
  LIFECYCLE: {
    /**
     * Root channel for all lifecycle events
     */
    ROOT: 'system:lifecycle' as const,
    
    /**
     * Initialization events
     */
    INITIALIZED: 'system:lifecycle:initialized' as const,
    
    /**
     * Connection events
     */
    CONNECTING: 'system:lifecycle:connecting' as const,
    CONNECTED: 'system:lifecycle:connected' as const,
    
    /**
     * Disconnection events
     */
    DISCONNECTING: 'system:lifecycle:disconnecting' as const,
    DISCONNECTED: 'system:lifecycle:disconnected' as const,
    
    /**
     * Error events
     */
    ERROR: 'system:lifecycle:error' as const
  },
  
  /**
   * Configuration events
   */
  CONFIG: {
    /**
     * Root channel for all configuration events
     */
    ROOT: 'system:config' as const,
    
    /**
     * Configuration update events
     */
    UPDATED: 'system:config:updated' as const,
    
    /**
     * Configuration validation events
     */
    VALIDATED: 'system:config:validated' as const,
    
    /**
     * Configuration error events
     */
    ERROR: 'system:config:error' as const
  },
  
  /**
   * Error events
   */
  ERROR: {
    /**
     * Root channel for all error events
     */
    ROOT: 'system:error' as const,
    
    /**
     * Transport error events
     */
    TRANSPORT: 'system:error:transport' as const,
    
    /**
     * Connector error events
     */
    CONNECTOR: 'system:error:connector' as const,
    
    /**
     * EventHub error events
     */
    EVENTHUB: 'system:error:eventhub' as const
  }
};

/**
 * Helper function to create a transport-specific state channel
 * 
 * @param transportId The ID of the transport
 * @returns The channel name for the transport's state
 */
export function getTransportStateChannel(transportId: string): string {
  return `${SYSTEM_CHANNELS.STATE.TRANSPORTS}/${transportId}`;
}

/**
 * Helper function to create a connector-specific state channel
 * 
 * @param connectorId The ID of the connector
 * @returns The channel name for the connector's state
 */
export function getConnectorStateChannel(connectorId: string): string {
  return `${SYSTEM_CHANNELS.STATE.CONNECTORS}/${connectorId}`;
}

/**
 * Helper function to create a component-specific state channel
 * 
 * @param componentType The type of component (transport, connector, eventhub)
 * @param componentId The ID of the component
 * @returns The channel name for the component's state
 */
export function getStateChannel(componentType: ComponentType, componentId: string): string {
  switch (componentType) {
    case 'transport':
      return getTransportStateChannel(componentId);
    case 'connector':
      return getConnectorStateChannel(componentId);
    case 'eventhub':
      return SYSTEM_CHANNELS.STATE.EVENTHUB;
    default:
      return `${SYSTEM_CHANNELS.STATE.ROOT}/${componentType}/${componentId}`;
  }
}

/**
 * Helper function to create a lifecycle event channel
 * 
 * @param event The lifecycle event (initialized, connected, disconnected, error)
 * @param componentType The type of component (optional)
 * @param componentId The ID of the component (optional)
 * @returns The channel name for the lifecycle event
 */
export function getLifecycleChannel(
  event: LifecycleEvent,
  componentType?: ComponentType,
  componentId?: string
): string {
  let channel: string;
  
  switch (event) {
    case 'initialized':
      channel = SYSTEM_CHANNELS.LIFECYCLE.INITIALIZED;
      break;
    case 'connecting':
      channel = SYSTEM_CHANNELS.LIFECYCLE.CONNECTING;
      break;
    case 'connected':
      channel = SYSTEM_CHANNELS.LIFECYCLE.CONNECTED;
      break;
    case 'disconnecting':
      channel = SYSTEM_CHANNELS.LIFECYCLE.DISCONNECTING;
      break;
    case 'disconnected':
      channel = SYSTEM_CHANNELS.LIFECYCLE.DISCONNECTED;
      break;
    case 'error':
      channel = SYSTEM_CHANNELS.LIFECYCLE.ERROR;
      break;
    default:
      channel = SYSTEM_CHANNELS.LIFECYCLE.ROOT;
  }
  
  if (componentType) {
    channel = `${channel}:${componentType}`;
    
    if (componentId) {
      channel = `${channel}/${componentId}`;
    }
  }
  
  return channel;
}

/**
 * Helper function to create an error event channel
 * 
 * @param componentType The type of component (optional)
 * @param componentId The ID of the component (optional)
 * @returns The channel name for the error event
 */
export function getErrorChannel(
  componentType?: ComponentType,
  componentId?: string
): string {
  let channel: string = SYSTEM_CHANNELS.ERROR.ROOT;
  
  if (componentType) {
    switch (componentType) {
      case 'transport':
        channel = SYSTEM_CHANNELS.ERROR.TRANSPORT;
        break;
      case 'connector':
        channel = SYSTEM_CHANNELS.ERROR.CONNECTOR;
        break;
      case 'eventhub':
        channel = SYSTEM_CHANNELS.ERROR.EVENTHUB;
        break;
    }
    
    if (componentId) {
      channel = `${channel}/${componentId}`;
    }
  }
  
  return channel;
}
