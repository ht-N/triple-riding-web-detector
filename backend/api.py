from ultralytics import YOLO
import os
import cv2  # OpenCV cho xử lý video
import base64
import shutil
import uuid # Để tạo tên file duy nhất
import time
import numpy as np

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any


yolo_model = YOLO("./model/best.pt")
app = FastAPI()
UPLOAD_DIR = "temp_uploads"
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc ["*"] cho tất cả trong development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Cho phép các phương thức này
    allow_headers=["*"], # Cho phép tất cả các header
)




def process_video_with_actual_yolo(video_path: str, model: YOLO, target_class_name: str, conf_threshold: float) -> List[Dict[str, Any]]:
    """
    Xử lý video bằng mô hình YOLO thực tế và trả về các frame có phát hiện lớp mục tiêu.
    """
    if model is None:
        print("Lỗi: Mô hình YOLO chưa được tải. Không thể xử lý video.")
        return [] # Hoặc raise lỗi thích hợp

    detections_output = []
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Lỗi: Không thể mở video {video_path}")
        return []

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = 0

    print(f"Đang xử lý video: {video_path} với FPS: {fps}, tìm kiếm lớp: '{target_class_name}' với conf >= {conf_threshold}")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
        frame_count += 1

        # Thực hiện phát hiện trên frame bằng mô hình YOLO
        # model.predict() trả về một list các đối tượng Results.
        # Ngay cả khi chỉ có 1 ảnh đầu vào, nó vẫn là một list.
        results = model.predict(source=frame, conf=conf_threshold, verbose=False) # verbose=False để giảm output log

        found_target_in_frame = False
        detected_objects_for_frame = []

        if results and results[0].boxes: # results[0] vì chúng ta xử lý từng frame một
            for box in results[0].boxes:
                class_id = int(box.cls[0])
                # Kiểm tra xem model.names có phải là dict hay list
                current_class_name = ""
                if isinstance(model.names, dict):
                    current_class_name = model.names.get(class_id, "unknown_class")
                elif isinstance(model.names, list) and class_id < len(model.names):
                    current_class_name = model.names[class_id]
                else:
                    print(f"Cảnh báo: Không thể lấy tên lớp cho class_id {class_id}")
                    continue


                confidence = float(box.conf[0])

                if current_class_name == target_class_name:
                    found_target_in_frame = True
                    xyxy = box.xyxy[0].cpu().numpy().astype(int) # Tọa độ [x1, y1, x2, y2]
                    detected_objects_for_frame.append({
                        "class": current_class_name,
                        "confidence": round(confidence, 4),
                        "box_xyxy": [int(c) for c in xyxy] # Chuyển sang list int
                    })

        if found_target_in_frame:
            # Tạo một bản sao của frame để vẽ, tránh thay đổi frame gốc nếu cần dùng lại
            frame_to_encode = frame.copy()

            # Vẽ bounding box lên frame_to_encode
            for det_obj in detected_objects_for_frame:
                if det_obj["class"] == target_class_name: # Chỉ vẽ cho lớp mục tiêu
                    x1, y1, x2, y2 = det_obj["box_xyxy"]
                    cv2.rectangle(frame_to_encode, (x1, y1), (x2, y2), (0, 0, 255), 2) # Màu đỏ, độ dày 2
                    cv2.putText(frame_to_encode, f"{det_obj['class']} ({det_obj['confidence']:.2f})",
                                (x1, y1 - 10 if y1 - 10 > 10 else y1 + 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

            print(f"Phát hiện '{target_class_name}' tại frame {frame_count}, timestamp: {timestamp_ms}ms. Sẽ gửi ảnh có vẽ box.")
            _, buffer = cv2.imencode('.jpg', frame_to_encode) # Mã hóa frame đã vẽ
            frame_base64 = base64.b64encode(buffer).decode('utf-8')

            detections_output.append({
                "timestamp_ms": timestamp_ms,
                "frame_image_base64": frame_base64,
                "detections_in_frame": detected_objects_for_frame
            })

    cap.release()
    print(f"Hoàn tất xử lý video. Tìm thấy {len(detections_output)} frame có vi phạm '{target_class_name}'.")
    return detections_output

@app.post("/api/detect_violations")
async def detect_violations_api(video: UploadFile = File(...)):
    if yolo_model is None:
        raise HTTPException(status_code=503, detail="Mô hình YOLO không khả dụng. Vui lòng kiểm tra log của server.")

    if not video.content_type or not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File tải lên phải là video.")

    temp_file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{video.filename}")

    try:
        # Lưu file từ stream vào đĩa để cv2 có thể đọc
        with open(temp_file_path, "wb") as buffer:
            content = await video.read() # Đọc toàn bộ nội dung file vào bộ nhớ
            if len(content) > MAX_FILE_SIZE_BYTES:
                 raise HTTPException(
                    status_code=413, # Request Entity Too Large
                    detail=f"Kích thước file quá lớn. Tối đa {MAX_FILE_SIZE_MB}MB."
                )
            buffer.write(content)

        print(f"Video đã được lưu tạm tại: {temp_file_path}")

        # Xử lý video
        results = process_video_with_actual_yolo(
            video_path=temp_file_path,
            model=yolo_model,
            target_class_name="triple-riding",
            conf_threshold=0.3
        )

        return {"detections": results}

    except HTTPException as http_exc:
        raise http_exc # Re-raise HTTPException để FastAPI xử lý
    except Exception as e:
        print(f"Lỗi không mong muốn trong quá trình xử lý: {e}")
        # Log chi tiết lỗi ở đây nếu cần (ví dụ: traceback)
        raise HTTPException(status_code=500, detail=f"Lỗi server không mong muốn: {str(e)}")
    finally:
        # Đảm bảo file tạm được xóa
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                print(f"Đã xóa video tạm: {temp_file_path}")
            except Exception as e_remove:
                print(f"Lỗi khi xóa video tạm {temp_file_path}: {e_remove}")
        # Đóng file UploadFile nếu nó chưa được đóng (mặc dù video.read() thường sẽ đóng nó)
        if hasattr(video, 'file') and video.file and not video.file.closed:
            video.file.close()


if __name__ == "__main__":
    import uvicorn
    # Kiểm tra lại xem model có được tải không trước khi chạy
    if yolo_model is None:
        print("Không thể khởi động server vì mô hình YOLO chưa được tải. Hãy kiểm tra lỗi ở trên.")
    else:
        uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)