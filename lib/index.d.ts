export interface AprilTagDetection {
  id: number;
  hamming: number;
  decision_margin: number;
  center: [number, number];
  corners: [number, number][];
}

export interface AprilTagOptions {
  quadDecimate?: number;
  quadSigma?: number;
  refineEdges?: boolean;
  decodeSharpening?: number;
  numThreads?: number;
}

export type AprilTagFamily = 
  | 'tag36h11'
  | 'tag25h9'
  | 'tag16h5'
  | 'tagCircle21h7'
  | 'tagCircle49h12'
  | 'tagCustom48h12'
  | 'tagStandard41h12'
  | 'tagStandard52h13';

export declare class AprilTag {
  constructor(family?: AprilTagFamily, options?: AprilTagOptions);
  
  detect(width: number, height: number, imageData: Buffer | Uint8Array): AprilTagDetection[];
  
  setQuadDecimate(value: number): this;
  setQuadSigma(value: number): this;
  setRefineEdges(value: boolean): this;
  setDecodeSharpening(value: number): this;
  setNumThreads(value: number): this;
}

export declare const FAMILIES: {
  readonly TAG36H11: 'tag36h11';
  readonly TAG25H9: 'tag25h9';
  readonly TAG16H5: 'tag16h5';
  readonly TAGCIRCLE21H7: 'tagCircle21h7';
  readonly TAGCIRCLE49H12: 'tagCircle49h12';  // ⚠️  Large family - slow initialization
  readonly TAGCUSTOM48H12: 'tagCustom48h12';  // ⚠️  Large family - slow initialization
  readonly TAGSTANDARD41H12: 'tagStandard41h12';
  readonly TAGSTANDARD52H13: 'tagStandard52h13';  // ⚠️  Large family - slow initialization
};

export default AprilTag;