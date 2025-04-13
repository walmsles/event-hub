/**
 * Interface for factory registry that manages registration and creation of components
 */
export interface FactoryRegistry<T> {
  /**
   * Register a new implementation for a specific type
   * @param type The type identifier
   * @param implementation The constructor for the implementation
   */
  register(type: string, implementation: new (...args: any[]) => T): void;
  
  /**
   * Create an instance of a registered type
   * @param type The type identifier
   * @param options Options to pass to the constructor
   * @returns A new instance of the requested type
   */
  create(type: string, options: any): T;
  
  /**
   * Remove a type registration
   * @param type The type identifier to unregister
   */
  unregister(type: string): void;
  
  /**
   * Check if a type is registered
   * @param type The type identifier to check
   * @returns True if the type is registered, false otherwise
   */
  hasType(type: string): boolean;
}

/**
 * Base implementation of a factory registry that can register and create instances of a specific type
 */
export class BaseFactory<T> implements FactoryRegistry<T> {
  /**
   * Registry of type implementations
   * @private
   */
  private registry = new Map<string, new (...args: any[]) => T>();

  /**
   * Register a new implementation for a specific type
   * @param type The type identifier
   * @param implementation The constructor for the implementation
   * @throws Error if the type is already registered
   */
  public register(type: string, implementation: new (...args: any[]) => T): void {
    if (this.registry.has(type)) {
      throw new Error(`Type '${type}' is already registered`);
    }
    this.registry.set(type, implementation);
  }

  /**
   * Create an instance of a registered type
   * @param type The type identifier
   * @param options Options to pass to the constructor
   * @returns A new instance of the requested type
   * @throws Error if the type is not registered
   */
  public create(type: string, options: any): T {
    const Implementation = this.registry.get(type);
    if (!Implementation) {
      throw new Error(`No implementation registered for type: ${type}`);
    }
    return new Implementation(options);
  }

  /**
   * Remove a type registration
   * @param type The type identifier to unregister
   */
  public unregister(type: string): void {
    this.registry.delete(type);
  }

  /**
   * Check if a type is registered
   * @param type The type identifier to check
   * @returns True if the type is registered, false otherwise
   */
  public hasType(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered types
   * @returns Array of registered type identifiers
   */
  public getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}
