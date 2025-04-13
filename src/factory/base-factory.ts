/**
 * Base factory implementation for component creation
 */

/**
 * Factory registry interface
 */
export interface FactoryRegistry<T> {
  /**
   * Register a type implementation
   * 
   * @param type Type identifier
   * @param implementation Constructor for the type
   */
  register(type: string, implementation: new (...args: any[]) => T): void;
  
  /**
   * Create an instance of a registered type
   * 
   * @param type Type identifier
   * @param options Options for the constructor
   * @returns Instance of the type
   */
  create(type: string, options: any): T;
  
  /**
   * Unregister a type
   * 
   * @param type Type identifier
   */
  unregister(type: string): void;
  
  /**
   * Check if a type is registered
   * 
   * @param type Type identifier
   * @returns Whether the type is registered
   */
  hasType(type: string): boolean;
}

/**
 * Base factory implementation
 */
export class BaseFactory<T> implements FactoryRegistry<T> {
  /**
   * Registry of type implementations
   */
  private registry = new Map<string, new (...args: any[]) => T>();
  
  /**
   * Register a type implementation
   * 
   * @param type Type identifier
   * @param implementation Constructor for the type
   */
  register(type: string, implementation: new (...args: any[]) => T): void {
    if (this.registry.has(type)) {
      throw new Error(`Type '${type}' is already registered`);
    }
    
    this.registry.set(type, implementation);
  }
  
  /**
   * Create an instance of a registered type
   * 
   * @param type Type identifier
   * @param options Options for the constructor
   * @returns Instance of the type
   */
  create(type: string, options: any): T {
    const Implementation = this.registry.get(type);
    
    if (!Implementation) {
      throw new Error(`No implementation registered for type: ${type}`);
    }
    
    return new Implementation(options);
  }
  
  /**
   * Create an instance of a registered type with validation
   * 
   * @param config Configuration object with type and options
   * @returns Instance of the type
   */
  createWithValidation(config: { type: string; [key: string]: any }): T {
    return this.create(config.type, config);
  }
  
  /**
   * Unregister a type
   * 
   * @param type Type identifier
   */
  unregister(type: string): void {
    this.registry.delete(type);
  }
  
  /**
   * Check if a type is registered
   * 
   * @param type Type identifier
   * @returns Whether the type is registered
   */
  hasType(type: string): boolean {
    return this.registry.has(type);
  }
  
  /**
   * Get all registered types
   * 
   * @returns Array of registered type names
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }
  
  /**
   * Validate a configuration object
   * 
   * @param config Configuration object
   * @returns True if valid
   * @throws Error if invalid
   */
  validateConfig(config: any): boolean {
    if (!config) {
      throw new TypeError('Configuration is required');
    }
    
    if (!config.id) {
      throw new TypeError('Configuration must include an id');
    }
    
    if (typeof config.id !== 'string' || config.id.trim() === '') {
      throw new TypeError('Id cannot be empty');
    }
    
    if (!config.type) {
      throw new TypeError('Configuration must include a type');
    }
    
    if (typeof config.type !== 'string' || config.type.trim() === '') {
      throw new TypeError('Type cannot be empty');
    }
    
    return true;
  }
  
  /**
   * Create from a configuration object
   * 
   * @param config Configuration object
   * @returns Created instance
   */
  createFromConfig(config: any): T {
    this.validateConfig(config);
    return this.create(config.type, config);
  }
}
