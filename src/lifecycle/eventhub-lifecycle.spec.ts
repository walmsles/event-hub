/**
 * Tests for the EventHubLifecycle class
 */
import { EventHub } from '../event-hub';
import { EventHubConfig, LifecycleState } from '../types/lifecycle';
import { ILifecycleHooks } from '../types/lifecycle-hooks';

import { EventHubLifecycle, EventHubLifecycleHooks } from './eventhub-lifecycle';

describe('EventHubLifecycle', () => {
  let eventHub: EventHub;
  let eventHubLifecycle: EventHubLifecycle;
  let config: EventHubConfig;
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    eventHub = new EventHub();
    config = {
      debug: true,
      autoConnect: true // Set to true to test auto-connect
    };
    consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    eventHubLifecycle = new EventHubLifecycle(eventHub, config);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('EventHubLifecycleHooks', () => {
    let hooks: EventHubLifecycleHooks;
    
    beforeEach(() => {
      hooks = new EventHubLifecycleHooks(eventHub, config);
    });
    
    it('should handle onInitialize without config', async () => {
      const hooksWithoutConfig = new EventHubLifecycleHooks(eventHub);
      const result = await hooksWithoutConfig.onInitialize();
      expect(result).toBe(true);
    });
    
    it('should handle onInitialize with config but no debug flag', async () => {
      const noDebugConfig: EventHubConfig = { autoConnect: true };
      const hooksWithNoDebug = new EventHubLifecycleHooks(eventHub, noDebugConfig);
      const result = await hooksWithNoDebug.onInitialize();
      expect(result).toBe(true);
    });
    
    it('should handle onInitialize with options but no debug flag', async () => {
      const result = await hooks.onInitialize({ autoConnect: true });
      expect(result).toBe(true);
    });
    
    it('should handle onInitialize with options and debug explicitly set to false', async () => {
      const result = await hooks.onInitialize({ debug: false });
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('EventHub debug mode disabled from options');
    });
    
    it('should handle onInitialize with options and debug explicitly set to true', async () => {
      const result = await hooks.onInitialize({ debug: true });
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('EventHub debug mode enabled from options');
    });
    
    it('should handle onStart without autoConnect config', async () => {
      const noAutoConnectConfig: EventHubConfig = { debug: true };
      const hooksWithNoAutoConnect = new EventHubLifecycleHooks(eventHub, noAutoConnectConfig);
      const result = await hooksWithNoAutoConnect.onStart();
      expect(result).toBe(true);
    });
    
    it('should handle onStart with undefined config', async () => {
      const hooksWithNoConfig = new EventHubLifecycleHooks(eventHub);
      const result = await hooksWithNoConfig.onStart();
      expect(result).toBe(true);
    });
    
    it('should handle errors in onInitialize', async () => {
      jest.spyOn(console, 'debug').mockImplementation(() => {
        throw new Error('Debug error');
      });
      
      const result = await hooks.onInitialize();
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Error initializing EventHub:', expect.any(Error));
    });
    
    it('should handle errors in onStart', async () => {
      jest.spyOn(console, 'debug').mockImplementation(() => {
        throw new Error('Debug error');
      });
      
      const result = await hooks.onStart();
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Error starting EventHub:', expect.any(Error));
    });
    
    it('should handle errors in onStop', async () => {
      jest.spyOn(console, 'debug').mockImplementation(() => {
        throw new Error('Debug error');
      });
      
      const result = await hooks.onStop();
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Error stopping EventHub:', expect.any(Error));
    });
    
    it('should handle errors in onDestroy', async () => {
      jest.spyOn(console, 'debug').mockImplementation(() => {
        throw new Error('Debug error');
      });
      
      const result = await hooks.onDestroy();
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Error destroying EventHub:', expect.any(Error));
    });
  });

  describe('when creating an instance', () => {
    it('should initialize with the provided config', () => {
      expect(eventHubLifecycle).toBeDefined();
      expect(eventHubLifecycle.getConfig()).toEqual(config);
    });

    it('should initialize without config', () => {
      const lifecycle = new EventHubLifecycle(eventHub);
      expect(lifecycle.getConfig()).toBeUndefined();
    });
  });

  describe('when initializing', () => {
    it('should transition to initialized state', async () => {
      await eventHubLifecycle.initialize();
      
      expect(eventHubLifecycle.getState().status).toBe(LifecycleState.INITIALIZED);
      expect(consoleSpy).toHaveBeenCalledWith('EventHub debug mode enabled');
    });

    it('should auto-connect when specified in options', async () => {
      const startSpy = jest.spyOn(eventHubLifecycle, 'start');
      
      await eventHubLifecycle.initialize({ autoConnect: true });
      
      expect(startSpy).toHaveBeenCalled();
    });

    it('should override debug mode from options', async () => {
      await eventHubLifecycle.initialize({ debug: false });
      
      expect(consoleSpy).toHaveBeenCalledWith('EventHub debug mode disabled from options');
    });

    it('should handle initialization errors', async () => {
      // Create a custom error for testing
      const testError = new Error('Test initialization error');
      
      // Create a mock lifecycle hooks implementation
      const mockHooks: ILifecycleHooks = {
        onInitialize: jest.fn().mockImplementation(() => {
          console.error('Error initializing EventHub:', testError);
          throw testError;
        }),
        onStart: jest.fn().mockResolvedValue(true),
        onStop: jest.fn().mockResolvedValue(true),
        onDestroy: jest.fn().mockResolvedValue(true)
      };
      
      // Create a new lifecycle manager with the mock hooks
      const lifecycle = new EventHubLifecycle(eventHub, config, mockHooks);
      
      await expect(lifecycle.initialize()).rejects.toThrow();
      
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('when starting', () => {
    it('should transition to connected state', async () => {
      await eventHubLifecycle.initialize();
      consoleSpy.mockClear(); // Clear previous calls
      
      await eventHubLifecycle.start();
      
      expect(eventHubLifecycle.getState().status).toBe(LifecycleState.CONNECTED);
      expect(consoleSpy).toHaveBeenCalledWith('EventHub auto-connect enabled, starting all components');
    });
    
    it('should handle start errors', async () => {
      // Create a custom error for testing
      const testError = new Error('Test start error');
      
      // Create a mock lifecycle hooks implementation
      const mockHooks: ILifecycleHooks = {
        onInitialize: jest.fn().mockResolvedValue(true),
        onStart: jest.fn().mockImplementation(() => {
          console.error('Error starting EventHub:', testError);
          throw testError;
        }),
        onStop: jest.fn().mockResolvedValue(true),
        onDestroy: jest.fn().mockResolvedValue(true)
      };
      
      // Create a new lifecycle manager with the mock hooks
      const lifecycle = new EventHubLifecycle(eventHub, config, mockHooks);
      
      await lifecycle.initialize();
      await expect(lifecycle.start()).rejects.toThrow();
      
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('when stopping', () => {
    it('should transition to disconnected state', async () => {
      await eventHubLifecycle.initialize();
      await eventHubLifecycle.start();
      consoleSpy.mockClear(); // Clear previous calls
      
      await eventHubLifecycle.stop();
      
      expect(eventHubLifecycle.getState().status).toBe(LifecycleState.DISCONNECTED);
      expect(consoleSpy).toHaveBeenCalledWith('Stopping all EventHub components');
    });
    
    it('should handle stop errors', async () => {
      // Create a custom error for testing
      const testError = new Error('Test stop error');
      
      // Create a mock lifecycle hooks implementation
      const mockHooks: ILifecycleHooks = {
        onInitialize: jest.fn().mockResolvedValue(true),
        onStart: jest.fn().mockResolvedValue(true),
        onStop: jest.fn().mockImplementation(() => {
          console.error('Error stopping EventHub:', testError);
          throw testError;
        }),
        onDestroy: jest.fn().mockResolvedValue(true)
      };
      
      // Create a new lifecycle manager with the mock hooks
      const lifecycle = new EventHubLifecycle(eventHub, config, mockHooks);
      
      await lifecycle.initialize();
      await lifecycle.start();
      await expect(lifecycle.stop()).rejects.toThrow();
      
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('when destroying', () => {
    it('should transition to disconnected state', async () => {
      await eventHubLifecycle.initialize();
      await eventHubLifecycle.start();
      consoleSpy.mockClear(); // Clear previous calls
      
      await eventHubLifecycle.destroy();
      
      expect(eventHubLifecycle.getState().status).toBe(LifecycleState.DISCONNECTED);
      expect(consoleSpy).toHaveBeenCalledWith('Destroying all EventHub components');
      expect(consoleSpy).toHaveBeenCalledWith('Clearing all EventHub subscriptions');
    });
    
    it('should stop first if connected', async () => {
      await eventHubLifecycle.initialize();
      await eventHubLifecycle.start();
      
      const stopSpy = jest.spyOn(eventHubLifecycle, 'stop');
      
      await eventHubLifecycle.destroy();
      
      expect(stopSpy).toHaveBeenCalled();
    });
    
    it('should handle destroy errors', async () => {
      // Create a custom error for testing
      const testError = new Error('Test destroy error');
      
      // Create a mock lifecycle hooks implementation
      const mockHooks: ILifecycleHooks = {
        onInitialize: jest.fn().mockResolvedValue(true),
        onStart: jest.fn().mockResolvedValue(true),
        onStop: jest.fn().mockResolvedValue(true),
        onDestroy: jest.fn().mockImplementation(() => {
          console.error('Error destroying EventHub:', testError);
          throw testError;
        })
      };
      
      // Create a new lifecycle manager with the mock hooks
      const lifecycle = new EventHubLifecycle(eventHub, config, mockHooks);
      
      await lifecycle.initialize();
      await expect(lifecycle.destroy()).rejects.toThrow();
      
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('when configuring', () => {
    it('should update the configuration', async () => {
      const newConfig: EventHubConfig = {
        debug: false,
        autoConnect: true
      };
      
      await eventHubLifecycle.configure(newConfig);
      
      expect(eventHubLifecycle.getConfig()).toEqual(newConfig);
    });
    
    it('should apply configuration if already initialized', async () => {
      await eventHubLifecycle.initialize();
      consoleSpy.mockClear(); // Clear previous calls
      
      const newConfig: EventHubConfig = {
        debug: true,
        autoConnect: false
      };
      
      await eventHubLifecycle.configure(newConfig);
      
      expect(eventHubLifecycle.getConfig()).toEqual(newConfig);
      expect(consoleSpy).toHaveBeenCalledWith('EventHub debug mode enabled from configure');
    });

    it('should auto-connect if specified in config and initialized', async () => {
      await eventHubLifecycle.initialize();
      
      const startSpy = jest.spyOn(eventHubLifecycle, 'start');
      startSpy.mockClear(); // Clear previous calls
      
      await eventHubLifecycle.configure({
        debug: true,
        autoConnect: true
      });
      
      expect(startSpy).toHaveBeenCalled();
    });
    
    it('should not auto-connect if not initialized', async () => {
      const startSpy = jest.spyOn(eventHubLifecycle, 'start');
      
      await eventHubLifecycle.configure({
        debug: true,
        autoConnect: true
      });
      
      expect(startSpy).not.toHaveBeenCalled();
    });
    
    it('should not auto-connect if autoConnect is false', async () => {
      await eventHubLifecycle.initialize();
      
      const startSpy = jest.spyOn(eventHubLifecycle, 'start');
      startSpy.mockClear(); // Clear previous calls
      
      await eventHubLifecycle.configure({
        debug: true,
        autoConnect: false
      });
      
      expect(startSpy).not.toHaveBeenCalled();
    });
    
    it('should not log debug message if debug is false', async () => {
      await eventHubLifecycle.initialize();
      consoleSpy.mockClear(); // Clear previous calls
      
      await eventHubLifecycle.configure({
        debug: false,
        autoConnect: false
      });
      
      expect(consoleSpy).not.toHaveBeenCalledWith('EventHub debug mode enabled from configure');
    });
    
    it('should handle all config options', async () => {
      // Test with all possible config options
      const fullConfig: EventHubConfig = {
        debug: true,
        autoConnect: true,
        customOption1: 'value1',
        customOption2: 42
      };
      
      await eventHubLifecycle.configure(fullConfig);
      expect(eventHubLifecycle.getConfig()).toEqual(fullConfig);
    });
  });
});
