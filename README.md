AI-Based GNSS Satellite Error Prediction

SIH 2026 --- Space Technology | Problem Statement 25176
Team: The Overfitters

Overview

This project is an AI-based system for forecasting GNSS satellite
orbit and clock errors up to two hours in advance.

Instead of waiting for satellite errors to occur and then correcting
them, the system learns temporal patterns from historical GNSS data and
predicts future errors. The prediction pipeline is designed to run on a
Raspberry Pi, making the solution suitable for lightweight edge
deployment.

The system predicts four error components:

X-axis position error

Y-axis position error

Z-axis position error

Satellite clock error

Key Features

GNSS satellite error forecasting using deep learning

48-step historical sequence input

68 engineered input features

Multi-output prediction of X, Y, Z and clock errors

Comparison of GRU and LSTM architectures

Chronological train/validation/test methodology

ONNX model export

INT8 model optimization for edge inference

Raspberry Pi deployment

FastAPI backend for prediction requests

Web dashboard for visualization

Ground-truth comparison using MAE and RMSE when actual observations
are available

System Workflow

GNSS / Reference Data
        ↓
Data Cleaning & Preparation
        ↓
Feature Engineering
        ↓
68 Features
        ↓
48-Step Temporal Sequence
        ↓
     GRU / LSTM
        ↓
  2-Hour Forecast
        ↓
   ONNX / INT8
        ↓
   Raspberry Pi
        ↓
    FastAPI API
        ↓
   Web Dashboard
        ↓
Prediction + Evaluation

Machine Learning Pipeline

Input

The model uses a chronological window of 48 observations with 68
features per observation.

Feature engineering captures:

Satellite orbital parameters

Satellite clock parameters

Temporal information

First-order changes

Second-order changes

Rates of change

Rolling statistics

Historical satellite error behaviour

The objective is to represent not only the current satellite state, but
also how that state is changing over time.

Output

The model simultaneously predicts:

X Error
Y Error
Z Error
Clock Error

for approximately a 2-hour prediction horizon.

Models

Two recurrent neural network architectures are evaluated:

GRU

The Gated Recurrent Unit is used to learn temporal dependencies while
keeping the model relatively lightweight, which is useful for edge
deployment.

LSTM

The Long Short-Term Memory network is used as a comparison architecture
for learning longer-term temporal dependencies.

The selected model is exported to ONNX and optimized for Raspberry Pi
inference.

Dataset

The prepared project dataset contains approximately:

Property                  Value

Observations              2,909
Satellites                   31
Engineered features          68
Sequence length              48
Prediction targets            4
Forecast horizon        2 hours

The project can incorporate GNSS observations, broadcast
navigation/ephemeris information, satellite clock data, and precise
reference products such as SP3 orbit and CLK clock products.

Edge Deployment

The trained model is converted to ONNX and an INT8 optimized
version is used for lightweight inference.

The Raspberry Pi acts as the inference device:

Client / Frontend
       ↓
FastAPI Request
       ↓
Raspberry Pi
       ↓
Load Sequence
       ↓
ONNX Runtime
       ↓
GRU / LSTM Inference
       ↓
Predicted X/Y/Z/Clock Errors
       ↓
FastAPI Response
       ↓
Frontend

This allows the machine-learning inference to happen locally on the edge
device rather than requiring a cloud GPU/server for every prediction.

Backend

The backend is built using FastAPI.

The API is responsible for:

Receiving prediction parameters.

Preparing the required historical sequence.

Loading the deployed model.

Running inference on the Raspberry Pi.

Returning the predicted error values.

Providing model comparison and evaluation results when applicable.

Example request:

curl -X POST http://<RASPBERRY_PI_IP>:8000/compare \
-H "Content-Type: application/json" \
-d '{"satellite":7,"prediction_date":"2025-04-30","prediction_time":"00:00"}'

Replace <RASPBERRY_PI_IP> with the IP address of the Raspberry Pi.

Example Prediction Response

The API returns predictions for both model variants when comparison mode
is used:

{
  "GRU_INT8": {
    "X_error": 0.0,
    "Y_error": 0.0,
    "Z_error": 0.0,
    "Clock_error": 0.0
  },
  "LSTM_INT8": {
    "X_error": 0.0,
    "Y_error": 0.0,
    "Z_error": 0.0,
    "Clock_error": 0.0
  },
  "forecast_horizon_hours": 2.0
}

The exact response fields depend on the deployed API implementation.

Model Evaluation

When ground-truth observations are available, predictions can be
compared with actual values using:

MAE

Mean Absolute Error measures the average absolute difference between
predicted and actual values.

MAE = average(|actual - predicted|)

RMSE

Root Mean Squared Error gives greater weight to larger prediction
errors.

RMSE = sqrt(average((actual - predicted)^2))

These metrics are used to evaluate and compare the GRU and LSTM models.

Project Structure

A typical project organization is:

project/
├── frontend/
│   └── ...
│
├── backend/
│   ├── main.py
│   └── ...
│
├── models/
│   ├── GRU_FP32.onnx
│   ├── GRU_INT8.onnx
│   ├── LSTM_FP32.onnx
│   └── LSTM_INT8.onnx
│
├── data/
│   └── ...
│
├── feature_order.json
├── requirements.txt
└── README.md

Adjust the folder and filename entries above to match the final
repository structure.

Running the Backend

Create and activate a Python environment:

python -m venv venv

Windows:

venv\Scripts\activate

Linux/macOS/Raspberry Pi:

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Start FastAPI:

uvicorn main:app --host 0.0.0.0 --port 8000

The API should then be available at:

http://localhost:8000

FastAPI's interactive documentation is normally available at:

http://localhost:8000/docs

Running the Frontend

From the frontend directory:

npm install
npm run dev

The frontend communicates with the FastAPI backend to request
predictions and display the results.

Make sure the frontend API configuration points to the correct
backend/Raspberry Pi address.

Raspberry Pi Deployment

On the Raspberry Pi:

git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>

Create the Python environment and install the backend dependencies:

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Start the API:

uvicorn main:app --host 0.0.0.0 --port 8000

The Raspberry Pi can then receive requests from another device on the
same network.

Health Check

A health endpoint can be used to verify that the backend is running:

curl http://<RASPBERRY_PI_IP>:8000/health

Example:

{
  "status": "online",
  "device": "Raspberry Pi"
}

Why Edge AI?

Deploying the model on Raspberry Pi provides:

Local inference

Low communication overhead

Reduced dependence on cloud infrastructure

Lightweight deployment

Potentially faster response for local applications

A practical path toward field or onboard deployment

Innovation

The core idea is not simply using an LSTM or GRU.

The proposed solution combines:

Temporal satellite-error modelling

Multi-dimensional error prediction

Orbital and temporal feature engineering

Chronological forecasting validation

ONNX model optimization

INT8 edge inference

Raspberry Pi deployment

FastAPI-based prediction service

Web-based visualization and evaluation

The complete pipeline moves from raw/reference GNSS information to an
actionable future error prediction.

Future Scope

Possible future improvements include:

Longer forecasting horizons

More GNSS constellations

Larger and more diverse datasets

Additional satellite dynamics features

Automated model retraining

Model quantization and pruning improvements

Real-time GNSS data ingestion

Multi-device edge deployment

Integration with navigation and positioning systems

Automated alerts when predicted error exceeds a threshold

Team

The Overfitters
SIH 2026 --- Space Technology

Disclaimer

This repository is a prototype developed for the Smart India Hackathon
(SIH) 2026. Prediction performance depends on the quality, coverage, and
temporal characteristics of the GNSS/reference data used for training
and evaluation.
