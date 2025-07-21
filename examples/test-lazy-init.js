import AprilTag, { FAMILIES } from '../lib/index.js';
import { performance } from 'perf_hooks';

console.log('Testing lazy initialization behavior...\n');

try {
  console.log('Testing that constructor is fast (lazy initialization)...');

  // Test that constructor completes quickly
  const constructorStart = performance.now();
  const detector = new AprilTag(FAMILIES.TAG36H11);
  const constructorEnd = performance.now();
  const constructorTime = constructorEnd - constructorStart;

  console.log(`✓ Constructor completed in ${constructorTime.toFixed(1)}ms`);

  if (constructorTime > 1000) {
    // Constructor should be fast (< 1 second)
    console.error(
      '✗ Constructor too slow - lazy initialization may not be working'
    );
    process.exit(1);
  }

  console.log('Testing that first detection triggers initialization...');

  // Test first detection (should be slower due to initialization)
  const width = 100;
  const height = 100;
  const imageData = Buffer.alloc(width * height, 128);

  const firstDetectionStart = performance.now();
  const detections1 = detector.detect(width, height, imageData);
  const firstDetectionEnd = performance.now();
  const firstDetectionTime = firstDetectionEnd - firstDetectionStart;

  console.log(
    `✓ First detection completed in ${firstDetectionTime.toFixed(1)}ms`
  );
  console.log(`  Found ${detections1.length} tags`);

  // Test second detection (should be faster - no initialization)
  const secondDetectionStart = performance.now();
  const detections2 = detector.detect(width, height, imageData);
  const secondDetectionEnd = performance.now();
  const secondDetectionTime = secondDetectionEnd - secondDetectionStart;

  console.log(
    `✓ Second detection completed in ${secondDetectionTime.toFixed(1)}ms`
  );
  console.log(`  Found ${detections2.length} tags`);

  // Verify lazy initialization worked correctly
  if (firstDetectionTime < constructorTime) {
    console.error(
      '✗ First detection was faster than expected - initialization may not be lazy'
    );
    process.exit(1);
  }

  console.log('\n🎉 Lazy initialization test passed!');
  console.log(`Constructor: ${constructorTime.toFixed(1)}ms (fast)`);
  console.log(
    `First detection: ${firstDetectionTime.toFixed(1)}ms (with initialization)`
  );
  console.log(`Second detection: ${secondDetectionTime.toFixed(1)}ms (cached)`);
} catch (error) {
  console.error('✗ Test failed:', error.message);
  process.exit(1);
}
