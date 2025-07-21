import AprilTag, { FAMILIES } from '../lib/index.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function detectWithFamily(imageData, width, height, family, options = {}) {
  const detector = new AprilTag(family, {
    quadDecimate: 1.0,  // Higher precision
    quadSigma: 0.0,
    refineEdges: true,
    decodeSharpening: 0.25,
    ...options
  });
  
  const detections = detector.detect(width, height, imageData);
  return { family, detections, options };
}

async function comprehensiveDetection(imagePath) {
  console.log(`Processing image: ${imagePath}`);
  
  try {
    // Load and convert image to grayscale
    const { data, info } = await sharp(imagePath)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    console.log(`Image dimensions: ${info.width}x${info.height}`);
    
    // Try all tag families
    const families = Object.values(FAMILIES);
    const allResults = [];
    
    console.log('\nTrying different tag families...');
    
    for (const family of families) {
      console.log(`Testing ${family}...`);
      
      // Try with different quad_decimate values
      const decimateValues = [1.0, 2.0, 3.0];
      
      for (const decimate of decimateValues) {
        const result = await detectWithFamily(data, info.width, info.height, family, {
          quadDecimate: decimate
        });
        
        if (result.detections.length > 0) {
          allResults.push(result);
          console.log(`  ✓ Found ${result.detections.length} tags with decimate=${decimate}`);
        }
      }
    }
    
    // Report all successful detections
    if (allResults.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`SUMMARY: Found detections with ${allResults.length} different configurations:`);
      console.log(`${'='.repeat(60)}`);
      
      allResults.forEach((result, configIndex) => {
        console.log(`\nConfiguration #${configIndex + 1}: ${result.family} (decimate=${result.options.quadDecimate})`);
        console.log(`Found ${result.detections.length} tag(s):`);
        
        result.detections.forEach((detection, index) => {
          console.log(`\n  Tag #${index + 1}:`);
          console.log(`    ID: ${detection.id}`);
          console.log(`    Hamming: ${detection.hamming}`);
          console.log(`    Decision margin: ${detection.decision_margin.toFixed(3)}`);
          console.log(`    Center: [${detection.center[0].toFixed(1)}, ${detection.center[1].toFixed(1)}]`);
          console.log(`    Corners:`);
          detection.corners.forEach((corner, i) => {
            console.log(`      [${corner[0].toFixed(1)}, ${corner[1].toFixed(1)}]`);
          });
        });
      });
      
      // Show the best result (most detections)
      const bestResult = allResults.reduce((best, current) => 
        current.detections.length > best.detections.length ? current : best
      );
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`BEST RESULT: ${bestResult.family} with ${bestResult.detections.length} detections`);
      console.log(`${'='.repeat(60)}`);
      
    } else {
      console.log('\nNo AprilTags detected with any configuration.');
      console.log('This could mean:');
      console.log('- The tags in the image are not AprilTags');
      console.log('- The image resolution is too high/low');
      console.log('- The tags are partially occluded or distorted');
      console.log('- Different detection parameters are needed');
    }
    
  } catch (error) {
    console.error('Error processing image:', error.message);
    process.exit(1);
  }
}

// Get image path from command line or use default
const imagePath = process.argv[2] || join(__dirname, '..', 'DSC02867.JPG');

comprehensiveDetection(imagePath);