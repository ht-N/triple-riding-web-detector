import React, { useRef, useState } from 'react';
import { UploadIcon, LoaderIcon } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho kết quả từ API
interface DetectionFrame {
  timestamp_ms: number;
  frame_image_base64: string;
  detections_in_frame: Array<{
    class: string;
    confidence: number;
    box_xyxy: [number, number, number, number];
  }>;
}

interface ApiError {
  error: string;
}

type ApiResult = DetectionFrame[] | ApiError;

interface FileUploadProps {
  onFileSelected: (file: File) => void; // Callback khi file được chọn, trước khi gọi API
  onApiResponse: (data: ApiResult, originalFile?: File) => void; // Callback sau khi API trả về
  isProcessing?: boolean; // Prop từ component cha (ví dụ: isAwaitingApiResponse)
}

export function FileUpload({
  onFileSelected,
  onApiResponse,
  isProcessing // Trạng thái xử lý từ App.tsx
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // isUploading nội bộ không cần thiết nữa nếu App.tsx quản lý isProcessing (isAwaitingApiResponse)
  // const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith('video/')) {
      onFileSelected(file); // Thông báo cho App.tsx rằng file đã được chọn và quá trình bắt đầu

      const formData = new FormData();
      formData.append('video', file);

      try {
        const response = await fetch('http://localhost:8000/api/detect_violations', {
          method: 'POST',
          body: formData,
        });
        console.log(response)

        if (!response.ok) {
          let errorData: ApiError;
          try {
            const parsedError = await response.json();
            errorData = { error: parsedError.detail || parsedError.error || `Lỗi HTTP: ${response.status}` };
          } catch (parseJsonError) {
            errorData = { error: `Lỗi HTTP: ${response.status}` };
          }
          console.error('Lỗi API:', errorData.error);
          onApiResponse(errorData, file); // Gửi lỗi và file gốc
          return;
        }

        const data = await response.json();
        onApiResponse(data.detections || [], file); // Gửi kết quả và file gốc

      } catch (error: any) {
        console.error('Lỗi khi tải lên và xử lý file:', error);
        onApiResponse({ error: error.message || 'Lỗi không xác định trong quá trình xử lý.' }, file);
      } finally {
        // Reset file input để cho phép chọn lại cùng một file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else if (file) {
      onApiResponse({ error: 'Vui lòng chọn một file video.' }, file);
       if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    } else {
      // Trường hợp không có file nào được chọn (ví dụ người dùng hủy hộp thoại)
      // Có thể không cần làm gì, hoặc gọi onApiResponse với một trạng thái "cancelled" nếu cần
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Video for Analysis</h2>
      <p className="mb-4 text-gray-600">
        Upload a video file to detect motorbike passenger violations. The AI
        will identify instances where more than the permitted number of people
        are on a motorbike.
      </p>
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          className="hidden"
          disabled={isProcessing}
        />
        <button
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center disabled:bg-blue-400"
        >
          {isProcessing ? (
            <>
              <LoaderIcon className="animate-spin mr-2 h-5 w-5" />
              Processing Video...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-5 w-5" />
              Upload Video
            </>
          )}
        </button>
      </div>
    </div>
  );
}