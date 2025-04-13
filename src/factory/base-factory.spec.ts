import { BaseFactory, FactoryRegistry } from './base-factory';

// Mock class for testing
class TestClass {
  public options: any;
  
  constructor(options: any) {
    this.options = options;
  }
}

// Another mock class for testing
class AnotherTestClass {
  public options: any;
  
  constructor(options: any) {
    this.options = options;
  }
}

describe('[BaseFactory]', () => {
  let factory: FactoryRegistry<TestClass>;
  
  beforeEach(() => {
    factory = new BaseFactory<TestClass>();
  });
  
  describe('when registering implementations', () => {
    it('should store the implementation and make it available for type checking', () => {
      factory.register('test', TestClass);
      expect(factory.hasType('test')).toBe(true);
    });
    
    it('should prevent duplicate registrations of the same type', () => {
      factory.register('test', TestClass);
      expect(() => factory.register('test', TestClass)).toThrow("Type 'test' is already registered");
    });
  });
  
  describe('when creating instances', () => {
    it('should instantiate the registered implementation with the provided options', () => {
      const options = { foo: 'bar' };
      factory.register('test', TestClass);
      
      const instance = factory.create('test', options);
      
      expect(instance).toBeInstanceOf(TestClass);
      expect(instance.options).toEqual(options);
    });
    
    it('should fail with a descriptive error when the requested type is not registered', () => {
      expect(() => factory.create('nonexistent', {})).toThrow('No implementation registered for type: nonexistent');
    });
  });
  
  describe('when unregistering implementations', () => {
    it('should remove the implementation from the registry', () => {
      factory.register('test', TestClass);
      expect(factory.hasType('test')).toBe(true);
      
      factory.unregister('test');
      expect(factory.hasType('test')).toBe(false);
    });
    
    it('should handle attempts to unregister non-existent types gracefully', () => {
      expect(() => factory.unregister('nonexistent')).not.toThrow();
    });
  });
  
  describe('should enable checks for registered types', () => {
    it('should confirm when a type has been registered', () => {
      factory.register('test', TestClass);
      expect(factory.hasType('test')).toBe(true);
    });
    
    it('should confirm when a type has not been registered', () => {
      expect(factory.hasType('nonexistent')).toBe(false);
    });
  });
  
  describe('should provide access to all registered types', () => {
    it('should return a complete list of all registered type identifiers', () => {
      factory.register('test1', TestClass);
      factory.register('test2', AnotherTestClass as unknown as new (...args: any[]) => TestClass);
      
      const types = (factory as BaseFactory<TestClass>).getRegisteredTypes();
      expect(types).toContain('test1');
      expect(types).toContain('test2');
      expect(types.length).toBe(2);
    });
    
    it('should return an empty list when no types have been registered', () => {
      const types = (factory as BaseFactory<TestClass>).getRegisteredTypes();
      expect(types).toEqual([]);
    });
  });
});
