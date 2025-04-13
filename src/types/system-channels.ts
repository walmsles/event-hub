/**
 * System channel utilities for EventHub
 */

/**
 * Component types for system channels
 */
export type ComponentType = 'eventhub' | 'transport' | 'connector' | 'pipeline';

/**
 * Operation types for system channels
 */
export type OperationType = 'set' | 'apply' | 'error';

/**
 * Configuration event types
 */
export enum ConfigEventType {
  SET = 'set',
  APPLY = 'apply',
  ERROR = 'error'
}

/**
 * Lifecycle event types
 */
export enum LifecycleEventType {
  INITIALIZE = 'initialize',
  START = 'start',
  STOP = 'stop',
  DESTROY = 'destroy'
}

/**
 * System channels namespace
 */
export const SYSTEM_CHANNELS = {
  CONFIG: 'system:config',
  STATE: 'system:state',
  LIFECYCLE: 'system:lifecycle'
};

/**
 * Get a configuration channel name
 * 
 * @param operation The operation type
 * @param componentType The component type
 * @param id Optional component ID
 * @returns The channel name
 */
export function getConfigChannel(
  operation: OperationType | ConfigEventType,
  componentType: ComponentType,
  id?: string
): string {
  const base = `${SYSTEM_CHANNELS.CONFIG}:${operation}:${componentType}`;
  return id ? `${base}:${id}` : base;
}

/**
 * Get a state channel name
 * 
 * @param componentType The component type
 * @param id Optional component ID
 * @returns The channel name
 */
export function getStateChannel(
  componentType: ComponentType,
  id?: string
): string {
  const base = `${SYSTEM_CHANNELS.STATE}:${componentType}`;
  return id ? `${base}:${id}` : base;
}

/**
 * Get a lifecycle channel name
 * 
 * @param event The lifecycle event type
 * @param componentType The component type
 * @param id Optional component ID
 * @returns The channel name
 */
export function getLifecycleChannel(
  event: LifecycleEventType,
  componentType: ComponentType,
  id?: string
): string {
  const base = `${SYSTEM_CHANNELS.LIFECYCLE}:${event}:${componentType}`;
  return id ? `${base}:${id}` : base;
}

/**
 * Get a transport state channel name
 * 
 * @param id Optional transport ID
 * @returns The channel name
 */
export function getTransportStateChannel(id?: string): string {
  return getStateChannel('transport', id);
}

/**
 * Get a connector state channel name
 * 
 * @param id Optional connector ID
 * @returns The channel name
 */
export function getConnectorStateChannel(id?: string): string {
  return getStateChannel('connector', id);
}
