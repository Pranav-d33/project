import os
import pytest
from datetime import date
from unittest.mock import patch, MagicMock
from app.models.forecast_row import ForecastRow
from app.models.forecast_explaination import ForecastExplanation
from app.services.forecast_explainer import (
    generate_forecast_explanation,
    create_fallback_explanation,
    validate_explanation,
    clean_input
)

@pytest.fixture
def sample_forecast():
    """Create a sample forecast for testing"""
    return ForecastRow(
        sku_id="SKU-TEST-001",
        store_id="STORE-TEST-001",
        forecast_date=date(2025, 7, 20),
        generated_at=date(2025, 7, 18),
        predicted_demand=150,
        hist_sales_1w=120,
        hist_sales_4w_avg=110,
        conf_interval_lower=130,
        conf_interval_upper=170,
        weather_type="rain",
        weather_severity=2,
        holiday_flag=False,
        event_type="None",
        promotion_flag=True,
        social_sentiment_score=0.6,
        anomaly_flag=False,
        supply_constraint_flag=False
    )

@pytest.fixture
def sample_explanation():
    """Create a sample explanation for testing"""
    return ForecastExplanation(
        sku_id="SKU-TEST-001",
        store_id="STORE-TEST-001",
        forecast_date=date(2025, 7, 20),
        narrative_explanation="High demand expected due to promotional activity and positive sentiment.",
        top_influencer="promotion",
        structured_explanation={
            "promotion": {"impact": "+20%", "reasoning": "Active promotional campaign"},
            "weather": {"impact": "+5%", "reasoning": "Rainy weather may increase indoor shopping"}
        },
        confidence_score=0.85,
        explanation_type="ai_generated"
    )

def test_clean_input():
    """Test the clean_input helper function"""
    # Test None values
    assert clean_input(None) == "Not specified"
    
    # Test boolean values
    assert clean_input(True) == "Yes"
    assert clean_input(False) == "No"
    
    # Test date values
    test_date = date(2025, 7, 20)
    assert clean_input(test_date) == "2025-07-20"
    
    # Test regular values
    assert clean_input("test_string") == "test_string"
    assert clean_input(123) == "123"

def test_validate_explanation(sample_explanation):
    """Test explanation validation"""
    # Valid explanation should pass
    assert validate_explanation(sample_explanation) == True
    
    # Test with short narrative (should fail)
    short_explanation = sample_explanation.model_copy()
    short_explanation.narrative_explanation = "Short"
    assert validate_explanation(short_explanation) == False
    
    # Test with unknown influencer and high confidence (should fail)
    unknown_explanation = sample_explanation.model_copy()
    unknown_explanation.top_influencer = "unknown"
    unknown_explanation.confidence_score = 0.9
    assert validate_explanation(unknown_explanation) == False

def test_create_fallback_explanation(sample_forecast):
    """Test fallback explanation creation"""
    error_msg = "Test error"
    fallback = create_fallback_explanation(sample_forecast, error_msg)
    
    assert isinstance(fallback, ForecastExplanation)
    assert fallback.sku_id == sample_forecast.sku_id
    assert fallback.store_id == sample_forecast.store_id
    assert fallback.explanation_type == "rule_based"
    assert error_msg in fallback.narrative_explanation
    assert fallback.confidence_score == 0.3

def test_fallback_promotion_logic(sample_forecast):
    """Test that fallback correctly identifies promotion influence"""
    sample_forecast.promotion_flag = True
    fallback = create_fallback_explanation(sample_forecast, "test")
    
    assert fallback.top_influencer == "promotion"
    assert "promotional activity" in fallback.narrative_explanation.lower()

def test_fallback_holiday_logic():
    """Test that fallback correctly identifies holiday influence"""
    holiday_forecast = ForecastRow(
        sku_id="SKU-001",
        store_id="STORE-001",
        forecast_date=date(2025, 7, 20),
        generated_at=date(2025, 7, 18),
        predicted_demand=200,
        holiday_flag=True,
        promotion_flag=False
    )
    
    fallback = create_fallback_explanation(holiday_forecast, "test")
    assert fallback.top_influencer == "holiday"
    assert "holiday" in fallback.narrative_explanation.lower()

@patch('app.services.forecast_explainer.gemini_model')
def test_generate_forecast_explanation_success(mock_model, sample_forecast):
    """Test successful explanation generation"""
    # Mock Gemini response
    mock_response = MagicMock()
    mock_response.text = '''
    {
        "narrative_explanation": "Strong demand expected due to promotional campaign and positive customer sentiment.",
        "top_influencer": "promotion",
        "structured_explanation": {
            "promotion": {"impact": "+20%", "reasoning": "Active promotional campaign"},
            "sentiment": {"impact": "+10%", "reasoning": "Positive customer sentiment score"}
        },
        "confidence_score": 0.88
    }
    '''
    mock_model.generate_content.return_value = mock_response
    
    explanation = generate_forecast_explanation(sample_forecast)
    
    assert explanation is not None
    assert isinstance(explanation, ForecastExplanation)
    assert explanation.sku_id == sample_forecast.sku_id
    assert explanation.top_influencer == "promotion"
    assert explanation.confidence_score == 0.88
    assert explanation.explanation_type == "ai_generated"

@patch('app.services.forecast_explainer.gemini_model')
def test_generate_forecast_explanation_json_error(mock_model, sample_forecast):
    """Test handling of JSON parsing errors"""
    # Mock invalid JSON response
    mock_response = MagicMock()
    mock_response.text = "Invalid JSON response"
    mock_model.generate_content.return_value = mock_response
    
    explanation = generate_forecast_explanation(sample_forecast)
    
    # Should return fallback explanation
    assert explanation is not None
    assert explanation.explanation_type == "rule_based"
    assert "JSON parsing failed" in explanation.narrative_explanation

@patch('app.services.forecast_explainer.gemini_model')
def test_generate_forecast_explanation_api_error(mock_model, sample_forecast):
    """Test handling of API errors"""
    # Mock API exception
    mock_model.generate_content.side_effect = Exception("API Error")
    
    explanation = generate_forecast_explanation(sample_forecast)
    
    # Should return fallback explanation
    assert explanation is not None
    assert explanation.explanation_type == "rule_based"
    assert "AI service error" in explanation.narrative_explanation

@patch('app.services.forecast_explainer.gemini_model')
def test_generate_forecast_explanation_with_markdown(mock_model, sample_forecast):
    """Test handling of markdown-formatted JSON response"""
    # Mock response with markdown formatting
    mock_response = MagicMock()
    mock_response.text = '''```json
    {
        "narrative_explanation": "Test explanation",
        "top_influencer": "weather",
        "structured_explanation": {},
        "confidence_score": 0.75
    }
    ```'''
    mock_model.generate_content.return_value = mock_response
    
    explanation = generate_forecast_explanation(sample_forecast)
    
    assert explanation is not None
    assert explanation.top_influencer == "weather"
    assert explanation.confidence_score == 0.75

def test_explanation_model_validation():
    """Test ForecastExplanation model validation"""
    # Test valid explanation
    valid_explanation = ForecastExplanation(
        sku_id="SKU-001",
        store_id="STORE-001",
        forecast_date=date(2025, 7, 20),
        narrative_explanation="Test explanation",
        top_influencer="promotion"
    )
    assert valid_explanation.sku_id == "SKU-001"
    
    # Test invalid confidence score
    with pytest.raises(Exception):
        ForecastExplanation(
            sku_id="SKU-001",
            store_id="STORE-001",
            forecast_date=date(2025, 7, 20),
            narrative_explanation="Test",
            confidence_score=1.5  # Invalid: > 1.0
        )

@pytest.mark.parametrize("weather_type,expected_influencer", [
    ("rain", "weather"),
    ("snow", "weather"),
    ("sunny", "unknown"),
    ("none", "unknown")
])
def test_weather_influence_detection(weather_type, expected_influencer):
    """Test weather influence detection in fallback"""
    forecast = ForecastRow(
        sku_id="SKU-001",
        store_id="STORE-001",
        forecast_date=date(2025, 7, 20),
        generated_at=date(2025, 7, 18),
        predicted_demand=100,
        weather_type=weather_type,
        promotion_flag=False,
        holiday_flag=False
    )
    
    fallback = create_fallback_explanation(forecast, "test")
    assert fallback.top_influencer == expected_influencer

if __name__ == "__main__":
    pytest.main([__file__, "-v"])