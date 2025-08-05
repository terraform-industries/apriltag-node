import AprilTag, { FAMILIES } from '../lib/index.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSingleThreadSafetyTest(runNumber, verbose = false) {
  const imagePath = join(__dirname, '..', 'DSC02867.JPG');

  // Load image
  const { data, info } = await sharp(imagePath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Create a fresh detector
  const detector = new AprilTag(FAMILIES.TAGSTANDARD52H13);

  if (verbose) {
    console.log(`Run ${runNumber}: Starting concurrent operations...`);
  }

  // Run sync and async detections concurrently
  // This tests if initialization is thread-safe
  const results = await Promise.allSettled([
    // Async detection 1
    (async () => {
      const start = performance.now();
      const result = await detector.detectAsync(info.width, info.height, data);
      return {
        type: 'async1',
        time: performance.now() - start,
        count: result.length,
      };
    })(),

    // Sync detection (will run on main thread)
    (async () => {
      const start = performance.now();
      const result = detector.detect(info.width, info.height, data);
      return {
        type: 'sync',
        time: performance.now() - start,
        count: result.length,
      };
    })(),

    // Async detection 2
    (async () => {
      const start = performance.now();
      const result = await detector.detectAsync(info.width, info.height, data);
      return {
        type: 'async2',
        time: performance.now() - start,
        count: result.length,
      };
    })(),

    // Async detection 3
    (async () => {
      const start = performance.now();
      const result = await detector.detectAsync(info.width, info.height, data);
      return {
        type: 'async3',
        time: performance.now() - start,
        count: result.length,
      };
    })(),
  ]);

  let allSuccess = true;
  const issues = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const { type, time, count } = result.value;
      if (count !== 10) {
        allSuccess = false;
        issues.push(`${type}: Expected 10 tags, found ${count}`);
      }
    } else {
      allSuccess = false;
      issues.push(`Operation ${i} failed: ${result.reason}`);
    }
  });

  if (verbose && !allSuccess) {
    console.log(`Run ${runNumber} FAILED:`, issues.join(', '));
  }

  return allSuccess;
}

export async function testThreadSafety(numRuns = 20) {
  console.log('Testing thread safety with concurrent sync/async calls...');
  console.log(`Running ${numRuns} iterations to check for race conditions...`);

  let passCount = 0;
  let failCount = 0;
  const failedRuns = [];

  for (let i = 1; i <= numRuns; i++) {
    process.stdout.write(`\nProgress: ${i}/${numRuns}\n`);
    try {
      const success = await runSingleThreadSafetyTest(i, false);
      if (success) {
        passCount++;
      } else {
        failCount++;
        failedRuns.push(i);
      }
    } catch (error) {
      failCount++;
      failedRuns.push(i);
      console.error(`\nRun ${i} threw error:`, error.message);
    }
  }

  console.log('\n');
  console.log('Thread Safety Test Results:');
  console.log('-'.repeat(40));
  console.log(`Total runs: ${numRuns}`);
  console.log(
    `Passed: ${passCount} (${((passCount / numRuns) * 100).toFixed(1)}%)`
  );
  console.log(
    `Failed: ${failCount} (${((failCount / numRuns) * 100).toFixed(1)}%)`
  );

  if (failedRuns.length > 0) {
    console.log(`Failed runs: ${failedRuns.join(', ')}`);
  }

  if (failCount === 0) {
    console.log(
      '\nTHREAD SAFETY TEST PASSED - All runs completed successfully!'
    );
    return true;
  } else {
    console.log('\nTHREAD SAFETY TEST FAILED - Race conditions detected');
    console.log('Running one more verbose test to show the issue...');
    await runSingleThreadSafetyTest('verbose', true);
    return false;
  }
}

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testThreadSafety(50)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test error:', error);
      process.exit(1);
    });
}
