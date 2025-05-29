import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { VideoPlayer } from './components/VideoPlayer';
import { ViolationFrames } from './components/ViolationFrames';
import { ViolationsTable } from './components/ViolationsTable';
import { TabSystem } from './components/TabSystem';

// Định nghĩa lại kiểu cho phù hợp với dữ liệu từ API
interface DetectionFrame {
  timestamp_ms: number;
  frame_image_base64: string;
  detections_in_frame: Array<{
    class: string;
    confidence: number;
    box_xyxy: [number, number, number, number];
  }>;
}

interface ApiErrorData { // Kiểu này nên đồng bộ với FileUpload.tsx
  error: string;
}

type ApiResult = DetectionFrame[] | ApiErrorData;

export function App() {
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [isAwaitingApiResponse, setIsAwaitingApiResponse] = useState(false);
  const [violations, setViolations] = useState<DetectionFrame[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [activeTab, setActiveTab] = useState('frames');

  const handleApiResults = (apiData: ApiResult, originalFile?: File) => {
    setIsAwaitingApiResponse(false);
    setIsProcessed(true);
    setApiError(null);
    setViolations([]);

    if (originalFile) {
      setUploadedVideoFile(originalFile);
    }

    if (apiData && 'error' in apiData) {
      console.error("Lỗi từ API:", apiData.error);
      setApiError(apiData.error);
    } else if (apiData) {
      console.log("Kết quả phát hiện từ API:", apiData);
      setViolations(apiData as DetectionFrame[]);
      if (apiData.length === 0) {
        setApiError("Không tìm thấy vi phạm nào trong video.");
      }
    } else {
      setApiError("Không nhận được dữ liệu từ API.");
    }
  };

  const handleFileSelectedForUpload = (file: File) => {
    setUploadedVideoFile(file);
    setIsAwaitingApiResponse(true);
    setIsProcessed(false);
    setViolations([]);
    setApiError(null);
  };

  return <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <FileUpload
            onFileSelected={handleFileSelectedForUpload}
            onApiResponse={handleApiResults}
            isProcessing={isAwaitingApiResponse}
          />
        </div>
        {apiError && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-400 rounded-md">
            <p><strong>Lỗi:</strong> {apiError}</p>
          </div>
        )}
        {uploadedVideoFile && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Video Review</h2>
            <VideoPlayer videoFile={uploadedVideoFile} />
          </div>
        )}
        {isProcessed && !apiError && violations.length > 0 && (
          <TabSystem activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'frames' && <ViolationFrames violations={violations} />}
            {activeTab === 'list' && <ViolationsTable violations={violations} />}
          </TabSystem>
        )}
        {isProcessed && !apiError && violations.length === 0 && !isAwaitingApiResponse && (
          <p className="text-center text-gray-600">Không tìm thấy vi phạm nào trong video đã xử lý.</p>
        )}
      </main>
    </div>;
}