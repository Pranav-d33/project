#!/usr/bin/env python3
"""
Test script for the Copilot integration
"""

import asyncio
import json
from app.services.copilot_agent import run_copilot_query


def test_copilot_queries():
    """Test various copilot query patterns"""
    
    test_filters = {
        "sku": "SKU_422",
        "store": "STORE_5", 
        "startDate": "2025-07-01",
        "endDate": "2025-07-13",
        "weather": True,
        "promotions": True,
        "socialTrends": False,
        "anomalies": True
    }
    
    test_queries = [
        "Why did demand spike on July 9 for SKU_422?",
        "Compare promotion vs. weather for Store_B",
        "Summarize top drivers this week",
        "Which stores underperformed last week?",
        "What caused the sales drop?",
        "Tell me about general trends"
    ]
    
    print("🤖 Testing Copilot Agent\n")
    print("=" * 50)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. Query: '{query}'")
        print("-" * 40)
        
        response = run_copilot_query(query, test_filters)
        
        print(f"Answer: {response['answer']}")
        
        if response.get('chart_highlight'):
            print(f"Chart Highlight: {response['chart_highlight']}")
            
        if response.get('action'):
            print(f"Action: {response['action']['type']} -> {response['action']['params']}")
        
        print()


if __name__ == "__main__":
    test_copilot_queries()
