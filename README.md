# apriltag-node

Node.js bindings for the AprilTag fiducial marker detection library.

## Installation

```bash
npm install
npm run build
```

## Usage

```javascript
import AprilTag, { FAMILIES } from 'apriltag-node';

// Create detector with default tag36h11 family
const detector = new AprilTag();

// Or specify family and options
const detector = new AprilTag(FAMILIES.TAG36H11, {
  quadDecimate: 2.0,
  quadSigma: 0.0,
  refineEdges: true,
  decodeSharpening: 0.25,
});

// Detect tags in grayscale image
const detections = detector.detect(width, height, imageBuffer);

detections.forEach((detection) => {
  console.log(`Tag ID: ${detection.id}`);
  console.log(`Center: [${detection.center[0]}, ${detection.center[1]}]`);
  console.log(`Corners:`, detection.corners);
});
```

## API

### Constructor

```javascript
new AprilTag(family?, options?)
```

- `family`: Tag family (default: 'tag36h11')
- `options`: Detection options
  - `quadDecimate`: Quad decimation factor
  - `quadSigma`: Gaussian blur sigma
  - `refineEdges`: Enable edge refinement
  - `decodeSharpening`: Decode sharpening factor

### Methods

- `detect(width, height, imageData)`: Detect tags in grayscale image
- `setQuadDecimate(value)`: Set quad decimation
- `setQuadSigma(value)`: Set Gaussian blur sigma
- `setRefineEdges(value)`: Enable/disable edge refinement
- `setDecodeSharpening(value)`: Set decode sharpening

### Supported Tag Families

**Fast initialization:**

- `tag36h11` (default) - Recommended for general use
- `tag25h9` - Good balance of performance and robustness
- `tag16h5` - Fastest initialization, fewer unique tags
- `tagCircle21h7` - Circular design
- `tagStandard41h12` - Standard format

**Large families (slower initialization):**

- `tagCircle49h12` ⚠️ - Large lookup table, first detection ~10-30s
- `tagCustom48h12` ⚠️ - Large lookup table, first detection ~10-30s
- `tagStandard52h13` ⚠️ - Largest family, first detection ~30-60s

**Performance Notes:**

- Constructor is fast with lazy initialization
- First detection initializes the tag family (one-time cost)
- Subsequent detections use cached initialization
- Large families have 10K-50K tag codes vs ~600 for small families
- Consider using `tag36h11` or `tag25h9` for real-time applications
