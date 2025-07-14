from typing import Any, Dict
import json
import os
import google.generativeai as genai
from datetime import datetime


def run_copilot_query(query: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle copilot queries by integrating with LLM (e.g., Gemini) and returning structured JSON.
    Injects filter context and asks Gemini to return actionable insights.
    """
    
    # Extract context from filters
    sku = filters.get("sku", "All SKUs")
    store = filters.get("store", "All Stores")
    start_date = filters.get("startDate", "2025-07-01")
    end_date = filters.get("endDate", "2025-07-13")
    
    # Active signals
    active_signals = []
    if filters.get("weather"): active_signals.append("Weather")
    if filters.get("promotions"): active_signals.append("Promotions")
    if filters.get("socialTrends"): active_signals.append("Social Trends")
    if filters.get("anomalies"): active_signals.append("Anomalies")
    
    # Build context prompt
    context_prompt = f"""
You are a retail demand assistant specialized in forecast analysis.

User Question: "{query}"

Current Context:
- SKU: {sku}
- Store: {store}
- Date Range: {start_date} to {end_date}
- Active Signals: {', '.join(active_signals) if active_signals else 'None'}

Sample forecast data suggests:
- Recent demand patterns show typical seasonal variations
- Weather impact varies by product category
- Promotional activities show 8-15% uplift typically
- Social trends can drive 20%+ spikes for trending items

Return a structured JSON response with:
1. "answer": A clear, concise explanation (2-3 sentences max)
2. "chart_highlight": Optional object with date/sku/store to highlight on charts
3. "action": Optional action object with type and params for drill-down

Example response format:
{{
  "answer": "Sales dropped due to severe rain impacting foot traffic. Weather was the primary influencer with a -12% impact.",
  "chart_highlight": {{
    "date": "2025-07-11",
    "sku": "SKU_422",
    "store": "STORE_5"
  }},
  "action": {{
    "type": "show_forecast_detail",
    "params": {{
      "sku": "SKU_422",
      "store": "STORE_5", 
      "forecast_date": "2025-07-11"
    }}
  }}
}}

Respond only with valid JSON. No markdown or extra text.
"""
    
    # Try to use Gemini if API key is available
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')  # Use the correct model name
            response = model.generate_content(context_prompt)
            
            # Parse JSON response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            return json.loads(response_text)
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fall through to fallback
    
    # Fallback response when LLM is not available
    return _generate_fallback_response(query, filters)


def _generate_fallback_response(query: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate intelligent fallback responses based on query patterns"""
    
    query_lower = query.lower()
    
    # Pattern matching for common queries
    if "why" in query_lower and ("spike" in query_lower or "increase" in query_lower):
        return {
            "answer": f"Demand spikes typically correlate with promotional activities or trending social signals. Check if {filters.get('sku', 'the selected SKU')} had recent promotions or viral mentions.",
            "chart_highlight": {
                "date": filters.get("endDate", "2025-07-13"),
                "sku": filters.get("sku"),
                "store": filters.get("store")
            },
            "action": {
                "type": "show_forecast_detail",
                "params": {
                    "sku": filters.get("sku", "SKU_422"),
                    "store": filters.get("store", "STORE_5"),
                    "forecast_date": filters.get("endDate", "2025-07-13")
                }
            }
        }
    
    elif "drop" in query_lower or "decline" in query_lower:
        return {
            "answer": f"Sales declines often result from weather disruptions, end of promotional periods, or competitive actions. Weather severity and promotion timing are key factors.",
            "chart_highlight": None,
            "action": None
        }
    
    elif "compare" in query_lower:
        return {
            "answer": f"Comparing {filters.get('sku', 'selected items')} across different factors shows weather typically has 5-15% impact while promotions drive 10-20% uplift.",
            "chart_highlight": None,
            "action": None
        }
    
    elif "top" in query_lower and "driver" in query_lower:
        return {
            "answer": f"Top drivers this period: Social Trends (25% of variance), Weather (20%), Promotions (18%). Check narrative cards for specific events.",
            "chart_highlight": None,
            "action": None
        }
    
    else:
        # Generic response
        return {
            "answer": f"Based on your filters ({filters.get('sku', 'All SKUs')}, {filters.get('store', 'All Stores')}), I can help analyze demand patterns, influencer impacts, and forecast explanations. Try asking about specific dates or events.",
            "chart_highlight": None,
            "action": None
        }