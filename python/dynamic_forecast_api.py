from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA
import uvicorn
app = FastAPI(title="Nivēśa Dynamic Forecast API", version="2.0.0")
# CORS configuration
_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000, http://localhost:3001")
allowed_origins = [o.strip() for o in _raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def health_check():
    return {"status": "ok", "service": "Nivēśa Forecast API"}
# Pydantic models
class Transaction(BaseModel):
    id: str
    amount: float
    category: str
    type: str
    date: str
    status: str
class PredictRequest(BaseModel):
    transactions: List[Transaction]
    accountId: Optional[str] = None
class PredictionDay(BaseModel):
    date: str
    predicted_spending: float
    lower_bound: float
    upper_bound: float
class PredictResponse(BaseModel):
    predictions: List[PredictionDay]
    total_predicted: float
    historical_avg: float
    model_used: str
    data_points_used: int
    mae: Optional[float] = None  # Mean Absolute Error for model accuracy

def preprocess_user_transactions(transactions_df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess user transactions following the baseline notebook approach:
    1. Filter EXPENSE transactions
    2. Target/Mean encoding for categories
    3. Aggregate by date
    4. Clip outliers (Winsorization)
    5. Add required columns for SARIMA
    """
    # Filter only EXPENSE transactions
    expenses = transactions_df[transactions_df['type'] == 'EXPENSE'].copy()
    if len(expenses) == 0:
        raise ValueError("No expense transactions found")
    # Convert date strings to datetime and extract date only
    expenses['date'] = pd.to_datetime(expenses['date'])
    expenses['date'] = expenses['date'].dt.date
    # Target/Mean encoding for category
    category_means = expenses.groupby('category')['amount'].mean().to_dict()
    expenses['category_encoded'] = expenses['category'].map(category_means)
    # Fill missing categories with overall mean
    if expenses['category_encoded'].isna().any():
        overall_mean = sum(category_means.values()) / len(category_means)
        expenses['category_encoded'].fillna(overall_mean, inplace=True)
    # Aggregate by date
    daily_txns = expenses.groupby('date').agg({
        'amount': 'sum',                    # Total spending that day
        'category_encoded': 'mean',         # Weighted average category encoding
        'type': 'count'                     # Number of transactions
    }).reset_index()
    # Rename columns for SARIMA
    daily_txns = daily_txns.rename(columns={
        'amount': 'y',
        'type': 'transactions_count',
        'date': 'ds',
        'category_encoded': 'category_expenditure_mean'
    })
    # Winsorization: Clip outliers at 99th percentile
    upper_limit = daily_txns['y'].quantile(0.99)
    daily_txns['y'] = daily_txns['y'].clip(upper=upper_limit)
    # Add required columns for StatsForecast
    daily_txns['unique_id'] = 'expenses'
    daily_txns['ds'] = pd.to_datetime(daily_txns['ds'])
    # Sort by date
    daily_txns = daily_txns.sort_values('ds').reset_index(drop=True)
    return daily_txns, category_means

@app.post("/predict", response_model=PredictResponse)
async def predict_spending(request: PredictRequest):
    """
    Train SARIMA model on user's transaction history and predict next 7 days
    """
    # Convert transactions to DataFrame
    txns_data = [txn.dict() for txn in request.transactions]
    if len(txns_data) == 0:
        raise HTTPException(
            status_code=400,
            detail="No transactions provided"
        )
    df = pd.DataFrame(txns_data)
    try:
        # Preprocess transactions
        daily_data, category_means = preprocess_user_transactions(df)
    except ValueError as e:
        print(f"ValueError in preprocessing: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Exception in preprocessing: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Preprocessing error: {str(e)}"
        ) 
    # Minimum data check (outside try-except so it raises 400, not 500)
    if len(daily_data) < 14:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient data. Found {len(daily_data)} days, need at least 14 days of expense transactions."
        )
    try: 
        # Calculate MAE using walk-forward validation on last 7 days
        mae = None
        print(f"Daily data points available: {len(daily_data)}")
        if len(daily_data) >= 21:  # Need enough data for train/test split
            try:
                # Use last 7 days as test set
                train_size = len(daily_data) - 7
                train_data_mae = daily_data.iloc[:train_size][['unique_id', 'ds', 'y', 'category_expenditure_mean', 'transactions_count']]
                test_data_mae = daily_data.iloc[train_size:].copy()
                print(f"Training MAE model with {len(train_data_mae)} days, testing on {len(test_data_mae)} days")
                # Train model on training data
                model_mae = StatsForecast(
                    models=[AutoARIMA(season_length=7, alias='SARIMA_User')],
                    freq='D'
                )
                model_mae.fit(train_data_mae)
                # Predict on test period
                test_forecast = model_mae.predict(
                    h=7, 
                    X_df=test_data_mae[['unique_id', 'ds', 'category_expenditure_mean', 'transactions_count']]
                )
                # Calculate MAE
                actual = test_data_mae['y'].values
                predicted = test_forecast['SARIMA_User'].values
                mae = float(np.mean(np.abs(actual - predicted)))
                print(f"MAE calculated successfully: {mae}")
            except Exception as e:
                print(f"Error calculating MAE: {str(e)}")
                mae = None
        else:
            print(f"Insufficient data for MAE calculation. Need 21+ days, have {len(daily_data)} days")
        # Calculate exogenous feature averages for future predictions
        avg_category_mean = daily_data['category_expenditure_mean'].mean()
        avg_txn_count = daily_data['transactions_count'].mean()
        # Prepare training data (all historical data)
        train_data = daily_data[['unique_id', 'ds', 'y', 'category_expenditure_mean', 'transactions_count']]
        # Train SARIMA model on user's full data
        model = StatsForecast(
            models=[AutoARIMA(season_length=7, alias='SARIMA_User')],
            freq='D'
        )
        model.fit(train_data)
        # Create future exogenous features starting from tomorrow
        today = datetime.now().date()
        future_dates = pd.date_range(
            start=today + timedelta(days=1),
            periods=7,
            freq='D'
        )
        future_exog = pd.DataFrame({
            'unique_id': 'expenses',
            'ds': future_dates,
            'category_expenditure_mean': avg_category_mean,
            'transactions_count': avg_txn_count
        })
        # Generate 7-day forecast with 80% prediction intervals
        forecast = model.predict(h=7, X_df=future_exog, level=[80])
        # Calculate historical average
        historical_avg = daily_data['y'].mean()
        # Build response
        predictions = []
        total_predicted = 0.0
        for i in range(7):
            pred_date = future_dates[i]
            # Get prediction values
            pred_value = float(forecast.iloc[i]['SARIMA_User'])
            lower = float(forecast.iloc[i]['SARIMA_User-lo-80']) if 'SARIMA_User-lo-80' in forecast.columns else pred_value * 0.8
            upper = float(forecast.iloc[i]['SARIMA_User-hi-80']) if 'SARIMA_User-hi-80' in forecast.columns else pred_value * 1.2
            # Ensure non-negative predictions
            pred_value = max(0, pred_value)
            lower = max(0, lower)
            upper = max(0, upper)
            total_predicted += pred_value
            
            predictions.append(PredictionDay(
                date=pred_date.strftime('%Y-%m-%d'),
                predicted_spending=round(pred_value, 2),
                lower_bound=round(lower, 2),
                upper_bound=round(upper, 2)
            ))
        return PredictResponse(
            predictions=predictions,
            total_predicted=round(total_predicted, 2),
            historical_avg=round(historical_avg, 2),
            model_used="SARIMA (Dynamic, season_length=7)",
            data_points_used=len(train_data),
            mae=round(mae, 2) if mae is not None else None
        )
    except ValueError as e:
        print(f"ValueError in predict_spending: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"Exception in predict_spending: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "dynamic_forecast_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
