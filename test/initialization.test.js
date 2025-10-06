import { describe, it, expect } from 'vitest';
import AprilTag, { FAMILIES } from '../lib/index.js';

describe('Initialization', () => {
  describe('ensureInitialized', () => {
    it('should complete successfully', async () => {
      const detector = new AprilTag(FAMILIES.TAG25H9);
      const result = await detector.ensureInitialized();
      expect(result).toBe(true);
    });

    it('should be idempotent', async () => {
      const detector = new AprilTag(FAMILIES.TAG16H5);
      const init1 = await detector.ensureInitialized();
      const init2 = await detector.ensureInitialized();
      expect(init1).toBe(true);
      expect(init2).toBe(true);
    });

    it('should return same promise for concurrent calls', async () => {
      const detector = new AprilTag(FAMILIES.TAG36H11);
      const promise1 = detector.ensureInitialized();
      const promise2 = detector.ensureInitialized();
      const promise3 = detector.ensureInitialized();

      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);

      await Promise.all([promise1, promise2, promise3]);
    });

    it('should handle concurrent initialization and detection', async () => {
      const detector = new AprilTag(FAMILIES.TAGCIRCLE49H12);
      const dummyImage = Buffer.alloc(100 * 100, 128);

      const promise1 = detector.ensureInitialized();
      const detectPromise = detector.detectAsync(10, 10, dummyImage);
      const promise2 = detector.ensureInitialized();

      await Promise.all([promise1, detectPromise, promise2]);

      expect(promise1).toBe(promise2);
    });
  });

  describe('Lazy Initialization', () => {
    it('should complete constructor quickly', () => {
      const start = performance.now();
      const detector = new AprilTag(FAMILIES.TAG36H11);
      const time = performance.now() - start;

      expect(detector).toBeDefined();
      expect(time).toBeLessThan(1000);
    });

    it('should allow detection after pre-initialization', async () => {
      const detector = new AprilTag(FAMILIES.TAGSTANDARD41H12);
      await detector.ensureInitialized();

      const dummyImage = Buffer.alloc(100 * 100, 128);
      const detections = await detector.detectAsync(100, 100, dummyImage);
      expect(Array.isArray(detections)).toBe(true);
    });

    it('should maintain state after detection errors', async () => {
      const detector = new AprilTag(FAMILIES.TAGCIRCLE21H7);
      await detector.ensureInitialized();

      // Try detection with invalid buffer
      await expect(
        detector.detectAsync(100, 100, Buffer.alloc(50))
      ).rejects.toThrow();

      // Should still work with valid buffer
      const result = await detector.detectAsync(10, 10, Buffer.alloc(100, 128));
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Multiple Families', () => {
    it('should initialize different families independently', async () => {
      const families = [FAMILIES.TAG36H11, FAMILIES.TAG25H9, FAMILIES.TAG16H5];
      const detectors = families.map(f => new AprilTag(f));

      const results = await Promise.all(
        detectors.map(d => d.ensureInitialized())
      );

      expect(results.every(r => r === true)).toBe(true);
    });
  });
});
