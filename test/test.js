import AprilTag, { FAMILIES } from '../lib/index.js';
import { testThreadSafety } from './thread-safety.js';

async function runAllTests() {
  console.log('Testing AprilTag Node.js bindings...');
  console.log('=' .repeat(50));
  
  let allTestsPassed = true;

  // Basic functionality tests
  console.log('\n1. Basic Functionality Tests');
  console.log('-'.repeat(30));
  
  try {
    // Test detector creation
    const detector = new AprilTag(FAMILIES.TAG36H11, {
      quadDecimate: 2.0,
      refineEdges: true,
    });

    console.log('✓ Detector created successfully');

    // Test with dummy grayscale image (100x100)
    const width = 100;
    const height = 100;
    const imageData = Buffer.alloc(width * height, 128); // Gray image

    const detections = detector.detect(width, height, imageData);
    console.log(`✓ Detection completed, found ${detections.length} tags`);

    // Test async detection
    const asyncDetections = await detector.detectAsync(width, height, imageData);
    console.log(`✓ Async detection completed, found ${asyncDetections.length} tags`);

    // Test parameter setting
    detector.setQuadSigma(1.0).setDecodeSharpening(0.5).setRefineEdges(false);
    console.log('✓ Parameters set successfully');

    console.log('\nBasic tests PASSED');
  } catch (error) {
    console.error('✗ Basic test failed:', error.message);
    allTestsPassed = false;
  }

  // Thread safety tests
  console.log('\n2. Thread Safety Tests');
  console.log('-'.repeat(30));
  
  try {
    const threadSafetyPassed = await testThreadSafety(20);
    if (!threadSafetyPassed) {
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('✗ Thread safety test failed:', error.message);
    allTestsPassed = false;
  }

  // Final results
  console.log('\n' + '=' .repeat(50));
  if (allTestsPassed) {
    console.log('ALL TESTS PASSED!');
    process.exit(0);
  } else {
    console.log('SOME TESTS FAILED');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
