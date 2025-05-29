import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoFile: File | null; // Hoặc chỉ File nếu bạn đảm bảo nó không bao giờ là null khi component này render
}

export function VideoPlayer({ videoFile }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null); // Thêm kiểu cho useRef

  useEffect(() => {
    // Kiểm tra videoRef.current trước khi truy cập src để tránh lỗi nếu videoRef.current là null
    if (videoRef.current) {
      if (videoFile) {
        const objectUrl = URL.createObjectURL(videoFile);
        videoRef.current.src = objectUrl;

        // Hàm cleanup trả về bởi useEffect này sẽ chạy khi videoFile thay đổi hoặc component unmount
        return () => {
          URL.revokeObjectURL(objectUrl);
          // Không cần kiểm tra videoRef.current.src ở đây nữa vì objectUrl đã được lưu
          // và videoRef.current.src có thể đã thay đổi hoặc bị xóa bởi trình duyệt
        };
      } else {
        // Nếu videoFile là null (ví dụ: video bị xóa), xóa src
        videoRef.current.src = "";
        // Không cần return cleanup function ở đây nếu không có objectUrl nào được tạo
      }
    }
  }, [videoFile]); // Chỉ phụ thuộc vào videoFile

  // Nếu videoFile là null, bạn có thể chọn không render video player hoặc hiển thị placeholder
  if (!videoFile && !videoRef.current?.src) { // Điều kiện này có thể cần tinh chỉnh tùy theo logic
     // return <div className="bg-gray-200 p-6 rounded-lg shadow-md text-center">Vui lòng tải lên một video.</div>;
  }


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <video ref={videoRef} className="w-full h-auto rounded-md" controls controlsList="nodownload">
        Your browser does not support the video tag.
      </video>
    </div>
  );
}