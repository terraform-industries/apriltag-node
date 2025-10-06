import { describe, it, expect } from 'vitest';
import AprilTag, { FAMILIES } from '../lib/index.js';

describe('AprilTag Node.js bindings', () => {
  describe('Basic Functionality', () => {
    it('should create detector successfully', () => {
      const detector = new AprilTag(FAMILIES.TAG36H11, {
        quadDecimate: 2.0,
        refineEdges: true,
      });
      expect(detector).toBeDefined();
    });

    it('should detect tags synchronously', () => {
      const detector = new AprilTag(FAMILIES.TAG36H11, {
        quadDecimate: 2.0,
        refineEdges: true,
      });

      const width = 100;
      const height = 100;
      const imageData = Buffer.alloc(width * height, 128);

      const detections = detector.detect(width, height, imageData);
      expect(Array.isArray(detections)).toBe(true);
      expect(detections.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect tags asynchronously', async () => {
      const detector = new AprilTag(FAMILIES.TAG36H11, {
        quadDecimate: 2.0,
        refineEdges: true,
      });

      const width = 100;
      const height = 100;
      const imageData = Buffer.alloc(width * height, 128);

      const detections = await detector.detectAsync(width, height, imageData);
      expect(Array.isArray(detections)).toBe(true);
      expect(detections.length).toBeGreaterThanOrEqual(0);
    });

    it('should set parameters successfully', () => {
      const detector = new AprilTag(FAMILIES.TAG36H11);
      expect(() => {
        detector.setQuadSigma(1.0).setDecodeSharpening(0.5).setRefineEdges(false);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid width type', () => {
      const detector = new AprilTag();
      expect(() => {
        detector.detect('invalid', 100, Buffer.alloc(100));
      }).toThrow(/Width and height must be numbers/);
    });

    it('should reject invalid buffer type', () => {
      const detector = new AprilTag();
      expect(() => {
        detector.detect(100, 100, 'not a buffer');
      }).toThrow(/Image data must be a Buffer/);
    });

    it('should reject buffer that is too small', () => {
      const detector = new AprilTag();
      expect(() => {
        detector.detect(100, 100, Buffer.alloc(50));
      }).toThrow(/Buffer too small/);
    });

    it('should reject small buffer in async mode', async () => {
      const detector = new AprilTag();
      await expect(
        detector.detectAsync(100, 100, Buffer.alloc(50))
      ).rejects.toThrow(/Buffer too small/);
    });
  });
});
