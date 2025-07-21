import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const { AprilTagDetector } = require(join(__dirname, '..', 'build', 'Release', 'apriltag.node'));

export class AprilTag {
  constructor(family = 'tag36h11', options = {}) {
    this.detector = new AprilTagDetector(family);
    
    if (options.quadDecimate !== undefined) {
      this.detector.setQuadDecimate(options.quadDecimate);
    }
    
    if (options.quadSigma !== undefined) {
      this.detector.setQuadSigma(options.quadSigma);
    }
    
    if (options.refineEdges !== undefined) {
      this.detector.setRefineEdges(options.refineEdges);
    }
    
    if (options.decodeSharpening !== undefined) {
      this.detector.setDecodeSharpening(options.decodeSharpening);
    }
    
    if (options.numThreads !== undefined) {
      this.detector.setNumThreads(options.numThreads);
    }
  }

  detect(width, height, imageData) {
    if (typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Width and height must be numbers');
    }
    
    if (!Buffer.isBuffer(imageData) && !(imageData instanceof Uint8Array)) {
      throw new Error('Image data must be a Buffer or Uint8Array');
    }
    
    const buffer = Buffer.isBuffer(imageData) ? imageData : Buffer.from(imageData);
    
    if (buffer.length < width * height) {
      throw new Error(`Buffer too small: expected at least ${width * height} bytes, got ${buffer.length}`);
    }
    
    return this.detector.detect(width, height, buffer);
  }

  setQuadDecimate(value) {
    this.detector.setQuadDecimate(value);
    return this;
  }

  setQuadSigma(value) {
    this.detector.setQuadSigma(value);
    return this;
  }

  setRefineEdges(value) {
    this.detector.setRefineEdges(value);
    return this;
  }

  setDecodeSharpening(value) {
    this.detector.setDecodeSharpening(value);
    return this;
  }

  setNumThreads(value) {
    this.detector.setNumThreads(value);
    return this;
  }
}

export const FAMILIES = {
  TAG36H11: 'tag36h11',
  TAG25H9: 'tag25h9',
  TAG16H5: 'tag16h5',
  TAGCIRCLE21H7: 'tagCircle21h7',
  TAGCIRCLE49H12: 'tagCircle49h12',
  TAGCUSTOM48H12: 'tagCustom48h12',
  TAGSTANDARD41H12: 'tagStandard41h12',
  TAGSTANDARD52H13: 'tagStandard52h13'
};

export default AprilTag;