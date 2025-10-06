import { describe, it, expect } from 'vitest';
import AprilTag, { FAMILIES } from '../lib/index.js';

describe('AprilTag Families', () => {
  const allFamilies = Object.values(FAMILIES);

  it('should create detector for all families', () => {
    const results = allFamilies.map(family => {
      try {
        const detector = new AprilTag(family, {
          quadDecimate: 2.0,
          refineEdges: false,
          numThreads: 1,
        });
        return { family, success: !!detector };
      } catch (error) {
        return { family, success: false, error: error.message };
      }
    });

    const failed = results.filter(r => !r.success);
    expect(failed).toEqual([]);
  });

  it('should perform basic detection with all families', () => {
    const width = 100;
    const height = 100;
    const imageData = Buffer.alloc(width * height, 128);

    const results = allFamilies.map(family => {
      const detector = new AprilTag(family, {
        quadDecimate: 2.0,
        refineEdges: false,
        numThreads: 1,
      });

      const detections = detector.detect(width, height, imageData);
      return { family, isArray: Array.isArray(detections) };
    });

    expect(results.every(r => r.isArray)).toBe(true);
  });
});
