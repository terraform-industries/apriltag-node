import AprilTag, { FAMILIES } from '../lib/index.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function detectWithSettings(imageData, width, height, family, quadDecimate = 1.0) {
  const detector = new AprilTag(family, {
    quadDecimate,
    quadSigma: 0.0,
    refineEdges: true,
    decodeSharpening: 0.25
  });
  
  const detections = detector.detect(width, height, imageData);
  
  // Filter out detections with very low decision margins (likely false positives)
  const filteredDetections = detections.filter(det => det.decision_margin > 20);
  
  return filteredDetections;
}

async function focusedDetection(imagePath) {
  console.log(`Processing image: ${imagePath}`);
  
  try {
    // Load and convert image to grayscale
    const { data, info } = await sharp(imagePath)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    console.log(`Image dimensions: ${info.width}x${info.height}`);
    
    // Focus on the most promising families based on initial results
    const testConfigs = [
      { family: FAMILIES.TAG25H9, decimate: 1.0 },
      { family: FAMILIES.TAG25H9, decimate: 2.0 },
      { family: FAMILIES.TAG36H11, decimate: 1.0 },
      { family: FAMILIES.TAG36H11, decimate: 2.0 }
    ];
    
    console.log('\nTesting focused configurations...\n');
    
    for (const config of testConfigs) {
      console.log(`Testing ${config.family} with decimate=${config.decimate}...`);
      
      const detections = await detectWithSettings(
        data, 
        info.width, 
        info.height, 
        config.family, 
        config.decimate
      );
      
      if (detections.length > 0) {
        console.log(`✓ Found ${detections.length} high-confidence tag(s):`);
        console.log('-'.repeat(50));
        
        detections.forEach((detection, index) => {
          console.log(`Tag #${index + 1}:`);
          console.log(`  ID: ${detection.id}`);
          console.log(`  Hamming distance: ${detection.hamming}`);
          console.log(`  Decision margin: ${detection.decision_margin.toFixed(1)}`);
          console.log(`  Center: [${detection.center[0].toFixed(0)}, ${detection.center[1].toFixed(0)}]`);
          console.log(`  Corners:`);
          detection.corners.forEach((corner, i) => {
            console.log(`    [${corner[0].toFixed(0)}, ${corner[1].toFixed(0)}]`);
          });
          console.log('');
        });
        
        // Stop at first successful configuration to avoid redundancy
        console.log(`Successfully detected AprilTags using ${config.family}!`);
        break;
      } else {
        console.log('  No high-confidence detections found.');
      }
    }
    
  } catch (error) {
    console.error('Error processing image:', error.message);
    process.exit(1);
  }
}

// Get image path from command line or use default
const imagePath = process.argv[2] || join(__dirname, '..', 'DSC02867.JPG');

focusedDetection(imagePath);