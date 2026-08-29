# AI-Based GNSS Satellite Error Prediction

**SIH 2026 — Space Technology**
**Team: The Overfitters**

## Overview

This project presents an **AI-based GNSS Satellite Error Prediction System** that forecasts satellite orbit and clock errors up to **2 hours in advance**.

Instead of waiting for satellite errors to occur and then correcting them, our system learns temporal patterns from historical GNSS data and predicts future errors.

The system predicts four major error components:

* X-axis Position Error
* Y-axis Position Error
* Z-axis Position Error
* Satellite Clock Error

The trained **GRU and LSTM models run locally** and are accessed through a **FastAPI backend**, providing a lightweight and efficient prediction pipeline.

---

## Key Features

* AI-based GNSS satellite error forecasting
* Up to 2-hour ahead prediction
* Uses 48 historical observations
* 68 engineered features
* Multi-output prediction of X, Y, Z and clock errors
* GRU and LSTM model comparison
* Chronological time-series validation
* Local model inference
* FastAPI-based backend
* Web-based visualization dashboard
* MAE and RMSE based evaluation

---

## Problem Statement

GNSS positioning accuracy depends heavily on the accuracy of satellite orbit and clock information.

Even small satellite position or clock errors can propagate into the final positioning solution.

Traditional approaches generally identify and correct errors after they occur.

### Our Approach

> Instead of waiting for satellite errors to occur, we forecast them in advance.

The system learns historical temporal patterns and predicts future satellite errors, enabling a shift from **reactive error correction to predictive error management**.

---

## System Workflow

```text
GNSS / Reference Data
        ↓
Data Cleaning & Preparation
        ↓
Feature Engineering
        ↓
68 Engineered Features
        ↓
48-Step Historical Sequence
        ↓
     GRU / LSTM
        ↓
  2-Hour Error Forecast
        ↓
   Local Inference
        ↓
      FastAPI
        ↓
   Web Dashboard
        ↓
 Prediction + Evaluation
```

---

# Machine Learning Pipeline

## Input

The model receives a historical sequence consisting of:

```text
48 observations × 68 features
```

The 48 observations provide the model with historical temporal information about the satellite.

The 68 features contain information describing satellite state, orbital behaviour, clock behaviour and temporal changes.

---

## Prediction Targets

The model performs multi-output prediction for:

```text
X Position Error
Y Position Error
Z Position Error
Satellite Clock Error
```

The prediction horizon is approximately:

```text
2 Hours
```

---

# Feature Engineering

Feature engineering is one of the important components of the system.

Instead of providing only the current satellite error to the model, we create features that describe **how the satellite's behaviour is changing over time**.

The feature set includes:

* Orbital parameters
* Satellite clock parameters
* Temporal features
* First-order differences
* Second-order differences
* Rates of change
* Rolling means
* Rolling standard deviations
* Historical error information

For example:

```text
X_error
d_X
dd_X
d_X_dt
X_error_rolling_mean_3
X_error_rolling_std_3
X_error_rolling_mean_6
X_error_rolling_std_6
```

Similar temporal and statistical features are generated for the other prediction variables.

### Key Idea

> We don't just tell the model where the error is — we tell it how the error is moving.

---

# Model Architecture

We evaluate two recurrent neural network architectures:

## GRU — Gated Recurrent Unit

GRU is a recurrent neural network designed for sequential data.

It is relatively lightweight while still being capable of learning temporal dependencies.

---

## LSTM — Long Short-Term Memory

LSTM is a recurrent neural network architecture designed to learn long-term dependencies in sequential data.

It is used as a comparison model against GRU.

---

## Model Input and Output

```text
Input:
48 × 68

        ↓

   GRU / LSTM

        ↓

Output:
X Error
Y Error
Z Error
Clock Error
```

---

# Dataset

The prepared dataset contains approximately:

| Property           |   Value |
| ------------------ | ------: |
| Observations       |   2,909 |
| Satellites         |      31 |
| Features           |      68 |
| Sequence Length    |      48 |
| Prediction Targets |       4 |
| Forecast Horizon   | 2 Hours |

---

# Time-Series Validation

Since this is a forecasting problem, randomly mixing past and future observations can cause **data leakage**.

Therefore, the project uses chronological splitting.

```text
Past Data
   ↓
Training
   ↓
Validation
   ↓
Future Test Data
```

This better represents the real-world forecasting scenario where the model only has access to past information when predicting the future.

---

# Local Model Inference

The trained **GRU and LSTM models run locally** as part of the prediction system.

The local inference process is:

```text
Historical Sequence
        ↓
Load Model
        ↓
GRU / LSTM
        ↓
Prediction
        ↓
X / Y / Z / Clock Error
```

Running inference locally reduces the dependency on external cloud-based model execution and allows the prediction pipeline to operate within the local system.

---

# FastAPI Backend

The backend is implemented using **FastAPI**.

FastAPI acts as the communication layer between the web application and the locally running machine-learning models.

The backend is responsible for:

1. Receiving prediction requests.
2. Identifying the requested satellite and prediction time.
3. Preparing the required historical sequence.
4. Loading the GRU or LSTM model.
5. Running local inference.
6. Returning X, Y, Z and clock predictions.
7. Comparing GRU and LSTM predictions when required.
8. Providing evaluation metrics when ground truth is available.

---

# API Workflow

```text
Web Frontend
      ↓
HTTP Request
      ↓
FastAPI Backend
      ↓
Local GRU / LSTM Model
      ↓
Prediction
      ↓
FastAPI Response
      ↓
Web Frontend
      ↓
Visualization
```

---

# API Example

Example prediction request:

```bash
curl -X POST http://localhost:8000/compare \
-H "Content-Type: application/json" \
-d '{"satellite":7,"prediction_date":"2025-04-30","prediction_time":"00:00"}'
```

---

# Example Response

The API can return predictions from both models:

```json
{
  "GRU": {
    "X_error": 0.0,
    "Y_error": 0.0,
    "Z_error": 0.0,
    "Clock_error": 0.0
  },
  "LSTM": {
    "X_error": 0.0,
    "Y_error": 0.0,
    "Z_error": 0.0,
    "Clock_error": 0.0
  },
  "forecast_horizon_hours": 2.0
}
```

The exact response structure depends on the implementation of the FastAPI service.

---

# Model Evaluation

When actual observations are available, predicted values are compared with ground-truth values.

## MAE — Mean Absolute Error

MAE measures the average absolute difference between actual and predicted values.

```text
MAE = average(|Actual - Predicted|)
```

Lower MAE indicates better prediction accuracy.

---

## RMSE — Root Mean Squared Error

RMSE measures prediction error while giving greater importance to larger errors.

```text
RMSE = √average((Actual - Predicted)²)
```

Lower RMSE indicates better performance.

---

# Project Structure

```text
GNSS-Satellite-Error-Prediction/
│
├── frontend/
│   └── ...
│
├── backend/
│   ├── main.py
│   └── ...
│
├── models/
│   ├── GRU/
│   └── LSTM/
│
├── data/
│   └── ...
│
├── feature_order.json
├── requirements.txt
└── README.md
```

---

# Installation

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

## 2. Create Virtual Environment

```bash
python -m venv venv
```

Activate the environment.

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Running the Backend

Start the FastAPI server using:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# Running the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend communicates with the FastAPI backend and displays:

* Satellite information
* Predicted errors
* GRU predictions
* LSTM predictions
* Actual values
* MAE
* RMSE
* Prediction horizon

---

# Innovation

The innovation of the project is not simply using a GRU or LSTM.

The proposed solution combines:

* Temporal satellite-error modelling
* Multi-dimensional error prediction
* Orbital feature engineering
* Temporal feature engineering
* Chronological forecasting validation
* GRU and LSTM comparison
* Local model inference
* FastAPI-based prediction service
* Web-based visualization
* Automated prediction evaluation

The result is an **end-to-end predictive satellite error forecasting pipeline**.

---

# Applications

The proposed system can support applications such as:

* GNSS positioning
* Navigation systems
* Satellite-based positioning
* Autonomous systems
* Precision navigation
* GNSS monitoring
* Satellite operations
* Real-time positioning systems
* Edge-based navigation applications

---

# Future Scope

Future improvements can include:

* Longer prediction horizons
* Real-time GNSS data ingestion
* Support for multiple GNSS constellations
* Automated model retraining
* Additional orbital dynamics features
* Model optimization
* Real-time error alerts
* Integration with real-time navigation systems
* Continuous performance monitoring

---

# Key Takeaway

Traditional systems primarily **detect and correct** satellite errors.

Our system aims to:

```text
DETECT
   ↓
UNDERSTAND
   ↓
FORECAST
   ↓
ACT EARLY
```

> **Don't wait for satellite error. Forecast it.**

---

# Team

### The Overfitters

**Smart India Hackathon 2026**

**Domain:** Space Technology

---

## Disclaimer

This project is a prototype developed for **Smart India Hackathon 2026**.

Prediction performance depends on the quality, quantity and temporal characteristics of the GNSS data used for training and evaluation.
