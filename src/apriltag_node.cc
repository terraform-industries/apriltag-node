#include <napi.h>
#include <iostream>
#include <vector>
#include <memory>
#include <thread>

extern "C" {
#include "apriltag.h"
#include "tag36h11.h"
#include "tag25h9.h"
#include "tag16h5.h"
#include "tagCircle21h7.h"
#include "tagCircle49h12.h"
#include "tagCustom48h12.h"
#include "tagStandard41h12.h"
#include "tagStandard52h13.h"
#include "common/image_u8.h"
}

using namespace Napi;

class AprilTagDetector : public Napi::ObjectWrap<AprilTagDetector> {
private:
    apriltag_detector_t* td;
    apriltag_family_t* tf;
    std::string family_name;
    bool family_initialized;

public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    AprilTagDetector(const Napi::CallbackInfo& info);
    ~AprilTagDetector();
    
    Napi::Value Detect(const Napi::CallbackInfo& info);
    Napi::Value SetQuadDecimate(const Napi::CallbackInfo& info);
    Napi::Value SetQuadSigma(const Napi::CallbackInfo& info);
    Napi::Value SetRefineEdges(const Napi::CallbackInfo& info);
    Napi::Value SetDecodeSharpening(const Napi::CallbackInfo& info);
    Napi::Value SetNumThreads(const Napi::CallbackInfo& info);
    
private:
    void InitializeFamily();
};

Napi::Object AprilTagDetector::Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "AprilTagDetector", {
        InstanceMethod("detect", &AprilTagDetector::Detect),
        InstanceMethod("setQuadDecimate", &AprilTagDetector::SetQuadDecimate),
        InstanceMethod("setQuadSigma", &AprilTagDetector::SetQuadSigma),
        InstanceMethod("setRefineEdges", &AprilTagDetector::SetRefineEdges),
        InstanceMethod("setDecodeSharpening", &AprilTagDetector::SetDecodeSharpening),
        InstanceMethod("setNumThreads", &AprilTagDetector::SetNumThreads)
    });

    Napi::FunctionReference* constructor = new Napi::FunctionReference();
    *constructor = Napi::Persistent(func);
    env.SetInstanceData(constructor);

    exports.Set("AprilTagDetector", func);
    return exports;
}

AprilTagDetector::AprilTagDetector(const Napi::CallbackInfo& info) : Napi::ObjectWrap<AprilTagDetector>(info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected family name").ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "Family name must be a string").ThrowAsJavaScriptException();
        return;
    }

    family_name = info[0].As<Napi::String>().Utf8Value();
    family_initialized = false;
    tf = nullptr;
    
    td = apriltag_detector_create();
    
    // Enable multithreading - use all available cores
    td->nthreads = std::thread::hardware_concurrency();
    if (td->nthreads == 0) td->nthreads = 4;  // fallback
}

AprilTagDetector::~AprilTagDetector() {
    if (td && tf) {
        apriltag_detector_remove_family(td, tf);
        apriltag_detector_destroy(td);
        
        if (tf->name && strcmp(tf->name, "tag36h11") == 0) {
            tag36h11_destroy(tf);
        } else if (tf->name && strcmp(tf->name, "tag25h9") == 0) {
            tag25h9_destroy(tf);
        } else if (tf->name && strcmp(tf->name, "tag16h5") == 0) {
            tag16h5_destroy(tf);
        } else if (tf->name && strcmp(tf->name, "tagCircle21h7") == 0) {
            tagCircle21h7_destroy(tf);
        } else if (tf->name && strcmp(tf->name, "tagCircle49h12") == 0) {
            tagCircle49h12_destroy(tf);
        } else if (tf->name && strcmp(tf->name, "tagCustom48h12") == 0) {
            tagCustom48h12_destroy(tf);
        } else if (tf->name && strcmp(tf->name, "tagStandard41h12") == 0) {
            tagStandard41h12_destroy(tf);
        } else if (tf->name && strcmp(tf->name, "tagStandard52h13") == 0) {
            tagStandard52h13_destroy(tf);
        }
    } else if (td) {
        apriltag_detector_destroy(td);
    }
}

void AprilTagDetector::InitializeFamily() {
    if (family_initialized) return;
    
    std::cout << "AprilTag: Initializing family " << family_name << "..." << std::endl;
    std::cout.flush();
    
    if (family_name == "tag36h11") {
        tf = tag36h11_create();
    } else if (family_name == "tag25h9") {
        tf = tag25h9_create();
    } else if (family_name == "tag16h5") {
        tf = tag16h5_create();
    } else if (family_name == "tagCircle21h7") {
        tf = tagCircle21h7_create();
    } else if (family_name == "tagCircle49h12") {
        tf = tagCircle49h12_create();
    } else if (family_name == "tagCustom48h12") {
        tf = tagCustom48h12_create();
    } else if (family_name == "tagStandard41h12") {
        tf = tagStandard41h12_create();
    } else if (family_name == "tagStandard52h13") {
        tf = tagStandard52h13_create();
    } else {
        tf = tag36h11_create();
    }
    
    apriltag_detector_add_family_bits(td, tf, 1);
    
    family_initialized = true;
}

Napi::Value AprilTagDetector::Detect(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // Initialize family lazily on first detection
    if (!family_initialized) {
        InitializeFamily();
    }
    
    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected width, height, and image data").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsBuffer()) {
        Napi::TypeError::New(env, "Invalid arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    int width = info[0].As<Napi::Number>().Int32Value();
    int height = info[1].As<Napi::Number>().Int32Value();
    Napi::Buffer<uint8_t> buffer = info[2].As<Napi::Buffer<uint8_t>>();
    
    if (buffer.Length() < width * height) {
        Napi::TypeError::New(env, "Buffer too small for image dimensions").ThrowAsJavaScriptException();
        return env.Null();
    }

    image_u8_t im = { 
        .width = width,
        .height = height,
        .stride = width,
        .buf = buffer.Data()
    };

    zarray_t* detections = apriltag_detector_detect(td, &im);

    Napi::Array results = Napi::Array::New(env, zarray_size(detections));
    
    for (int i = 0; i < zarray_size(detections); i++) {
        apriltag_detection_t* det;
        zarray_get(detections, i, &det);
        
        Napi::Object detection = Napi::Object::New(env);
        detection.Set("id", Napi::Number::New(env, det->id));
        detection.Set("hamming", Napi::Number::New(env, det->hamming));
        detection.Set("decision_margin", Napi::Number::New(env, det->decision_margin));
        
        Napi::Array center = Napi::Array::New(env, 2);
        center.Set(0u, Napi::Number::New(env, det->c[0]));
        center.Set(1u, Napi::Number::New(env, det->c[1]));
        detection.Set("center", center);
        
        Napi::Array corners = Napi::Array::New(env, 4);
        for (int j = 0; j < 4; j++) {
            Napi::Array corner = Napi::Array::New(env, 2);
            corner.Set(0u, Napi::Number::New(env, det->p[j][0]));
            corner.Set(1u, Napi::Number::New(env, det->p[j][1]));
            corners.Set(j, corner);
        }
        detection.Set("corners", corners);
        
        results.Set(i, detection);
    }
    
    apriltag_detections_destroy(detections);
    return results;
}

Napi::Value AprilTagDetector::SetQuadDecimate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected number").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    td->quad_decimate = info[0].As<Napi::Number>().FloatValue();
    return env.Undefined();
}

Napi::Value AprilTagDetector::SetQuadSigma(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected number").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    td->quad_sigma = info[0].As<Napi::Number>().FloatValue();
    return env.Undefined();
}

Napi::Value AprilTagDetector::SetRefineEdges(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsBoolean()) {
        Napi::TypeError::New(env, "Expected boolean").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    td->refine_edges = info[0].As<Napi::Boolean>().Value() ? 1 : 0;
    return env.Undefined();
}

Napi::Value AprilTagDetector::SetDecodeSharpening(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected number").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    td->decode_sharpening = info[0].As<Napi::Number>().DoubleValue();
    return env.Undefined();
}

Napi::Value AprilTagDetector::SetNumThreads(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected number").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    int nthreads = info[0].As<Napi::Number>().Int32Value();
    if (nthreads <= 0) {
        // Auto-detect threads
        nthreads = std::thread::hardware_concurrency();
        if (nthreads == 0) nthreads = 4;  // fallback
    }
    if (nthreads > 32) nthreads = 32;  // reasonable upper limit
    td->nthreads = nthreads;
    return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return AprilTagDetector::Init(env, exports);
}

NODE_API_MODULE(apriltag, Init)