import AprilTag, { FAMILIES } from '../lib/index.js';
import { performance } from 'perf_hooks';

console.log('Testing all AprilTag families for constructor issues...\n');

const allFamilies = Object.values(FAMILIES);
const results = [];

for (const family of allFamilies) {
  console.log(`Testing ${family}...`);

  try {
    const startTime = performance.now();

    // Set a timeout to detect hangs
    const timeout = setTimeout(() => {
      console.log(`  ❌ TIMEOUT - Constructor hangs with ${family}`);
      process.exit(1);
    }, 5000); // 5 second timeout

    const detector = new AprilTag(family, {
      quadDecimate: 2.0,
      refineEdges: false,
      numThreads: 1,
    });

    clearTimeout(timeout);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`  ✅ Success in ${duration.toFixed(1)}ms`);
    results.push({ family, success: true, time: duration });
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    results.push({ family, success: false, error: error.message });
  }
}

console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));

const successful = results.filter((r) => r.success);
const failed = results.filter((r) => !r.success);

console.log(`\nSuccessful families (${successful.length}):`);
successful.forEach((r) => {
  console.log(`  ✅ ${r.family} (${r.time.toFixed(1)}ms)`);
});

if (failed.length > 0) {
  console.log(`\nFailed families (${failed.length}):`);
  failed.forEach((r) => {
    console.log(`  ❌ ${r.family} - ${r.error}`);
  });
}

console.log(
  `\nOverall: ${successful.length}/${allFamilies.length} families working`
);

if (failed.length > 0) {
  console.log(
    '\n⚠️  Some tag families have issues. Use only the successful ones.'
  );
  process.exit(1);
} else {
  console.log('\n🎉 All tag families working correctly!');
}
