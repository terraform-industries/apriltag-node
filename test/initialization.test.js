import AprilTag, { FAMILIES } from '../lib/index.js';

async function measureTime(fn) {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}

async function testInitializationBehavior() {
  console.log('Testing AprilTag Initialization Behavior');
  console.log('=' .repeat(50));
  
  const tests = [];
  
  // Test 1: Verify promise caching
  console.log('\n1. Promise Caching Test');
  console.log('-'.repeat(30));
  {
    const detector = new AprilTag(FAMILIES.TAG36H11);
    const promise1 = detector.ensureInitialized();
    const promise2 = detector.ensureInitialized();
    const promise3 = detector.ensureInitialized();
    
    if (promise1 === promise2 && promise2 === promise3) {
      console.log('✓ Same promise returned for multiple calls');
      tests.push({ name: 'Promise caching', passed: true });
    } else {
      console.log('✗ Different promises returned');
      tests.push({ name: 'Promise caching', passed: false });
    }
    
    await Promise.all([promise1, promise2, promise3]);
  }
  
  // Test 2: Verify initialization happens only once
  console.log('\n2. Single Initialization Test');
  console.log('-'.repeat(30));
  {
    const detector = new AprilTag(FAMILIES.TAGCIRCLE49H12);
    
    // We can't easily count C++ stdout messages, so we'll test that
    // multiple ensureInitialized calls return the same promise
    const promise1 = detector.ensureInitialized();
    const promise2 = detector.ensureInitialized();
    
    // Start a detection while initialization is happening
    const detectPromise = detector.detectAsync(10, 10, Buffer.alloc(100, 128));
    const promise3 = detector.ensureInitialized();
    
    await Promise.all([promise1, promise2, promise3, detectPromise]);
    
    // All initialization promises should be the same reference
    if (promise1 === promise2 && promise2 === promise3) {
      console.log('✓ Same promise returned for all initialization calls');
      tests.push({ name: 'Single initialization', passed: true });
    } else {
      console.log('✗ Different promises returned');
      tests.push({ name: 'Single initialization', passed: false });
    }
  }
  
  // Test 3: Performance comparison
  console.log('\n3. Performance Impact Test');
  console.log('-'.repeat(30));
  {
    // Without pre-initialization
    const detector1 = new AprilTag(FAMILIES.TAGSTANDARD52H13);
    const { time: firstDetectTime } = await measureTime(() => 
      detector1.detectAsync(100, 100, Buffer.alloc(10000, 128))
    );
    
    const { time: secondDetectTime } = await measureTime(() => 
      detector1.detectAsync(100, 100, Buffer.alloc(10000, 128))
    );
    
    // With pre-initialization
    const detector2 = new AprilTag(FAMILIES.TAGSTANDARD52H13);
    const { time: initTime } = await measureTime(() => 
      detector2.ensureInitialized()
    );
    
    const { time: preInitDetectTime } = await measureTime(() => 
      detector2.detectAsync(100, 100, Buffer.alloc(10000, 128))
    );
    
    console.log(`Without pre-init: First detect ${firstDetectTime.toFixed(1)}ms, Second ${secondDetectTime.toFixed(1)}ms`);
    console.log(`With pre-init: Init ${initTime.toFixed(1)}ms, First detect ${preInitDetectTime.toFixed(1)}ms`);
    
    // Pre-initialized first detection should be closer to second detection time
    const improvement = Math.abs(preInitDetectTime - secondDetectTime) < Math.abs(firstDetectTime - secondDetectTime);
    if (improvement) {
      console.log('✓ Pre-initialization improves first detection performance');
      tests.push({ name: 'Performance improvement', passed: true });
    } else {
      console.log('✗ Pre-initialization did not improve performance as expected');
      tests.push({ name: 'Performance improvement', passed: false });
    }
  }
  
  // Test 4: Different families initialize independently
  console.log('\n4. Independent Family Initialization Test');
  console.log('-'.repeat(30));
  {
    const families = [FAMILIES.TAG36H11, FAMILIES.TAG25H9, FAMILIES.TAG16H5];
    const detectors = families.map(f => new AprilTag(f));
    
    // Initialize all in parallel
    const initPromises = detectors.map(d => d.ensureInitialized());
    const results = await Promise.allSettled(initPromises);
    
    if (results.every(r => r.status === 'fulfilled' && r.value === true)) {
      console.log(`✓ All ${families.length} families initialized independently`);
      tests.push({ name: 'Independent initialization', passed: true });
    } else {
      console.log('✗ Some families failed to initialize');
      tests.push({ name: 'Independent initialization', passed: false });
    }
  }
  
  // Test 5: Initialization survives detection errors
  console.log('\n5. Error Resilience Test');
  console.log('-'.repeat(30));
  {
    const detector = new AprilTag(FAMILIES.TAGCIRCLE21H7);
    await detector.ensureInitialized();
    
    // Try detection with invalid buffer (should fail but not affect initialization)
    try {
      await detector.detectAsync(100, 100, Buffer.alloc(50));
    } catch (e) {
      // Expected error
    }
    
    // Should still work with valid buffer
    const result = await detector.detectAsync(10, 10, Buffer.alloc(100, 128));
    if (Array.isArray(result)) {
      console.log('✓ Detector still works after error');
      tests.push({ name: 'Error resilience', passed: true });
    } else {
      console.log('✗ Detector broken after error');
      tests.push({ name: 'Error resilience', passed: false });
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('INITIALIZATION TEST RESULTS:');
  tests.forEach(t => {
    const status = t.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status} - ${t.name}`);
  });
  
  const allPassed = tests.every(t => t.passed);
  console.log('\n' + (allPassed ? 'ALL INITIALIZATION TESTS PASSED!' : 'SOME TESTS FAILED'));
  
  return allPassed;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testInitializationBehavior()
    .then(passed => process.exit(passed ? 0 : 1))
    .catch(error => {
      console.error('Test error:', error);
      process.exit(1);
    });
}