import pytest
from app.services.context_fetcher import fetch_google_trends
from app.services.forecast_explainer import generate_forecast_explanation
from app.models.forecast_row import ForecastRow
from app.models.forecast_explaination import ForecastExplanation

from datetime import date

class DummyModel:
    def __init__(self):
        self.last_prompt = None

    def generate(self, prompt, **kwargs):
        # Store the prompt for inspection and return a minimal valid JSON
        self.last_prompt = prompt
        # Return a dummy response object similar to genai.GenerativeModel
        class Response:
            text = '{"narrative_explanation":"Test","top_influencer":"unknown","structured_explanation":{"primary_factor":{"impact":"0%","reasoning":"none"},"secondary_factors":[]},"confidence_score":0.5}'
        return Response()

@pytest.fixture(autouse=True)
def mock_gemini(monkeypatch):
    """Replace the real Gemini model with our dummy to capture prompts."""
    dummy = DummyModel()
    monkeypatch.setattr(
        'app.services.forecast_explainer.gemini_model',
        dummy
    )
    return dummy

def test_trend_summary_in_prompt(monkeypatch, mock_gemini):
    # 1. Mock fetch_google_trends to return a known list
    sample_trends = [10, 20, 30, 40, 50]
    monkeypatch.setattr(
        'app.services.context_fetcher.fetch_google_trends',
        lambda keyword: sample_trends
    )

    # 2. Create a minimal ForecastRow
    row = ForecastRow(
        sku_id="TESTSKU",
        store_id="STORE1",
        forecast_date=date(2025,7,20),
        generated_at=date(2025,7,18),
        predicted_demand=100
    )

    # 3. Call generate_forecast_explanation
    exp: ForecastExplanation = generate_forecast_explanation(row)

    # 4. Validate that the output is our dummy JSON
    assert isinstance(exp, ForecastExplanation)
    assert exp.narrative_explanation == "Test"

    # 5. Inspect the prompt captured in dummy model
    prompt = mock_gemini.last_prompt
    assert prompt is not None

    # 6. Compute expected trend summary
    increase_pct = round(((sample_trends[-1] - sample_trends[0]) / sample_trends[0]) * 100, 1)
    expected_summary = f"Interest has increased by {increase_pct}% over the past week (values: {sample_trends})"

    # 7. Assert that the trend summary appears in the prompt
    assert expected_summary in prompt
    assert "GOOGLE TRENDS:" in prompt
