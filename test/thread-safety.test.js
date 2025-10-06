import { describe, it, expect } from 'vitest';
import AprilTag, { FAMILIES } from '../lib/index.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSingleThreadSafetyTest() {
  const imagePath = join(__dirname, '..', 'data', 'DSC02867.JPG');

  const { data, info } = await sharp(imagePath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const detector = new AprilTag(FAMILIES.TAGSTANDARD52H13);

  // Run sync and async detections concurrently
  const results = await Promise.allSettled([
    detector.detectAsync(info.width, info.height, data),
    (async () => detector.detect(info.width, info.height, data))(),
    detector.detectAsync(info.width, info.height, data),
    detector.detectAsync(info.width, info.height, data),
  ]);

  return results.every(result =>
    result.status === 'fulfilled' && result.value.length === 10
  );
}

describe('Thread Safety', () => {
  it('should handle concurrent sync and async detections', async () => {
    const result = await runSingleThreadSafetyTest();
    expect(result).toBe(true);
  }, 30000);

  it('should handle multiple concurrent runs without race conditions', async () => {
    const numRuns = 10;
    const results = await Promise.all(
      Array.from({ length: numRuns }, () => runSingleThreadSafetyTest())
    );

    const allPassed = results.every(r => r === true);
    expect(allPassed).toBe(true);
  }, 120000);
});
