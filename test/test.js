import AprilTag, { FAMILIES } from '../lib/index.js';

console.log('Testing AprilTag Node.js bindings...');

try {
  // Test detector creation
  const detector = new AprilTag(FAMILIES.TAG36H11, {
    quadDecimate: 2.0,
    refineEdges: true
  });
  
  console.log('✓ Detector created successfully');
  
  // Test with dummy grayscale image (100x100)
  const width = 100;
  const height = 100;
  const imageData = Buffer.alloc(width * height, 128); // Gray image
  
  const detections = detector.detect(width, height, imageData);
  console.log(`✓ Detection completed, found ${detections.length} tags`);
  
  // Test parameter setting
  detector.setQuadSigma(1.0)
          .setDecodeSharpening(0.5)
          .setRefineEdges(false);
  
  console.log('✓ Parameters set successfully');
  
  console.log('All tests passed!');
} catch (error) {
  console.error('✗ Test failed:', error.message);
  process.exit(1);
}