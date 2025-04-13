import { BaseTransport } from '../transport';
import { TransportConfig } from '../types';

import { TransportFactory } from './transport-factory';

// Mock transport class for testing
class MockTransport extends BaseTransport<string, string> {
  public options: any;
  
  constructor(options: any) {
    super(options.id || 'mock-transport');
    this.options = options;
  }
  
  async connect(): Promise<void> {
    this._connected = true;
  }
  
  async disconnect(): Promise<void> {
    this._connected = false;
  }
}

// Another mock transport class for testing
class AnotherMockTransport extends BaseTransport<string, string> {
  public options: any;
  
  constructor(options: any) {
    super(options.id || 'another-mock-transport');
    this.options = options;
  }
  
  async connect(): Promise<void> {
    this._connected = true;
  }
  
  async disconnect(): Promise<void> {
    this._connected = false;
  }
}

describe('[TransportFactory]', () => {
  let factory: TransportFactory;
  
  beforeEach(() => {
    factory = new TransportFactory();
  });
  
  describe('when registering transport implementations', () => {
    it('should store the implementation and make it available for type checking', () => {
      factory.register('mock', MockTransport);
      expect(factory.hasType('mock')).toBe(true);
    });
    
    it('should prevent duplicate registrations of the same transport type', () => {
      factory.register('mock', MockTransport);
      expect(() => factory.register('mock', MockTransport)).toThrow("Type 'mock' is already registered");
    });
  });
  
  describe('when creating transport instances', () => {
    it('should instantiate the registered transport with the provided configuration', () => {
      const config: TransportConfig = {
        id: 'test-transport',
        type: 'mock',
        options: {
          foo: 'bar'
        }
      };
      
      factory.register('mock', MockTransport);
      
      const transport = factory.createFromConfig(config);
      expect(transport).toBeInstanceOf(MockTransport);
      expect(transport.name).toBe('test-transport');
      expect((transport as MockTransport).options.foo).toBe('bar');
    });
    
    it('should handle options being undefined in the config', () => {
      const configWithoutOptions: TransportConfig = {
        id: 'test-transport',
        type: 'mock'
      };
      
      factory.register('mock', MockTransport);
      
      const transport = factory.createFromConfig(configWithoutOptions);
      expect(transport).toBeInstanceOf(MockTransport);
      expect(transport.name).toBe('test-transport');
    });
    
    it('should fail with a descriptive error when the requested transport type is not registered', () => {
      const config: TransportConfig = {
        id: 'test-transport',
        type: 'nonexistent',
        options: {}
      };
      
      expect(() => factory.createFromConfig(config)).toThrow('No implementation registered for type: nonexistent');
    });
  });
  
  describe('when validating transport configurations', () => {
    it('should validate that the configuration object exists', () => {
      expect(() => factory.validateConfig(null as any)).toThrow(TypeError);
      expect(() => factory.validateConfig(null as any)).toThrow('Transport configuration is required');
    });
    
    it('should validate that the configuration has required id and type properties', () => {
      const validConfig: TransportConfig = {
        id: 'test-transport',
        type: 'mock'
      };
      
      const missingIdConfig = {
        type: 'mock'
      } as TransportConfig;
      
      const missingTypeConfig = {
        id: 'test-transport'
      } as TransportConfig;
      
      expect(factory.validateConfig(validConfig)).toBe(true);
      expect(() => factory.validateConfig(missingIdConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(missingIdConfig)).toThrow('Transport configuration must include an id');
      expect(() => factory.validateConfig(missingTypeConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(missingTypeConfig)).toThrow('Transport configuration must include a type');
    });
    
    it('should validate that the id is a non-empty string', () => {
      const emptyIdConfig: TransportConfig = {
        id: '',
        type: 'mock'
      };
      
      expect(() => factory.validateConfig(emptyIdConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(emptyIdConfig)).toThrow('Transport id cannot be empty');
    });
    
    it('should validate that the type is a non-empty string', () => {
      const emptyTypeConfig: TransportConfig = {
        id: 'test-transport',
        type: ''
      };
      
      expect(() => factory.validateConfig(emptyTypeConfig)).toThrow(TypeError);
      expect(() => factory.validateConfig(emptyTypeConfig)).toThrow('Transport type cannot be empty');
    });
  });
  
  describe('when creating transports with validation', () => {
    it('should validate the configuration before creating the transport', () => {
      const validConfig: TransportConfig = {
        id: 'test-transport',
        type: 'mock',
        options: { foo: 'bar' }
      };
      
      const invalidConfig = {
        id: '',
        type: 'mock'
      } as TransportConfig;
      
      factory.register('mock', MockTransport);
      
      const transport = factory.createWithValidation(validConfig);
      expect(transport).toBeInstanceOf(MockTransport);
      
      expect(() => factory.createWithValidation(invalidConfig)).toThrow(TypeError);
      expect(() => factory.createWithValidation(invalidConfig)).toThrow('Transport id cannot be empty');
    });
  });
  
  describe('should provide access to all registered transport types', () => {
    it('should return a complete list of all registered transport type identifiers', () => {
      factory.register('mock1', MockTransport);
      factory.register('mock2', AnotherMockTransport);
      
      const types = factory.getRegisteredTypes();
      expect(types).toContain('mock1');
      expect(types).toContain('mock2');
      expect(types.length).toBe(2);
    });
  });
});
