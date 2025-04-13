/**
 * EventHub main exports
 */

// Core components
export { Channel } from './channel';
export { EventHub } from './event-hub';

// Factory components
export { BaseFactory, FactoryRegistry } from './factory/base-factory';
export { ConnectorFactory } from './factory/connector-factory';
export { TransportFactory } from './factory/transport-factory';

// Lifecycle components
export { EventHubLifecycle } from './lifecycle/eventhub-lifecycle';

// Type exports
export * from './types';
