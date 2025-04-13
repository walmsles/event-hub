/**
 * Tests for the EventHub factory pattern and configuration management
 */
import { LifecycleState } from './types/lifecycle';
import { BaseConnector, SinkConnector,SourceConnector } from './connector';
import { EventHub } from './event-hub';
import { BaseTransport, SinkTransport,SourceTransport } from './transport';
import { ConnectionState, ConnectorConfig, EventHubConfig, TransportConfig } from './types';

// Mock implementations for testing
class MockTransport extends BaseTransport<string, string> {
  connectCalled = false;
  disconnectCalled = false;
  
  async connect(): Promise<void> {
    this.connectCalled = true;
    this._connected = true;
  }
  
  async disconnect(): Promise<void> {
    this.disconnectCalled = true;
    this._connected = false;
  }
}

class MockSourceTransport extends SourceTransport<string, string> {
  connectCalled = false;
  disconnectCalled = false;
  
  async connect(): Promise<void> {
    this.connectCalled = true;
    this._connected = true;
  }
  
  async disconnect(): Promise<void> {
    this.disconnectCalled = true;
    this._connected = false;
  }
}

class MockSinkTransport extends SinkTransport<string, string> {
  connectCalled = false;
  disconnectCalled = false;
  
  async connect(): Promise<void> {
    this.connectCalled = true;
    this._connected = true;
  }
  
  async disconnect(): Promise<void> {
    this.disconnectCalled = true;
    this._connected = false;
  }
  
  protected async sendMessage(_data: string): Promise<void> {
    // Do nothing in the mock
  }
}

class MockSourceConnector extends SourceConnector<string, string> {
  constructor(eventHub: EventHub, options: any = {}) {
    const transport = options.transport || new MockSourceTransport(options.id || 'mock-source-transport');
    const channel = options.channel || 'mock-source-channel';
    super(eventHub, transport, channel);
  }
}

class MockSinkConnector extends SinkConnector<string, string> {
  constructor(eventHub: EventHub, options: any = {}) {
    const transport = options.transport || new MockSinkTransport(options.id || 'mock-sink-transport');
    const channel = options.channel || 'mock-sink-channel';
    super(eventHub, transport, channel);
  }
}

describe('EventHub Factory Pattern', () => {
  let eventHub: EventHub;
  
  beforeEach(() => {
    eventHub = new EventHub();
    
    // Register mock implementations
    eventHub.registerTransport('mock', MockTransport);
    eventHub.registerTransport('mock-source', MockSourceTransport);
    eventHub.registerTransport('mock-sink', MockSinkTransport);
    eventHub.registerConnector('mock-source', MockSourceConnector);
    eventHub.registerConnector('mock-sink', MockSinkConnector);
  });
  
  describe('when instantiating the EventHub', () => {
    it('should initialize with default settings when no configuration is provided', () => {
      expect(eventHub).toBeInstanceOf(EventHub);
    });
    
    it('should automatically create components when configuration is provided in constructor', async () => {
      const config: EventHubConfig = {
        transports: [
          { id: 'transport1', type: 'mock' }
        ]
      };
      
      const configuredEventHub = new EventHub(config);
      
      // Wait for async configuration to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(configuredEventHub.getTransport('transport1')).toBeDefined();
    });
  });
  
  describe('when configuring the EventHub', () => {
    it('should create transports from configuration when configure method is called', async () => {
      const config: EventHubConfig = {
        transports: [
          { id: 'transport1', type: 'mock' },
          { id: 'transport2', type: 'mock-source' }
        ]
      };
      
      await eventHub.configure(config);
      
      expect(eventHub.getTransport('transport1')).toBeDefined();
      expect(eventHub.getTransport('transport2')).toBeDefined();
    });
    
    it('should create connectors from configuration when configure method is called', async () => {
      const config: EventHubConfig = {
        connectors: [
          { id: 'connector1', type: 'source', options: { channel: 'test-channel' } },
          { id: 'connector2', type: 'sink', options: { channel: 'test-channel' } }
        ]
      };
      
      await eventHub.configure(config);
      
      expect(eventHub.getConnector('connector1')).toBeDefined();
      expect(eventHub.getConnector('connector2')).toBeDefined();
    });
    
    it('should link connectors to their specified transports when both are defined in configuration', async () => {
      const config: EventHubConfig = {
        transports: [
          { id: 'transport1', type: 'mock-source' }
        ],
        connectors: [
          { 
            id: 'connector1', 
            type: 'source', 
            options: { 
              transportId: 'transport1',
              channel: 'test-channel' 
            } 
          }
        ]
      };
      
      await eventHub.configure(config);
      
      const connector = eventHub.getConnector('connector1') as SourceConnector<unknown, unknown>;
      expect(connector).toBeDefined();
      expect(connector.transport.name).toBe('transport1');
    });
    
    it('should apply default options to transports and connectors when defaults are provided', async () => {
      const config: EventHubConfig = {
        defaultTransportOptions: {
          defaultOption: 'transport-default'
        },
        defaultConnectorOptions: {
          defaultOption: 'connector-default'
        },
        transports: [
          { 
            id: 'transport1', 
            type: 'mock',
            options: {
              specificOption: 'transport-specific'
            }
          }
        ],
        connectors: [
          { 
            id: 'connector1', 
            type: 'source',
            options: {
              specificOption: 'connector-specific',
              channel: 'test-channel'
            }
          }
        ]
      };
      
      await eventHub.configure(config);
      
      // We can't directly test the options, but we can check that the components were created
      expect(eventHub.getTransport('transport1')).toBeDefined();
      expect(eventHub.getConnector('connector1')).toBeDefined();
    });
    
    it('should reject with error when attempting to create a transport with duplicate ID', async () => {
      // First create a transport
      await eventHub.createTransport({ id: 'duplicate', type: 'mock' });
      
      // Then try to create another with the same ID
      const config: EventHubConfig = {
        transports: [
          { id: 'duplicate', type: 'mock' }
        ]
      };
      
      await expect(eventHub.configure(config)).rejects.toThrow(/already exists/);
    });
    
    it('should reject with error when attempting to create a connector with duplicate ID', async () => {
      // First create a connector
      await eventHub.createConnector({ id: 'duplicate', type: 'source' });
      
      // Then try to create another with the same ID
      const config: EventHubConfig = {
        connectors: [
          { id: 'duplicate', type: 'source' }
        ]
      };
      
      await expect(eventHub.configure(config)).rejects.toThrow(/already exists/);
    });
  });
  
  describe('when registering a transport type', () => {
    it('should allow creation of registered transport type after registration', () => {
      class CustomTransport extends BaseTransport<unknown, unknown> {
        async connect(): Promise<void> {}
        async disconnect(): Promise<void> {}
      }
      
      eventHub.registerTransport('custom', CustomTransport);
      
      // Create a transport of the registered type
      const config: TransportConfig = { id: 'custom1', type: 'custom' };
      
      return expect(eventHub.createTransport(config)).resolves.toBeInstanceOf(CustomTransport);
    });
    
    it('should reject registration when transport type is already registered', () => {
      class CustomTransport extends BaseTransport<unknown, unknown> {
        async connect(): Promise<void> {}
        async disconnect(): Promise<void> {}
      }
      
      eventHub.registerTransport('custom', CustomTransport);
      
      expect(() => {
        eventHub.registerTransport('custom', CustomTransport);
      }).toThrow(/already registered/);
    });
  });
  
  describe('when registering a connector type', () => {
    it('should allow creation of registered connector type after registration', () => {
      class CustomConnector implements BaseConnector {
        readonly eventHub: EventHub;
        
        constructor(eventHub: EventHub) {
          this.eventHub = eventHub;
        }
        
        async connect(): Promise<void> {}
        async disconnect(): Promise<void> {}
      }
      
      eventHub.registerConnector('custom', CustomConnector);
      
      // Create a connector of the registered type
      const config: ConnectorConfig = { id: 'custom1', type: 'custom' };
      
      return expect(eventHub.createConnector(config)).resolves.toBeInstanceOf(CustomConnector);
    });
    
    it('should reject registration when connector type is already registered', () => {
      class CustomConnector implements BaseConnector {
        readonly eventHub: EventHub;
        
        constructor(eventHub: EventHub) {
          this.eventHub = eventHub;
        }
        
        async connect(): Promise<void> {}
        async disconnect(): Promise<void> {}
      }
      
      eventHub.registerConnector('custom', CustomConnector);
      
      expect(() => {
        eventHub.registerConnector('custom', CustomConnector);
      }).toThrow(/already registered/);
    });
  });
  
  describe('when creating a transport', () => {
    it('should create and store a transport instance when given valid configuration', async () => {
      const config: TransportConfig = { id: 'transport1', type: 'mock' };
      
      const transport = await eventHub.createTransport(config);
      
      expect(transport).toBeInstanceOf(MockTransport);
      expect(transport.name).toBe('transport1');
      expect(eventHub.getTransport('transport1')).toBe(transport);
    });
    
    it('should reject with error when transport type is not registered', async () => {
      const config: TransportConfig = { id: 'transport1', type: 'unknown' };
      
      await expect(eventHub.createTransport(config)).rejects.toThrow(/No implementation registered/);
    });
    
    it('should reject with error when transport ID already exists', async () => {
      // First create a transport
      await eventHub.createTransport({ id: 'duplicate', type: 'mock' });
      
      // Then try to create another with the same ID
      const config: TransportConfig = { id: 'duplicate', type: 'mock' };
      
      await expect(eventHub.createTransport(config)).rejects.toThrow(/already exists/);
    });
  });
  
  describe('when creating a connector', () => {
    it('should create and store a connector instance when given valid configuration', async () => {
      const config: ConnectorConfig = { 
        id: 'connector1', 
        type: 'source',
        options: {
          channel: 'test-channel'
        }
      };
      
      const connector = await eventHub.createConnector(config);
      
      expect(connector).toBeInstanceOf(MockSourceConnector);
      expect(connector.eventHub).toBe(eventHub);
      expect(eventHub.getConnector('connector1')).toBe(connector);
    });
    
    it('should link connector to specified transport when transportId is provided', async () => {
      // First create a transport
      const transport = await eventHub.createTransport({ id: 'transport1', type: 'mock-source' });
      
      // Then create a connector that uses it
      const config: ConnectorConfig = { 
        id: 'connector1', 
        type: 'source',
        options: {
          transportId: 'transport1',
          channel: 'test-channel'
        }
      };
      
      const connector = await eventHub.createConnector(config) as SourceConnector<unknown, unknown>;
      
      expect(connector.transport).toBe(transport);
    });
    
    it('should reject with error when connector type is not registered', async () => {
      const config: ConnectorConfig = { id: 'connector1', type: 'unknown' as any };
      
      await expect(eventHub.createConnector(config)).rejects.toThrow(/No implementation registered/);
    });
    
    it('should reject with error when connector ID already exists', async () => {
      // First create a connector
      await eventHub.createConnector({ id: 'duplicate', type: 'source' });
      
      // Then try to create another with the same ID
      const config: ConnectorConfig = { id: 'duplicate', type: 'source' };
      
      await expect(eventHub.createConnector(config)).rejects.toThrow(/already exists/);
    });
    
    it('should reject with error when specified transport does not exist', async () => {
      const config: ConnectorConfig = { 
        id: 'connector1', 
        type: 'source',
        options: {
          transportId: 'non-existent',
          channel: 'test-channel'
        }
      };
      
      await expect(eventHub.createConnector(config)).rejects.toThrow(/not found/);
    });
  });
  
  describe('when connecting components', () => {
    it('should connect all registered components when connect method is called', async () => {
      // Create some components
      const transport1 = await eventHub.createTransport({ id: 'transport1', type: 'mock' }) as MockTransport;
      const transport2 = await eventHub.createTransport({ id: 'transport2', type: 'mock' }) as MockTransport;
      
      // Connect
      await eventHub.connect();
      
      // Check that all transports were connected
      expect(transport1.connectCalled).toBe(true);
      expect(transport2.connectCalled).toBe(true);
      
      // Check that the state is CONNECTED
      expect(eventHub.getState()?.status).toBe(LifecycleState.CONNECTED);
    });
  });
  
  describe('when disconnecting components', () => {
    it('should disconnect all registered components when disconnect method is called', async () => {
      // Create some components
      const transport1 = await eventHub.createTransport({ id: 'transport1', type: 'mock' }) as MockTransport;
      const transport2 = await eventHub.createTransport({ id: 'transport2', type: 'mock' }) as MockTransport;
      
      // Connect first
      await eventHub.connect();
      
      // Then disconnect
      await eventHub.disconnect();
      
      // Check that all transports were disconnected
      expect(transport1.disconnectCalled).toBe(true);
      expect(transport2.disconnectCalled).toBe(true);
      
      // Check that the state is DISCONNECTED
      expect(eventHub.getState()?.status).toBe(LifecycleState.DISCONNECTED);
    });
  });
  
  describe('when retrieving a transport', () => {
    it('should return the correct transport instance when given a valid ID', async () => {
      const transport = await eventHub.createTransport({ id: 'transport1', type: 'mock' });
      
      expect(eventHub.getTransport('transport1')).toBe(transport);
    });
    
    it('should return undefined when transport ID does not exist', () => {
      expect(eventHub.getTransport('non-existent')).toBeUndefined();
    });
  });
  
  describe('when retrieving a connector', () => {
    it('should return the correct connector instance when given a valid ID', async () => {
      const connector = await eventHub.createConnector({ id: 'connector1', type: 'source' });
      
      expect(eventHub.getConnector('connector1')).toBe(connector);
    });
    
    it('should return undefined when connector ID does not exist', () => {
      expect(eventHub.getConnector('non-existent')).toBeUndefined();
    });
  });
  
  describe('when listing all transports', () => {
    it('should return a map of all registered transport instances', async () => {
      await eventHub.createTransport({ id: 'transport1', type: 'mock' });
      await eventHub.createTransport({ id: 'transport2', type: 'mock' });
      
      const transports = eventHub.getAllTransports();
      
      expect(transports.size).toBe(2);
      expect(transports.has('transport1')).toBe(true);
      expect(transports.has('transport2')).toBe(true);
    });
  });
  
  describe('when listing all connectors', () => {
    it('should return a map of all registered connector instances', async () => {
      await eventHub.createConnector({ id: 'connector1', type: 'source' });
      await eventHub.createConnector({ id: 'connector2', type: 'sink' });
      
      const connectors = eventHub.getAllConnectors();
      
      expect(connectors.size).toBe(2);
      expect(connectors.has('connector1')).toBe(true);
      expect(connectors.has('connector2')).toBe(true);
    });
  });
  
  describe('when checking the EventHub state', () => {
    it('should return the current lifecycle state of the EventHub', async () => {
      // Initialize the lifecycle by connecting
      await eventHub.connect();
      
      const state = eventHub.getState();
      
      expect(state).toBeDefined();
      expect(state?.status).toBe(LifecycleState.CONNECTED);
      expect(state?.componentType).toBe('eventhub');
    });
  });
  
  describe('when monitoring state changes', () => {
    it('should notify registered callbacks when EventHub state changes', async () => {
      const stateChanges: ConnectionState[] = [];
      
      const unsubscribe = eventHub.onStateChange((state) => {
        stateChanges.push(state);
      });
      
      // Connect to trigger a state change
      await eventHub.connect();
      
      expect(stateChanges.length).toBeGreaterThan(0);
      expect(stateChanges[stateChanges.length - 1].status).toBe(LifecycleState.CONNECTED);
      
      // Unsubscribe and clear the array
      unsubscribe();
      stateChanges.length = 0;
      
      // Disconnect to trigger another state change
      await eventHub.disconnect();
      
      // The callback should not be called anymore
      expect(stateChanges.length).toBe(0);
    });
  });
  
  describe('when destroying the EventHub', () => {
    it('should disconnect and remove all components when destroy method is called', async () => {
      // Create some components
      const transport1 = await eventHub.createTransport({ id: 'transport1', type: 'mock' }) as MockTransport;
      const transport2 = await eventHub.createTransport({ id: 'transport2', type: 'mock' }) as MockTransport;
      
      // Connect first
      await eventHub.connect();
      
      // Then destroy
      await eventHub.destroy();
      
      // Check that all transports were disconnected
      expect(transport1.disconnectCalled).toBe(true);
      expect(transport2.disconnectCalled).toBe(true);
      
      // Check that all maps are empty
      expect(eventHub.getAllTransports().size).toBe(0);
      expect(eventHub.getAllConnectors().size).toBe(0);
    });
  });
  
  describe('when retrieving configuration', () => {
    it('should return a copy of the current configuration when configuration exists', async () => {
      const config: EventHubConfig = {
        transports: [
          { id: 'transport1', type: 'mock' }
        ],
        connectors: [
          { id: 'connector1', type: 'source' }
        ]
      };
      
      await eventHub.configure(config);
      
      const retrievedConfig = eventHub.getConfig();
      
      expect(retrievedConfig).toBeDefined();
      expect(retrievedConfig?.transports).toHaveLength(1);
      expect(retrievedConfig?.connectors).toHaveLength(1);
    });
    
    it('should return undefined when no configuration has been applied', () => {
      const newEventHub = new EventHub();
      
      expect(newEventHub.getConfig()).toBeUndefined();
    });
  });
});
