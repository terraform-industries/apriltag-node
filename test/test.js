import AprilTag, { FAMILIES } from '../lib/index.js';
import { testThreadSafety } from './thread-safety.js';

// Helper function for test sections
function testSection(name) {
  console.log(`\n${name}`);
  console.log('-'.repeat(Math.max(30, name.length)));
}

// Test basic functionality
async function testBasicFunctionality() {
  testSection('1. Basic Functionality Tests');
  
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

  // Test sync detection
  const detections = detector.detect(width, height, imageData);
  console.log(`✓ Detection completed, found ${detections.length} tags`);

  // Test async detection
  const asyncDetections = await detector.detectAsync(width, height, imageData);
  console.log(`✓ Async detection completed, found ${asyncDetections.length} tags`);

  // Test parameter setting
  detector.setQuadSigma(1.0).setDecodeSharpening(0.5).setRefineEdges(false);
  console.log('✓ Parameters set successfully');

  return true;
}

// Test initialization methods
async function testInitialization() {
  testSection('2. Initialization Tests');
  
  // Test 1: Basic ensureInitialized
  const detector1 = new AprilTag(FAMILIES.TAG25H9);
  await detector1.ensureInitialized();
  console.log('✓ ensureInitialized() completed successfully');
  
  // Test 2: Double initialization (should be idempotent)
  const detector2 = new AprilTag(FAMILIES.TAG16H5);
  const init1 = await detector2.ensureInitialized();
  const init2 = await detector2.ensureInitialized();
  if (init1 === true && init2 === true) {
    console.log('✓ Double initialization handled correctly');
  } else {
    throw new Error('Double initialization returned unexpected values');
  }
  
  // Test 3: Multiple concurrent initialization calls (should return same promise)
  const detector3 = new AprilTag(FAMILIES.TAGCIRCLE21H7);
  const promises = [
    detector3.ensureInitialized(),
    detector3.ensureInitialized(),
    detector3.ensureInitialized(),
    detector3.ensureInitialized()
  ];
  
  const results = await Promise.all(promises);
  if (results.every(r => r === true)) {
    console.log('✓ Concurrent initialization calls handled correctly');
  } else {
    throw new Error('Concurrent initialization returned unexpected values');
  }
  
  // Test 4: Initialize then detect (should be fast)
  const detector4 = new AprilTag(FAMILIES.TAGSTANDARD41H12);
  const initStart = performance.now();
  await detector4.ensureInitialized();
  const initTime = performance.now() - initStart;
  
  const detectStart = performance.now();
  const dummyImage = Buffer.alloc(100 * 100, 128);
  await detector4.detectAsync(100, 100, dummyImage);
  const detectTime = performance.now() - detectStart;
  
  console.log(`✓ Pre-initialized detection completed (init: ${initTime.toFixed(1)}ms, detect: ${detectTime.toFixed(1)}ms)`);
  
  // Test 5: Race condition test - start detection and initialization simultaneously
  const detector5 = new AprilTag(FAMILIES.TAGSTANDARD52H13);
  const racePromises = [
    detector5.ensureInitialized(),
    detector5.detectAsync(100, 100, dummyImage),
    detector5.ensureInitialized(),
    detector5.detectAsync(100, 100, dummyImage)
  ];
  
  const raceResults = await Promise.allSettled(racePromises);
  if (raceResults.every(r => r.status === 'fulfilled')) {
    console.log('✓ Simultaneous initialization and detection handled correctly');
  } else {
    const failed = raceResults.filter(r => r.status === 'rejected');
    throw new Error(`Race condition test failed: ${failed.length} operations failed`);
  }
  
  return true;
}

// Test error handling
async function testErrorHandling() {
  testSection('3. Error Handling Tests');
  
  const detector = new AprilTag();
  
  // Test invalid dimensions
  try {
    detector.detect('invalid', 100, Buffer.alloc(100));
    throw new Error('Should have thrown for invalid width');
  } catch (error) {
    if (error.message.includes('Width and height must be numbers')) {
      console.log('✓ Invalid width type rejected correctly');
    } else {
      throw error;
    }
  }
  
  // Test invalid buffer
  try {
    detector.detect(100, 100, 'not a buffer');
    throw new Error('Should have thrown for invalid buffer');
  } catch (error) {
    if (error.message.includes('Image data must be a Buffer')) {
      console.log('✓ Invalid buffer type rejected correctly');
    } else {
      throw error;
    }
  }
  
  // Test buffer too small
  try {
    detector.detect(100, 100, Buffer.alloc(50));
    throw new Error('Should have thrown for small buffer');
  } catch (error) {
    if (error.message.includes('Buffer too small')) {
      console.log('✓ Small buffer rejected correctly');
    } else {
      throw error;
    }
  }
  
  // Test async errors
  try {
    await detector.detectAsync(100, 100, Buffer.alloc(50));
    throw new Error('Should have thrown for small buffer in async');
  } catch (error) {
    if (error.message.includes('Buffer too small')) {
      console.log('✓ Async small buffer rejected correctly');
    } else {
      throw error;
    }
  }
  
  return true;
}

// Test thread safety
async function testThreadSafetyWrapper() {
  testSection('4. Thread Safety Tests');
  return await testThreadSafety(20);
}

// Main test runner
async function runAllTests() {
  console.log('Testing AprilTag Node.js bindings...');
  console.log('=' .repeat(50));
  
  const testSuites = [
    { name: 'Basic Functionality', fn: testBasicFunctionality },
    { name: 'Initialization', fn: testInitialization },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Thread Safety', fn: testThreadSafetyWrapper }
  ];
  
  const results = [];
  
  for (const suite of testSuites) {
    try {
      const passed = await suite.fn();
      results.push({ suite: suite.name, passed });
      if (!passed) {
        console.log(`\n${suite.name} tests FAILED`);
      } else {
        console.log(`\n${suite.name} tests PASSED`);
      }
    } catch (error) {
      console.error(`\n✗ ${suite.name} test failed:`, error.message);
      results.push({ suite: suite.name, passed: false, error });
    }
  }
  
  // Final results
  console.log('\n' + '=' .repeat(50));
  console.log('TEST RESULTS SUMMARY:');
  results.forEach(r => {
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status} - ${r.suite}`);
  });
  
  const allPassed = results.every(r => r.passed);
  console.log('\n' + '=' .repeat(50));
  
  if (allPassed) {
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
