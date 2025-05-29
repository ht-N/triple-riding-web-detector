import React from 'react';
import { ZoomInIcon } from 'lucide-react';

// Định nghĩa lại kiểu cho phù hợp với dữ liệu từ API (nên import từ một file dùng chung nếu có)
interface Detection {
  class: string;
  confidence: number;
  box_xyxy: [number, number, number, number];
}
interface DetectionFrame {
  timestamp_ms: number;
  frame_image_base64: string;
  detections_in_frame: Detection[];
}

interface ViolationFramesProps {
  violations: DetectionFrame[];
}

// Hàm tiện ích để định dạng timestamp (tùy chọn)
const formatTimestamp = (ms: number) => {
  const date = new Date(ms);
  return date.toISOString().substr(11, 12); // HH:MM:SS.sss
};

export function ViolationFrames({ violations }: ViolationFramesProps) {
  if (!violations || violations.length === 0) {
    return <p className="text-center text-gray-500">Không có khung hình vi phạm nào để hiển thị.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {violations.map((violation, index) => (
        // Sử dụng timestamp_ms + index làm key để đảm bảo tính duy nhất
        <div key={`${violation.timestamp_ms}-${index}`} className="group relative">
          {/* Tạo src cho img từ chuỗi base64 */}
          <img
            src={`data:image/jpeg;base64,${violation.frame_image_base64}`}
            alt={`Vi phạm lúc ${formatTimestamp(violation.timestamp_ms)}`}
            className="w-full h-48 object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => {
                // Thêm hành động khi click vào ảnh, ví dụ: mở modal xem chi tiết
                console.log("Xem chi tiết vi phạm:", violation);
                // alert(`Chi tiết vi phạm tại: ${formatTimestamp(violation.timestamp_ms)}`);
              }}
              className="text-white flex flex-col items-center cursor-pointer p-4"
              aria-label={`Xem chi tiết vi phạm tại ${formatTimestamp(violation.timestamp_ms)}`}
            >
              <ZoomInIcon className="h-8 w-8 mb-1" />
              <span className="text-sm">
                Thời gian: {formatTimestamp(violation.timestamp_ms)}
              </span>
              {/* Bạn có thể hiển thị thêm thông tin từ violation.detections_in_frame nếu muốn */}
              {violation.detections_in_frame.length > 0 && (
                <span className="text-xs mt-1">
                  {violation.detections_in_frame[0].class} ({violation.detections_in_frame[0].confidence.toFixed(2)})
                </span>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}