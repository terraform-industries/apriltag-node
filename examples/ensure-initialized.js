import AprilTag, { FAMILIES } from '../lib/index.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function demonstrateEnsureInitialized() {
  console.log('Demonstrating ensureInitialized() method');
  console.log('=' .repeat(50));
  
  const imagePath = join(__dirname, '..', 'DSC02867.JPG');
  
  // Load image
  const { data, info } = await sharp(imagePath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`\nImage dimensions: ${info.width}x${info.height}`);
  
  // Test 1: Without pre-initialization
  console.log('\n1. First detection WITHOUT pre-initialization:');
  console.log('-'.repeat(40));
  
  const detector1 = new AprilTag(FAMILIES.TAGSTANDARD52H13);
  
  const start1 = performance.now();
  const results1 = await detector1.detectAsync(info.width, info.height, data);
  const time1 = performance.now() - start1;
  
  console.log(`First detection took: ${time1.toFixed(2)}ms`);
  console.log(`Found ${results1.length} tags`);
  
  // Subsequent detection (should be faster)
  const start1b = performance.now();
  await detector1.detectAsync(info.width, info.height, data);
  const time1b = performance.now() - start1b;
  console.log(`Second detection took: ${time1b.toFixed(2)}ms (already initialized)`);
  
  // Test 2: With pre-initialization
  console.log('\n2. First detection WITH pre-initialization:');
  console.log('-'.repeat(40));
  
  const detector2 = new AprilTag(FAMILIES.TAGSTANDARD52H13);
  
  // Pre-initialize the detector
  console.log('Calling ensureInitialized()...');
  const initStart = performance.now();
  await detector2.ensureInitialized();
  const initTime = performance.now() - initStart;
  console.log(`Initialization took: ${initTime.toFixed(2)}ms`);
  
  // Now the first real detection should be faster
  const start2 = performance.now();
  const results2 = await detector2.detectAsync(info.width, info.height, data);
  const time2 = performance.now() - start2;
  
  console.log(`First detection took: ${time2.toFixed(2)}ms (pre-initialized)`);
  console.log(`Found ${results2.length} tags`);
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('SUMMARY:');
  console.log(`Without pre-init: First detection took ${time1.toFixed(2)}ms`);
  console.log(`With pre-init: Initialization ${initTime.toFixed(2)}ms + Detection ${time2.toFixed(2)}ms`);
  console.log(`\nPre-initialization is useful when you want to:`);
  console.log('- Separate initialization time from detection time');
  console.log('- Ensure the detector is ready before timing-critical operations');
  console.log('- Warm up the detector during application startup');
}

demonstrateEnsureInitialized().catch(console.error);