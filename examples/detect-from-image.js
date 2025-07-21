import AprilTag, { FAMILIES } from "../lib/index.js";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function detectAprilTags(imagePath) {
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

    console.log("Running AprilTag detection...");

    // Detect AprilTags
    const detections = detector.detect(info.width, info.height, data);

    console.log(`\nFound ${detections.length} AprilTag(s):`);
    console.log("=".repeat(50));

    detections.forEach((detection, index) => {
      console.log(`\nTag #${index + 1}:`);
      console.log(`  ID: ${detection.id}`);
      console.log(`  Hamming distance: ${detection.hamming}`);
      console.log(`  Decision margin: ${detection.decision_margin.toFixed(3)}`);
      console.log(
        `  Center: [${detection.center[0].toFixed(
          2
        )}, ${detection.center[1].toFixed(2)}]`
      );
      console.log(`  Corners:`);
      detection.corners.forEach((corner, i) => {
        console.log(
          `    Corner ${i}: [${corner[0].toFixed(2)}, ${corner[1].toFixed(2)}]`
        );
      });
    });

    if (detections.length === 0) {
      console.log("\nNo AprilTags detected. You might want to try:");
      console.log("- Different tag family (tag25h9, tag16h5, etc.)");
      console.log("- Adjusting detection parameters");
      console.log("- Ensuring the image contains valid AprilTags");
    }
  } catch (error) {
    console.error("Error processing image:", error.message);
    process.exit(1);
  }
}

// Get image path from command line or use default
const imagePath = process.argv[2] || join(__dirname, "..", "DSC02867.JPG");

detectAprilTags(imagePath);
