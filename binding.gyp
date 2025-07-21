{
  "targets": [
    {
      "target_name": "apriltag",
      "sources": [
        "src/apriltag_node.cc",
        "deps/apriltag/apriltag.c",
        "deps/apriltag/apriltag_pose.c",
        "deps/apriltag/apriltag_quad_thresh.c",
        "deps/apriltag/common/g2d.c",
        "deps/apriltag/common/getopt.c",
        "deps/apriltag/common/homography.c",
        "deps/apriltag/common/image_u8.c",
        "deps/apriltag/common/image_u8x3.c",
        "deps/apriltag/common/image_u8x4.c",
        "deps/apriltag/common/matd.c",
        "deps/apriltag/common/pam.c",
        "deps/apriltag/common/pjpeg.c",
        "deps/apriltag/common/pjpeg-idct.c",
        "deps/apriltag/common/pnm.c",
        "deps/apriltag/common/string_util.c",
        "deps/apriltag/common/svd22.c",
        "deps/apriltag/common/time_util.c",
        "deps/apriltag/common/unionfind.c",
        "deps/apriltag/common/workerpool.c",
        "deps/apriltag/common/zarray.c",
        "deps/apriltag/common/zhash.c",
        "deps/apriltag/common/zmaxheap.c",
        "deps/apriltag/tag16h5.c",
        "deps/apriltag/tag25h9.c",
        "deps/apriltag/tag36h11.c",
        "deps/apriltag/tagCircle21h7.c",
        "deps/apriltag/tagCircle49h12.c",
        "deps/apriltag/tagCustom48h12.c",
        "deps/apriltag/tagStandard41h12.c",
        "deps/apriltag/tagStandard52h13.c"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "deps/apriltag",
        "deps/apriltag/common"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "cflags": [ "-O3", "-march=native", "-ffast-math" ],
      "cflags_cc": [ "-O3", "-march=native", "-ffast-math" ],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.9",
        "GCC_OPTIMIZATION_LEVEL": "3",
        "OTHER_CFLAGS": [ "-O3", "-march=native", "-ffast-math" ],
        "OTHER_CPLUSPLUSFLAGS": [ "-O3", "-march=native", "-ffast-math" ]
      },
      "msvs_settings": {
        "VCCLCompilerTool": { 
          "ExceptionHandling": 1,
          "Optimization": 2,
          "InlineFunctionExpansion": 2,
          "EnableIntrinsicFunctions": "true",
          "FavorSizeOrSpeed": 1
        }
      },
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "NDEBUG"
      ]
    }
  ]
}