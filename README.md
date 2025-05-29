# Triple-Riding Violation Detection System

## 1. Introduction

This project implements a system to detect "triple-riding" violations on motorbikes using a YOLOv11 (custom-trained) object detection model. When a video is uploaded, the system processes it frame by frame. If the AI model detects an instance of more than the permitted number of people on a motorbike (specifically, the "triple-riding" class), it flags the frame, extracts the timestamp, and provides the visual evidence.

The system consists of a React frontend for user interaction (video upload and results display) and a Python FastAPI backend for video processing and AI inference.

## 2. Features

*   **Video Upload**: Users can upload video files for analysis.
*   **AI-Powered Detection**: Utilizes a YOLOv11 model (as specified by the project's context, referring to a custom-trained model) to identify "triple-riding" instances.
*   **Violation Visualization**:
    *   Displays individual frames where violations are detected.
    *   Lists violations in a tabular format with details like timestamp, a preview image, and detection confidence.
*   **User-Friendly Interface**: Simple tab-based navigation to switch between frame view and list view.

## 3. Prerequisites

Before you begin, ensure you have the following installed:

*   **Backend**:
    *   Python (3.8 or newer recommended)
    *   pip (Python package installer)
*   **Frontend**:
    *   Node.js (LTS version recommended, e.g., 18.x or 20.x)
    *   npm (Node package manager, comes with Node.js) or yarn

## 4. Setup and Running the Application

### 4.1. Backend (FastAPI + YOLO)

1.  **Clone the Repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-name>
    ```

2.  **Navigate to the Backend Directory:**
    ```bash
    cd backend
    ```

3.  **Create a Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

4.  **Install Dependencies:**
    Ensure you have a `requirements.txt` file in the `backend` directory.
    ```bash
    pip install -r requirements.txt
    ```
    This should include `fastapi`, `uvicorn`, `opencv-python`, `numpy`, `ultralytics`, and any other libraries required by your YOLO model.

5.  **Place Your YOLO Model:**
    *   The application expects the trained YOLO model file (e.g., `best.pt`) to be located at `backend/model/best.pt`. (Adjust path in `main.py` if different).
    *   Create the `model` directory inside `backend` if it doesn't exist and place your `.pt` file there.

6.  **Configure Model Parameters in `backend/main.py`:**
    *   Verify the `MODEL_PATH` variable points to your model file (default: `"model/best.pt"`).
    *   **Crucially**, ensure the `TRIPLE_RIDING_CLASS_NAME` variable matches the exact name of your "triple-riding" class as defined in your YOLO model's `names` attribute.
    *   Adjust `CONFIDENCE_THRESHOLD` if needed.

7.  **Run the Backend Server:**
    From the `backend` directory:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 5000
    ```
    The backend API will be available at `http://localhost:5000`.

### 4.2. Frontend (React + TypeScript)

1.  **Navigate to the Frontend Directory:**
    From the project's root directory:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or if you use yarn
    # yarn install
    ```

3.  **Verify API Endpoint:**
    *   Open `frontend/src/components/FileUpload.tsx`.
    *   Ensure the `fetch` URL points to your backend API correctly (default: `http://localhost:5001/api/detect_violations`).

4.  **Run the Frontend Development Server:**
    ```bash
    npm dev start
    # or if you use yarn
    # yarn start
    ```
    The frontend application will typically open in your browser at `http://localhost:3000` (or another port like `5173` if you are using Vite).

## 5. Project Structure

```
your-project-root/
├── backend/
│   ├── main.py             # FastAPI application
│   ├── model/
│   │   └── best.pt         # Your trained YOLO model
│   ├── temp_uploads/       # Temporary storage for uploaded videos (auto-created)
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main application component
│   │   └── ...             # Other source files
│   ├── public/
│   └── package.json        # Frontend dependencies and scripts
└── README.md               # This file
```

## 6. Troubleshooting

*   **`TypeError: Failed to fetch` (Frontend):**
    *   Ensure the backend server is running.
    *   Verify the API URL and port in `frontend/src/components/FileUpload.tsx` match the backend's running address (e.g., `http://localhost:5001`).
    *   Check the browser's console for CORS (Cross-Origin Resource Sharing) errors. If present, ensure CORS is correctly configured in `backend/main.py`.
*   **Model Not Found (Backend):**
    *   Double-check the `MODEL_PATH` in `backend/main.py` and ensure the model file exists at that location.
*   **Incorrect Class Detection:**
    *   Verify `TRIPLE_RIDING_CLASS_NAME` in `backend/main.py` is exactly correct (case-sensitive) and matches a class name in your model.
*   **Linter/TypeScript errors in frontend (e.g., "Cannot find module 'react'"):**
    *   Ensure all dependencies, including type definitions (`@types/...`), are correctly installed (`npm install` or `yarn install`).
    *   Check your `tsconfig.json` for correct configurations.

