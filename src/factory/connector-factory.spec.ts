import { SinkConnector, SourceConnector } from '../connector';
import { EventHub } from '../event-hub';
import { SinkTransport, SourceTransport } from '../transport';
import { ConnectorConfig } from '../types';

import { ConnectorFactory } from './connector-factory';

// Mock EventHub for testing
class MockEventHub extends EventHub {}

// Mock transports for testing
class MockSourceTransport extends SourceTransport<string, string> {
  constructor(options: any) {
    super(options.id || 'mock-source-transport');
  }
  
  async connect(): Promise<void> {
    this._connected = true;
  }
  
  async disconnect(): Promise<void> {
    this._connected = false;
  }
  
  protected async handleData(data: string): Promise<void> {
    // Implementation not needed for tests
  }
}

class MockSinkTransport extends SinkTransport<string, string> {
  constructor(options: any) {
    super(options.id || 'mock-sink-transport');
  }
  
  async connect(): Promise<void> {
    this._connected = true;
  }
  
  async disconnect(): Promise<void> {
    this._connected = false;
  }
  
  protected async sendMessage(data: string): Promise<void> {
    // Implementation not needed for tests
  }
}

// Mock connectors for testing
class MockSourceConnector extends SourceConnector<string, string> {
  public options: any;
  
  constructor(options: any) {
    super(
      options.eventHub || new MockEventHub(),
      options.transport || new MockSourceTransport({ id: 'default-source' }),
      options.channel || 'default-channel'
    );
    this.options = options;
  }
}

class MockSinkConnector extends SinkConnector<string, string> {
  public options: any;
  
  constructor(options: any) {
    super(
      options.eventHub || new MockEventHub(),
      options.transport || new MockSinkTransport({ id: 'default-sink' }),
      options.channel || 'default-channel'
    );
    this.options = options;
  }
}

describe('[ConnectorFactory]', () => {
  let factory: ConnectorFactory;
  let eventHub: EventHub;
  
  beforeEach(() => {
    eventHub = new MockEventHub();
    factory = new ConnectorFactory(eventHub);
  });
  
  describe('when registering connector implementations', () => {
    it('should store the implementation and make it available for type checking', () => {
      factory.register('source', MockSourceConnector);
      expect(factory.hasType('source')).toBe(true);
    });
    
    it('should prevent duplicate registrations of the same connector type', () => {
      factory.register('source', MockSourceConnector);
      expect(() => factory.register('source', MockSourceConnector)).toThrow("Type 'source' is already registered");
    });
  });
  
  describe('when creating connector instances', () => {
    it('should instantiate a source connector with the provided configuration', () => {
      const config: ConnectorConfig = {
        id: 'test-connector',
        type: 'source',
        options: {
          channel: 'test-channel',
          foo: 'bar'
        }
      };
      
      factory.register('source', MockSourceConnector);
      
      const connector = factory.createFromConfig(config);
      expect(connector).toBeInstanceOf(MockSourceConnector);
      expect((connector as MockSourceConnector).channel).toBe('test-channel');
      expect((connector as MockSourceConnector).options.foo).toBe('bar');
      expect((connector as MockSourceConnector).eventHub).toBe(eventHub);
    });
    
    it('should instantiate a sink connector with the provided configuration', () => {
      const config: ConnectorConfig = {
        id: 'test-connector',
        type: 'sink',
        options: {
          channel: 'test-channel',
          foo: 'bar'
        }
      };
      
      factory.register('sink', MockSinkConnector);
      
      const connector = factory.createFromConfig(config);
      expect(connector).toBeInstanceOf(MockSinkConnector);
      expect((connector as MockSinkConnector).channel).toBe('test-channel');
      expect((connector as MockSinkConnector).options.foo).toBe('bar');
      expect((connector as MockSinkConnector).eventHub).toBe(eventHub);
    });
    
    it('should handle options being undefined in the config', () => {
      const configWithoutOptions: ConnectorConfig = {
        id: 'test-connector',
        type: 'source'
      };
      
      factory.register('source', MockSourceConnector);
      
      const connector = factory.createFromConfig(configWithoutOptions);
      expect(connector).toBeInstanceOf(MockSourceConnector);
      expect((connector as MockSourceConnector).channel).toBe('default-channel');
      expect((connector as MockSourceConnector).eventHub).toBe(eventHub);
    });
    
    it('should fail with a descriptive error when the requested connector type is not registered', () => {
      const config: ConnectorConfig = {
        id: 'test-connector',
        type: 'source',
        options: {}
      };
      
      expect(() => factory.createFromConfig(config)).toThrow('No implementation registered for type: source');
    });
  });
  
  describe('when validating connector configurations', () => {
    it('should validate that the configuration object exists', () => {
      expect(() => factory.validateConfig(null as any)).toThrow(TypeError);
      expect(() => factory.validateConfig(null as any)).toThrow('Connector configuration is required');
    });
    
    it('should validate that the configuration has required id and type properties', () => {
      const validConfig: ConnectorConfig = {
        id: 'test-connector',
        type: 'source'
      };
      
      const missingIdConfig = {
        type: 'source'
      } as ConnectorConfig;
      
      const missingTypeConfig = {
        id: 'test-connector'
      } as ConnectorConfig;
      
      expect(factory.validateConfig(validConfig)).toBe(true);
      expect(() => factory.validateConfig(missingIdConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(missingIdConfig)).toThrow('Connector configuration must include an id');
      expect(() => factory.validateConfig(missingTypeConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(missingTypeConfig)).toThrow('Connector configuration must include a type');
    });
    
    it('should validate that the id is a non-empty string', () => {
      const emptyIdConfig: ConnectorConfig = {
        id: '',
        type: 'source'
      };
      
      expect(() => factory.validateConfig(emptyIdConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(emptyIdConfig)).toThrow('Connector id cannot be empty');
    });
    
    it('should validate that the type is a valid connector type', () => {
      const invalidTypeConfig = {
        id: 'test-connector',
        type: 'invalid' as any
      };
      
      expect(() => factory.validateConfig(invalidTypeConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(invalidTypeConfig)).toThrow("Connector type must be 'source' or 'sink'");
    });
    
    it('should validate that the channel is a non-empty string when provided', () => {
      const emptyChannelConfig: ConnectorConfig = {
        id: 'test-connector',
        type: 'source',
        options: {
          channel: ''
        }
      };
      
      expect(() => factory.validateConfig(emptyChannelConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(emptyChannelConfig)).toThrow('Connector channel cannot be empty when provided');
    });
  });
  
  describe('when creating connectors with validation', () => {
    it('should validate the configuration before creating the connector', () => {
      const validConfig: ConnectorConfig = {
        id: 'test-connector',
        type: 'source',
        options: { 
          channel: 'test-channel',
          foo: 'bar' 
        }
      };
      
      const invalidConfig = {
        id: '',
        type: 'source'
      } as ConnectorConfig;
      
      factory.register('source', MockSourceConnector);
      
      const connector = factory.createWithValidation(validConfig);
      expect(connector).toBeInstanceOf(MockSourceConnector);
      
      expect(() => factory.createWithValidation(invalidConfig)).toThrow(TypeError);
      expect(() => factory.createWithValidation(invalidConfig)).toThrow('Connector id cannot be empty');
    });
  });
  
  describe('when accessing registered connector types', () => {
    it('should return a complete list of all registered connector type identifiers', () => {
      factory.register('source', MockSourceConnector);
      factory.register('sink', MockSinkConnector);
      
      const types = factory.getRegisteredTypes();
      expect(types).toContain('source');
      expect(types).toContain('sink');
      expect(types.length).toBe(2);
    });
  });
});
