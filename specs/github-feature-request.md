# Configurable Factory Pattern

## Overview
Enhance the EventHub core library with a standardized configuration system and factory pattern for managing transports and connectors. This enhancement aims to provide a consistent, type-safe way to configure and instantiate EventHub components while maintaining framework independence.

## Goals
1. Standardize configuration of EventHub components
2. Provide type-safe factory patterns for transports and connectors
3. Simplify framework integration
4. Enable runtime registration of custom components
5. Improve lifecycle management
6. Enhance error handling and state management

## Core Components

### Configuration Types

```typescript
interface TransportConfig {
  id: string;
  type: string;
  options?: Record<string, any>;
}

interface ConnectorConfig {
  id: string;
  type: 'source' | 'sink' | 'both';
  options?: {
    transportId?: string;
    channels?: string[];
    [key: string]: any;
  };
}

interface EventHubConfig {
  transports?: TransportConfig[];
  connectors?: ConnectorConfig[];
}

interface ConnectionState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  timestamp: number;
  error?: Error;
}
```

### Factory System

```typescript
interface FactoryRegistry<T> {
  register(type: string, implementation: new (...args: any[]) => T): void;
  create(type: string, options: any): T;
  unregister(type: string): void;
  hasType(type: string): boolean;
}

class TransportFactory implements FactoryRegistry<BaseTransport> {
  // Implementation for transport creation
}

class ConnectorFactory implements FactoryRegistry<BaseConnector> {
  // Implementation for connector creation
}
```

### Enhanced EventHub Class
```typescript
class EventHub {
  constructor(config?: EventHubConfig);
  configure(config: EventHubConfig): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConnector(id: string): BaseConnector | undefined;
  getTransport(id: string): BaseTransport | undefined;
  onStateChange(callback: (state: ConnectionState) => void): () => void;
}
```

## Implementation Details
### Configuration System
The configuration system should:

Support declarative configuration through JSON-like structures

Allow runtime updates to configuration

Validate configurations before applying them

Support dependency injection between transports and connectors

Example:
```typescript

const config: EventHubConfig = {
  transports: [{
    id: 'ws1',
    type: 'websocket',
    options: {
      url: 'wss://example.com',
      protocols: ['v1']
    }
  }],
  connectors: [{
    id: 'source1',
    type: 'source',
    options: {
      transportId: 'ws1',
      channels: ['notifications']
    }
  }]
};
```

### Factory Pattern Implementation
```typescript
class BaseFactory<T> implements FactoryRegistry<T> {
  private registry = new Map<string, new (...args: any[]) => T>();

  register(type: string, implementation: new (...args: any[]) => T): void {
    this.registry.set(type, implementation);
  }

  create(type: string, options: any): T {
    const Implementation = this.registry.get(type);
    if (!Implementation) {
      throw new Error(`No implementation registered for type: ${type}`);
    }
    return new Implementation(options);
  }

  unregister(type: string): void {
    this.registry.delete(type);
  }

  hasType(type: string): boolean {
    return this.registry.has(type);
  }
}
```

### Lifecycle Management
```typescript
interface LifecycleManager {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
}

class EventHubLifecycle implements LifecycleManager {
  private eventHub: EventHub;
  private state: ConnectionState;

  constructor(eventHub: EventHub) {
    this.eventHub = eventHub;
    this.state = { status: 'disconnected', timestamp: Date.now() };
  }

  // Implementation of lifecycle methods
}
```

### API Changes
1. New Methods
```typescript

// EventHub
configure(config: EventHubConfig): Promise<void>
registerTransport(type: string, implementation: typeof BaseTransport): void
registerConnector(type: string, implementation: typeof BaseConnector): void
getState(): ConnectionState
onStateChange(callback: (state: ConnectionState) => void): () => void

// BaseTransport
initialize(options: any): Promise<void>
validate(options: any): boolean

// BaseConnector
initialize(options: any): Promise<void>
validate(options: any): boolean
```

### Modified Methods
```typescript
// EventHub
constructor(config?: EventHubConfig)
connect(): Promise<void>
disconnect(): Promise<void>
```

## Usage Examples
### Basic Configuration
```typescript
const eventHub = new EventHub({
  transports: [{
    id: 'ws1',
    type: 'websocket',
    options: { url: 'wss://example.com' }
  }],
  connectors: [{
    id: 'source1',
    type: 'source',
    options: { transportId: 'ws1' }
  }]
});
```

### Custom Component Registration
```typescript
class CustomTransport extends BaseTransport {
  // Implementation
}

EventHub.registerTransport('custom', CustomTransport);

const config = {
  transports: [{
    id: 'custom1',
    type: 'custom',
    options: { /* custom options */ }
  }]
};
```

### State Management
```typescript
eventHub.onStateChange((state) => {
  console.log(`Connection state: ${state.status}`);
  if (state.error) {
    console.error('Connection error:', state.error);
  }
});
```

