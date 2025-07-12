# app/services/context_fetcher.py

from pytrends.request import TrendReq
import redis
import os
import json
import requests
NEWSAPI_KEY=os.getenv("NEWSAPI_KEY")
# Initialize pytrends
env_tz = int(os.getenv("TZ_OFFSET", 330))  # default IST
tz = env_tz if env_tz is not None else 0
pytrends = TrendReq(hl='en-US', tz=330)

# Redis client (reuse your existing config)
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)
def fetch_news_headlines(
    query: str,
    country: str = "us",
    page_size: int = 5
) -> list[str]:
    """
    Fetch top news headlines for a given query.
    Caches results in Redis for 30 minutes.
    """
    if not NEWSAPI_KEY:
        return []

    cache_key = f"news:{query}:{country}"
    try:
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    url = "https://newsapi.org/v2/top-headlines"
    params = {
        "q": query,
        "country": country,
        "pageSize": page_size,
        "apiKey": NEWSAPI_KEY
    }
    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        articles = resp.json().get("articles", [])
        headlines = [a["title"] for a in articles if "title" in a]
    except Exception:
        headlines = []

    # Cache for 30 minutes
    try:
        redis_client.setex(cache_key, 1800, json.dumps(headlines))
    except Exception:
        pass

    return headlines

def fetch_google_trends(keyword: str, timeframe: str = 'now 7-d') -> list[float]:
    """
    Fetch Google Trends interest values for a keyword over the given timeframe.
    Caches results in Redis for 1 hour to reduce API calls.

    :param keyword: search term to fetch trends for
    :param timeframe: timeframe string like 'now 7-d'
    :return: list of float interest values or empty list if unavailable
    """
    cache_key = f"trends:{keyword}:{timeframe}"
    try:
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        # Redis unavailable, proceed without cache
        pass

    try:
        pytrends.build_payload([keyword], timeframe=timeframe)
        df = pytrends.interest_over_time()
        if df.empty or keyword not in df:
            return []
        values = df[keyword].tolist()
        # Cache for 1 hour
        try:
            redis_client.setex(cache_key, 3600, json.dumps(values))
        except Exception:
            pass
        return values
    except Exception:
        # Fail quietly, return empty list
        return []

