import pytest
from datetime import date
from app.models.forecast_row import ForecastRow
from app.models.forecast_explaination import ForecastExplanation
from app.services.forecast_explainer import generate_forecast_explanation

# Dummy model to capture the prompt
class DummyModel:
    def __init__(self):
        self.last_prompt = None

    def generate(self, prompt, **kwargs):
        self.last_prompt = prompt
        class Response:
            text = '{"narrative_explanation":"OK","top_influencer":"unknown","structured_explanation":{"primary_factor":{"impact":"0%","reasoning":"none"},"secondary_factors":[]},"confidence_score":0.5}'
        return Response()

@pytest.fixture(autouse=True)
def mock_gemini(monkeypatch):
    dummy = DummyModel()
    monkeypatch.setattr(
        'app.services.forecast_explainer.gemini_model',
        dummy
    )
    return dummy

def test_news_section_in_prompt(monkeypatch, mock_gemini):
    # Mock trends and news fetchers
    monkeypatch.setattr(
        'app.services.context_fetcher.fetch_google_trends',
        lambda sku: [1, 2, 3]
    )
    sample_headlines = ["Headline One", "Headline Two"]
    monkeypatch.setattr(
        'app.services.context_fetcher.fetch_news_headlines',
        lambda sku, country='us', page_size=5: sample_headlines
    )

    # Create minimal ForecastRow
    def test_news_fetcher_called_with_defaults(monkeypatch, mock_gemini):
        captured = {}
        def fake_fetch_news(sku, country='us', page_size=5):
            captured['args'] = (sku, country, page_size)
            return ["Only HL"]
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_news_headlines',
            fake_fetch_news
        )
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_google_trends',
            lambda sku: []
        )
        row = ForecastRow(
            sku_id="TESTSKU",
            store_id="STORE1",
            forecast_date=date(2025, 7, 20),
            generated_at=date(2025, 7, 18),
            predicted_demand=50
        )
        _ = generate_forecast_explanation(row)
        assert captured.get('args') == ("TESTSKU", "us", 5)

    def test_empty_news_section(monkeypatch, mock_gemini):
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_news_headlines',
            lambda sku, country='us', page_size=5: []
        )
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_google_trends',
            lambda sku: [10, 20]
        )
        row = ForecastRow(
            sku_id="TESTSKU",
            store_id="STORE1",
            forecast_date=date(2025, 7, 21),
            generated_at=date(2025, 7, 19),
            predicted_demand=75
        )
        _ = generate_forecast_explanation(row)
        prompt = mock_gemini.last_prompt
        assert "NEWS HEADLINES:" in prompt
        # Ensure no bullet lines appear when there are no headlines
        section = prompt.split("NEWS HEADLINES:")[1].split("GOOGLE TRENDS:")[0]
        assert "- " not in section.strip()

    @pytest.mark.parametrize("headlines", [
        ["Solo Headline"],
        ["First", "Second", "Third"]
    ])
    def test_multiple_headlines_formatting(monkeypatch, mock_gemini, headlines):
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_google_trends',
            lambda sku: [0]
        )
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_news_headlines',
            lambda sku, country='us', page_size=5: headlines
        )
        row = ForecastRow(
            sku_id="TESTSKU",
            store_id="STORE1",
            forecast_date=date(2025, 7, 22),
            generated_at=date(2025, 7, 20),
            predicted_demand=120
        )
        _ = generate_forecast_explanation(row)
        prompt = mock_gemini.last_prompt
        assert "NEWS HEADLINES:" in prompt
        for hl in headlines:
            assert f"- {hl}" in prompt

    def test_trends_section_before_news(monkeypatch, mock_gemini):
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_google_trends',
            lambda sku: [5, 5, 5]
        )
        monkeypatch.setattr(
            'app.services.context_fetcher.fetch_news_headlines',
            lambda sku, country='us', page_size=5: ["X"]
        )
        row = ForecastRow(
            sku_id="TESTSKU",
            store_id="STORE1",
            forecast_date=date(2025, 7, 23),
            generated_at=date(2025, 7, 21),
            predicted_demand=30
        )
        _ = generate_forecast_explanation(row)
        prompt = mock_gemini.last_prompt
        idx_trends = prompt.find("GOOGLE TRENDS:")
        idx_news = prompt.find("NEWS HEADLINES:")
        assert idx_trends != -1 and idx_news != -1
        assert idx_trends < idx_news, "Expected GOOGLE TRENDS section to appear before NEWS HEADLINES"
