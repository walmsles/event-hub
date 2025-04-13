/**
 * Tests for the LifecycleManager class
 */
import { EventHub } from '../event-hub';
import { LifecycleState } from '../types/lifecycle';
import { ILifecycleHooks } from '../types/lifecycle-hooks';

import { LifecycleManager } from './lifecycle-manager';

describe('LifecycleManager', () => {
  let eventHub: EventHub;
  let lifecycleManager: LifecycleManager;
  let mockLifecycleHooks: ILifecycleHooks;
  let errorSpy: jest.SpyInstance;
  let publishSpy: jest.SpyInstance;

  beforeEach(() => {
    eventHub = new EventHub();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Create mock lifecycle hooks
    mockLifecycleHooks = {
      onInitialize: jest.fn().mockResolvedValue(true),
      onStart: jest.fn().mockResolvedValue(true),
      onStop: jest.fn().mockResolvedValue(true),
      onDestroy: jest.fn().mockResolvedValue(true)
    };
    
    lifecycleManager = new LifecycleManager('test-component', 'transport', eventHub, mockLifecycleHooks);
    
    // Spy on eventHub.publish to prevent actual publishing and track calls
    publishSpy = jest.spyOn(eventHub, 'publish').mockResolvedValue();
  });

  afterEach(() => {
    errorSpy.mockRestore();
    publishSpy.mockRestore();
  });

  describe('initialize', () => {
    it('should call onInitialize hook and update state', async () => {
      await lifecycleManager.initialize();
      
      expect(mockLifecycleHooks.onInitialize).toHaveBeenCalled();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.INITIALIZED);
    });
    
    it('should throw error if onInitialize returns false', async () => {
      (mockLifecycleHooks.onInitialize as jest.Mock).mockResolvedValue(false);
      
      await expect(lifecycleManager.initialize()).rejects.toThrow();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.ERROR);
    });
    
    it('should auto-connect if specified in options', async () => {
      const startSpy = jest.spyOn(lifecycleManager, 'start');
      
      await lifecycleManager.initialize({ autoConnect: true });
      
      expect(startSpy).toHaveBeenCalled();
    });
    
    it('should publish lifecycle event', async () => {
      await lifecycleManager.initialize();
      
      expect(publishSpy).toHaveBeenCalledWith(
        'system:transport:initialize/test-component',
        { componentId: 'test-component' }
      );
    });
    
    it('should handle publish errors gracefully', async () => {
      publishSpy.mockRejectedValue(new Error('Publish error'));
      
      // This should not throw even though publish fails
      await expect(lifecycleManager.initialize()).resolves.not.toThrow();
    });
  });
  
  describe('start', () => {
    it('should call onStart hook and update state', async () => {
      await lifecycleManager.start();
      
      expect(mockLifecycleHooks.onStart).toHaveBeenCalled();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.CONNECTED);
    });
    
    it('should throw error if onStart returns false', async () => {
      (mockLifecycleHooks.onStart as jest.Mock).mockResolvedValue(false);
      
      await expect(lifecycleManager.start()).rejects.toThrow();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.ERROR);
    });
    
    it('should publish lifecycle event', async () => {
      await lifecycleManager.start();
      
      expect(publishSpy).toHaveBeenCalledWith(
        'system:transport:start/test-component',
        { componentId: 'test-component' }
      );
    });
    
    it('should handle publish errors gracefully', async () => {
      publishSpy.mockRejectedValue(new Error('Publish error'));
      
      // This should not throw even though publish fails
      await expect(lifecycleManager.start()).resolves.not.toThrow();
    });
  });
  
  describe('stop', () => {
    it('should call onStop hook and update state', async () => {
      await lifecycleManager.stop();
      
      expect(mockLifecycleHooks.onStop).toHaveBeenCalled();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.DISCONNECTED);
    });
    
    it('should throw error if onStop returns false', async () => {
      (mockLifecycleHooks.onStop as jest.Mock).mockResolvedValue(false);
      
      await expect(lifecycleManager.stop()).rejects.toThrow();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.ERROR);
    });
    
    it('should publish lifecycle event', async () => {
      await lifecycleManager.stop();
      
      expect(publishSpy).toHaveBeenCalledWith(
        'system:transport:stop/test-component',
        { componentId: 'test-component' }
      );
    });
    
    it('should handle publish errors gracefully', async () => {
      publishSpy.mockRejectedValue(new Error('Publish error'));
      
      // This should not throw even though publish fails
      await expect(lifecycleManager.stop()).resolves.not.toThrow();
    });
  });
  
  describe('destroy', () => {
    it('should call onDestroy hook and update state', async () => {
      await lifecycleManager.destroy();
      
      expect(mockLifecycleHooks.onDestroy).toHaveBeenCalled();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.DISCONNECTED);
    });
    
    it('should throw error if onDestroy returns false', async () => {
      (mockLifecycleHooks.onDestroy as jest.Mock).mockResolvedValue(false);
      
      await expect(lifecycleManager.destroy()).rejects.toThrow();
      expect(lifecycleManager.getState().status).toBe(LifecycleState.ERROR);
    });
    
    it('should stop first if connected', async () => {
      // First connect
      await lifecycleManager.start();
      
      const stopSpy = jest.spyOn(lifecycleManager, 'stop');
      
      await lifecycleManager.destroy();
      
      expect(stopSpy).toHaveBeenCalled();
      expect(mockLifecycleHooks.onDestroy).toHaveBeenCalled();
    });
    
    it('should publish lifecycle event', async () => {
      await lifecycleManager.destroy();
      
      expect(publishSpy).toHaveBeenCalledWith(
        'system:transport:destroy/test-component',
        { componentId: 'test-component' }
      );
    });
    
    it('should handle publish errors gracefully', async () => {
      publishSpy.mockRejectedValue(new Error('Publish error'));
      
      // This should not throw even though publish fails
      await expect(lifecycleManager.destroy()).resolves.not.toThrow();
    });
  });
  
  describe('onStateChange', () => {
    it('should register and call state change callbacks', async () => {
      const callback = jest.fn();
      
      const unsubscribe = lifecycleManager.onStateChange(callback);
      
      await lifecycleManager.initialize();
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        status: LifecycleState.INITIALIZED
      }));
      
      // Unsubscribe and verify callback is not called again
      unsubscribe();
      callback.mockClear();
      
      await lifecycleManager.start();
      
      expect(callback).not.toHaveBeenCalled();
    });
    
    it('should handle errors in callbacks', async () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      
      lifecycleManager.onStateChange(errorCallback);
      
      // This should not throw even though the callback throws
      await expect(lifecycleManager.initialize()).resolves.not.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('updateState', () => {
    it('should handle unknown component types', async () => {
      // Create a lifecycle manager with an unknown component type
      const unknownManager = new LifecycleManager('test-unknown', 'unknown' as any, eventHub, mockLifecycleHooks);
      
      // This should not throw
      await expect(unknownManager.initialize()).resolves.not.toThrow();
    });
    
    it('should handle publish errors in updateState', async () => {
      // Mock the publish method to throw an error
      publishSpy.mockRejectedValue(new Error('Publish error'));
      
      // Call updateState through initialize
      await lifecycleManager.initialize();
      
      // Verify the error was caught and didn't propagate
      expect(lifecycleManager.getState().status).toBe(LifecycleState.INITIALIZED);
    });
  });
});
