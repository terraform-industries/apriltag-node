import AprilTag, { FAMILIES } from '../lib/index.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function demonstrateAsyncDetection(imagePath) {
  console.log(`Processing image: ${imagePath}`);

  try {
    // Load and convert image to grayscale
    const { data, info } = await sharp(imagePath)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    console.log(`Image dimensions: ${info.width}x${info.height}`);

    // Create AprilTag detector
    const detector = new AprilTag(FAMILIES.TAGSTANDARD52H13, {
      quadDecimate: 2.0,
      quadSigma: 0.0,
      refineEdges: true,
      decodeSharpening: 0.25,
    });

    console.log('\nStarting async detection...');

    // Demonstrate non-blocking behavior
    const startTime = performance.now();

    // Start the async detection
    const detectionPromise = detector.detectAsync(
      info.width,
      info.height,
      data
    );

    // This loop will continue running while detection happens in background
    const intervalId = setInterval(() => {
      process.stdout.write(
        `Main thread still responsive (${(performance.now() - startTime).toFixed(2)}ms elapsed)\r`
      );
    }, 10);

    // Wait for detection to complete
    const detections = await detectionPromise;

    clearInterval(intervalId);
    const detectionTime = performance.now() - startTime;
    console.log(`\nDetection completed in ${detectionTime}ms`);

    console.log(`\nFound ${detections.length} AprilTag(s):`);
    console.log('='.repeat(50));

    detections.forEach((detection, index) => {
      console.log(`\n📍 Tag #${index + 1}:`);
      console.log(`   ID: ${detection.id}`);
    });

    if (detections.length === 0) {
      console.log('\n❌ No AprilTags detected. Try:');
      console.log('   • Different tag family (tag25h9, tag16h5, etc.)');
      console.log('   • Adjusting detection parameters');
      console.log('   • Ensuring the image contains valid AprilTags');
    }

    // Compare with sync version timing
    console.log('\nPerformance Comparison:');
    console.log('-'.repeat(30));

    const syncStartTime = Date.now();
    detector.detect(info.width, info.height, data);
    const syncTime = Date.now() - syncStartTime;

    console.log(`Async detection: ${detectionTime}ms (non-blocking)`);
    console.log(`Sync detection:  ${syncTime}ms (blocking)`);
    console.log(
      `Main thread was free for ${detectionTime}ms with async version!`
    );
  } catch (error) {
    console.error('❌ Error processing image:', error.message);
    process.exit(1);
  }
}

// Get image path from command line or use default
const imagePath = process.argv[2] || join(__dirname, '..', 'DSC02867.JPG');

demonstrateAsyncDetection(imagePath);
