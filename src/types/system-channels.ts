/**
 * System channels for EventHub
 * 
 * @description
 * This file contains the system channels used by EventHub for internal communication.
 */

/**
 * Component types
 */
export type ComponentType = 'transport' | 'connector' | 'eventhub';

/**
 * Lifecycle event types
 */
export type LifecycleEventType = 'initialize' | 'start' | 'stop' | 'destroy' | 'error';

/**
 * Configuration event types
 */
export type ConfigEventType = 'set' | 'get' | 'validate' | 'apply' | 'error';

/**
 * System channels
 */
export const SYSTEM_CHANNELS = {
  /**
   * Transport channels
   */
  TRANSPORT: {
    /**
     * Root channel for transport events
     */
    ROOT: 'system:transport',
    
    /**
     * State channel for transport events
     */
    STATE: 'system:transport:state',
    
    /**
     * Initialize channel for transport events
     */
    INITIALIZE: 'system:transport:initialize',
    
    /**
     * Start channel for transport events
     */
    START: 'system:transport:start',
    
    /**
     * Stop channel for transport events
     */
    STOP: 'system:transport:stop',
    
    /**
     * Destroy channel for transport events
     */
    DESTROY: 'system:transport:destroy',
    
    /**
     * Error channel for transport events
     */
    ERROR: 'system:transport:error'
  },
  
  /**
   * Connector channels
   */
  CONNECTOR: {
    /**
     * Root channel for connector events
     */
    ROOT: 'system:connector',
    
    /**
     * State channel for connector events
     */
    STATE: 'system:connector:state',
    
    /**
     * Initialize channel for connector events
     */
    INITIALIZE: 'system:connector:initialize',
    
    /**
     * Start channel for connector events
     */
    START: 'system:connector:start',
    
    /**
     * Stop channel for connector events
     */
    STOP: 'system:connector:stop',
    
    /**
     * Destroy channel for connector events
     */
    DESTROY: 'system:connector:destroy',
    
    /**
     * Error channel for connector events
     */
    ERROR: 'system:connector:error'
  },
  
  /**
   * EventHub channels
   */
  EVENTHUB: {
    /**
     * Root channel for eventhub events
     */
    ROOT: 'system:eventhub',
    
    /**
     * State channel for eventhub events
     */
    STATE: 'system:eventhub:state',
    
    /**
     * Initialize channel for eventhub events
     */
    INITIALIZE: 'system:eventhub:initialize',
    
    /**
     * Start channel for eventhub events
     */
    START: 'system:eventhub:start',
    
    /**
     * Stop channel for eventhub events
     */
    STOP: 'system:eventhub:stop',
    
    /**
     * Destroy channel for eventhub events
     */
    DESTROY: 'system:eventhub:destroy',
    
    /**
     * Error channel for eventhub events
     */
    ERROR: 'system:eventhub:error'
  },
  
  /**
   * Config channels
   */
  CONFIG: {
    /**
     * Root channel for config events
     */
    ROOT: 'system:config',
    
    /**
     * Set channel for config events
     */
    SET: 'system:config:set',
    
    /**
     * Get channel for config events
     */
    GET: 'system:config:get',
    
    /**
     * Validate channel for config events
     */
    VALIDATE: 'system:config:validate',
    
    /**
     * Apply channel for config events
     */
    APPLY: 'system:config:apply',
    
    /**
     * Error channel for config events
     */
    ERROR: 'system:config:error'
  }
};

/**
 * Get the state channel for a transport
 * 
 * @param transportId Transport ID
 * @returns State channel
 */
export function getTransportStateChannel(transportId: string): string {
  return `${SYSTEM_CHANNELS.TRANSPORT.STATE}/${transportId}`;
}

/**
 * Get the state channel for a connector
 * 
 * @param connectorId Connector ID
 * @returns State channel
 */
export function getConnectorStateChannel(connectorId: string): string {
  return `${SYSTEM_CHANNELS.CONNECTOR.STATE}/${connectorId}`;
}

/**
 * Get the state channel for a component
 * 
 * @param componentType Component type
 * @param componentId Component ID
 * @returns State channel
 */
export function getStateChannel(componentType: ComponentType, componentId: string): string {
  switch (componentType) {
    case 'transport':
      return getTransportStateChannel(componentId);
    case 'connector':
      return getConnectorStateChannel(componentId);
    case 'eventhub':
      return SYSTEM_CHANNELS.EVENTHUB.STATE;
    default:
      return `system:${componentType}:state/${componentId}`;
  }
}

/**
 * Get the lifecycle channel for a component
 * 
 * @param event Lifecycle event type
 * @param componentType Component type
 * @param componentId Optional component ID
 * @returns Lifecycle channel
 */
export function getLifecycleChannel(
  event: LifecycleEventType,
  componentType: ComponentType,
  componentId?: string
): string {
  let channel: string;
  
  // Get the base channel based on component type and event
  switch (componentType) {
    case 'transport':
      switch (event) {
        case 'initialize':
          channel = SYSTEM_CHANNELS.TRANSPORT.INITIALIZE;
          break;
        case 'start':
          channel = SYSTEM_CHANNELS.TRANSPORT.START;
          break;
        case 'stop':
          channel = SYSTEM_CHANNELS.TRANSPORT.STOP;
          break;
        case 'destroy':
          channel = SYSTEM_CHANNELS.TRANSPORT.DESTROY;
          break;
        case 'error':
          channel = SYSTEM_CHANNELS.TRANSPORT.ERROR;
          break;
        default:
          channel = SYSTEM_CHANNELS.TRANSPORT.ROOT;
          break;
      }
      break;
    case 'connector':
      switch (event) {
        case 'initialize':
          channel = SYSTEM_CHANNELS.CONNECTOR.INITIALIZE;
          break;
        case 'start':
          channel = SYSTEM_CHANNELS.CONNECTOR.START;
          break;
        case 'stop':
          channel = SYSTEM_CHANNELS.CONNECTOR.STOP;
          break;
        case 'destroy':
          channel = SYSTEM_CHANNELS.CONNECTOR.DESTROY;
          break;
        case 'error':
          channel = SYSTEM_CHANNELS.CONNECTOR.ERROR;
          break;
        default:
          channel = SYSTEM_CHANNELS.CONNECTOR.ROOT;
          break;
      }
      break;
    case 'eventhub':
      switch (event) {
        case 'initialize':
          channel = SYSTEM_CHANNELS.EVENTHUB.INITIALIZE;
          break;
        case 'start':
          channel = SYSTEM_CHANNELS.EVENTHUB.START;
          break;
        case 'stop':
          channel = SYSTEM_CHANNELS.EVENTHUB.STOP;
          break;
        case 'destroy':
          channel = SYSTEM_CHANNELS.EVENTHUB.DESTROY;
          break;
        case 'error':
          channel = SYSTEM_CHANNELS.EVENTHUB.ERROR;
          break;
        default:
          channel = SYSTEM_CHANNELS.EVENTHUB.ROOT;
          break;
      }
      break;
    default:
      // For unknown component types, use a generic channel format
      channel = `system:${componentType}:${event}`;
      break;
  }
  
  // Append component ID if provided
  if (componentId) {
    channel = `${channel}/${componentId}`;
  }
  
  return channel;
}

/**
 * Get the config channel for a component
 * 
 * @param event Config event type
 * @param componentType Optional component type
 * @param componentId Optional component ID
 * @returns Config channel
 */
export function getConfigChannel(
  event: ConfigEventType,
  componentType?: ComponentType,
  componentId?: string
): string {
  let channel: string;
  
  // Get the base channel based on event type
  switch (event) {
    case 'set':
      channel = SYSTEM_CHANNELS.CONFIG.SET;
      break;
    case 'get':
      channel = SYSTEM_CHANNELS.CONFIG.GET;
      break;
    case 'validate':
      channel = SYSTEM_CHANNELS.CONFIG.VALIDATE;
      break;
    case 'apply':
      channel = SYSTEM_CHANNELS.CONFIG.APPLY;
      break;
    case 'error':
      channel = SYSTEM_CHANNELS.CONFIG.ERROR;
      break;
    default:
      channel = SYSTEM_CHANNELS.CONFIG.ROOT;
      break;
  }
  
  // Append component type and ID if provided
  if (componentType) {
    channel = `${channel}:${componentType}`;
    
    if (componentId) {
      channel = `${channel}:${componentId}`;
    }
  }
  
  return channel;
}
