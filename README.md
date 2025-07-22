# apriltag-node

Node.js bindings for the AprilTag fiducial marker detection library.

## Usage

Install the [@monumental-works/apriltag-node](www.npmjs.com/package/@monumental-works/apriltag-node) NPM package.

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

- `family`: Tag family (default: `FAMILIES.TAG36H11`)
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

- `tag36h11` (default) - Recommended for general use
- `tag25h9` - Good balance of performance and robustness
- `tag16h5` - Fewer unique tags available
- `tagCircle21h7` - Circular design
- `tagStandard41h12` - Standard format
- `tagCircle49h12` - Large lookup table with 49-bit codes
- `tagCustom48h12` - Large lookup table with 48-bit codes
- `tagStandard52h13` - Largest family with 52-bit codes

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
