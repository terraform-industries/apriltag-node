# apriltag-node

Node.js bindings for the AprilTag fiducial marker detection library.

## Usage

Install the [@monumental-works/apriltag-node](https://www.npmjs.com/package/@monumental-works/apriltag-node) NPM package.

```javascript
import AprilTag, { FAMILIES } from '@monumental-works/apriltag-node';

// Create detector with default tag36h11 family
const detector = new AprilTag();

// Or specify family and options
const detector = new AprilTag(FAMILIES.TAG36H11, {
  quadDecimate: 2.0,
  quadSigma: 0.0,
  refineEdges: true,
  decodeSharpening: 0.25,
});

// Synchronous detection (blocks main thread)
const detections = detector.detect(width, height, imageBuffer);

// Asynchronous detection (non-blocking)
const detections = await detector.detectAsync(width, height, imageBuffer);

// Optionally pre-initialize for consistent timing
await detector.ensureInitialized();

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

- `family`: Tag family (default: `FAMILIES.TAG36H11`)
- `options`: Detection options
  - `quadDecimate`: Quad decimation factor
  - `quadSigma`: Gaussian blur sigma
  - `refineEdges`: Enable edge refinement
  - `decodeSharpening`: Decode sharpening factor
  - `numThreads`: Number of threads for detection

### Methods

#### Detection Methods

- `detect(width, height, imageData)`: Detect tags synchronously (blocks main thread)
  - Returns: `AprilTagDetection[]` - Array of detected tags
- `detectAsync(width, height, imageData)`: Detect tags asynchronously (non-blocking)
  - Returns: `Promise<AprilTagDetection[]>` - Promise that resolves to detected tags
- `ensureInitialized()`: Pre-initialize the detector for consistent timing
  - Returns: `Promise<boolean>` - Promise that resolves when initialization is complete
  - Multiple calls return the same promise instance (cached)
  - Useful for warming up the detector before timing-critical operations

#### Configuration Methods

- `setQuadDecimate(value)`: Set quad decimation
- `setQuadSigma(value)`: Set Gaussian blur sigma
- `setRefineEdges(value)`: Enable/disable edge refinement
- `setDecodeSharpening(value)`: Set decode sharpening
- `setNumThreads(value)`: Set number of threads for detection

### Supported Tag Families

- `tag36h11` (default) - Recommended for general use
- `tag25h9` - Good balance of performance and robustness
- `tag16h5` - Fewer unique tags available
- `tagCircle21h7` - Circular design
- `tagStandard41h12` - Standard format
- `tagCircle49h12` - Large lookup table with 49-bit codes
- `tagCustom48h12` - Large lookup table with 48-bit codes
- `tagStandard52h13` - Largest family with 52-bit codes

## Performance & Threading

### Asynchronous Detection

The `detectAsync()` method runs detection on a background thread, keeping the main Node.js thread free for other operations:

```javascript
// Start detection without blocking
const detectionPromise = detector.detectAsync(width, height, imageBuffer);

// Main thread remains responsive
setInterval(() => {
  console.log('Main thread is free!');
}, 100);

// Wait for results when needed
const detections = await detectionPromise;
```

### Pre-initialization

Tag family initialization can be slow (50-150ms for large families). Use `ensureInitialized()` to pre-warm the detector:

```javascript
const detector = new AprilTag(FAMILIES.TAGSTANDARD52H13);

// Pre-initialize to avoid delay on first detection
await detector.ensureInitialized();

// Subsequent detections start immediately
const detections = await detector.detectAsync(width, height, imageBuffer);
```

### Thread Safety

Both sync and async detection methods can be called concurrently from multiple async operations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### AprilTag Library

This package includes the [AprilTag library](https://github.com/AprilRobotics/apriltag) developed by the APRIL Robotics Laboratory at the University of Michigan. The AprilTag library is licensed under the BSD 2-Clause License.

**AprilTag Citation:**

```
@INPROCEEDINGS{wang2016iros,
  author = {John Wang and Edwin Olson},
  title = {{AprilTag 2: Efficient and robust fiducial detection}},
  booktitle = {Proceedings of the {IEEE} International Conference on Robotics and
               Automation ({ICRA})},
  year = {2016},
  month = {May},
}
```

For more information about AprilTag, visit: https://april.eecs.umich.edu/software/apriltag
