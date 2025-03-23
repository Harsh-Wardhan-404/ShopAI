from typing import Union, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import statistics
import requests
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_API = "http://localhost:11434/api/generate"

class Review(BaseModel):
    id: int
    rating: int
    comment: Optional[str] = None
    createdAt: Optional[str] = None
    user: Optional[dict] = None
    
class ReviewsInput(BaseModel):
    reviews: List[Review]

class SentimentResponse(BaseModel):
    overall_sentiment: str
    sentiment_score: float
    avg_rating: float
    positive_count: int
    neutral_count: int
    negative_count: int
    summary: str

@app.get("/")
def read_root():
    return {"status": "Review Analysis API with Ollama is running"}

@app.post("/analyze-reviews", response_model=SentimentResponse)
def analyze_reviews(input: ReviewsInput):
    if not input.reviews:
        raise HTTPException(status_code=400, detail="No reviews provided")
    
    # Calculate average rating
    ratings = [review.rating for review in input.reviews]
    avg_rating = statistics.mean(ratings) if ratings else 0
    
    # Extract all comments for analysis
    comments = [review.comment for review in input.reviews if review.comment]
    
    if not comments:
        return SentimentResponse(
            overall_sentiment="neutral",
            sentiment_score=0.0,
            avg_rating=avg_rating,
            positive_count=0,
            neutral_count=0,
            negative_count=0,
            summary=f"Product has {len(input.reviews)} ratings with an average of {avg_rating:.1f} stars"
        )
    
    # Create a combined text for analysis
    combined_reviews = "\n\n".join(comments)
    
    # Analyze sentiment with Ollama
    prompt = f"""
    I have a product with {len(input.reviews)} reviews and an average rating of {avg_rating:.1f}/5.
    
    Here are the reviews:
    {combined_reviews}
    
    Please analyze these reviews and provide the following:
    1. Overall sentiment (positive, neutral, or negative)
    2. A sentiment score from -1 to 1
    3. Count of positive reviews
    4. Count of neutral reviews
    5. Count of negative reviews
    6. A brief 1-sentence summary of customer sentiment
    
    Format your response as a JSON object with the following keys:
    "overall_sentiment", "sentiment_score", "positive_count", "neutral_count", "negative_count", "summary"
    """
    
    try:
        # Call Ollama API with llama3 model
        response = requests.post(
            OLLAMA_API,
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )
        
        response.raise_for_status()
        result = response.json()
        
        # Extract the JSON from the response
        ai_response = result.get("response", "")
        
        # Find JSON in the response (it might be embedded in text)
        try:
            # Try to find JSON object in the text
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = ai_response[json_start:json_end]
                result_json = json.loads(json_str)
            else:
                # Fallback if JSON not found
                raise ValueError("JSON not found in response")
        except:
            # Fallback sentiment analysis based on star rating
            if avg_rating >= 4:
                sentiment = "positive"
                score = 0.7
            elif avg_rating >= 3:
                sentiment = "neutral"
                score = 0.0
            else:
                sentiment = "negative"
                score = -0.7
                
            result_json = {
                "overall_sentiment": sentiment,
                "sentiment_score": score,
                "positive_count": sum(1 for r in input.reviews if r.rating >= 4),
                "neutral_count": sum(1 for r in input.reviews if r.rating == 3),
                "negative_count": sum(1 for r in input.reviews if r.rating <= 2),
                "summary": f"Product has an average rating of {avg_rating:.1f} stars from {len(input.reviews)} reviews."
            }
        
        return SentimentResponse(
            overall_sentiment=result_json.get("overall_sentiment", "neutral"),
            sentiment_score=float(result_json.get("sentiment_score", 0.0)),
            avg_rating=avg_rating,
            positive_count=int(result_json.get("positive_count", 0)),
            neutral_count=int(result_json.get("neutral_count", 0)),
            negative_count=int(result_json.get("negative_count", 0)),
            summary=result_json.get("summary", f"Average rating: {avg_rating:.1f}/5")
        )
        
    except Exception as e:
        print(f"Error analyzing with Ollama: {str(e)}")
        
        # Fallback sentiment analysis if Ollama fails
        positive_reviews = sum(1 for r in input.reviews if r.rating >= 4)
        neutral_reviews = sum(1 for r in input.reviews if r.rating == 3)
        negative_reviews = sum(1 for r in input.reviews if r.rating <= 2)
        
        if avg_rating >= 4:
            sentiment = "positive"
            score = 0.7
        elif avg_rating >= 3:
            sentiment = "neutral"
            score = 0.0
        else:
            sentiment = "negative"
            score = -0.7
            
        summary = f"Based on {len(input.reviews)} reviews, the product has an average rating of {avg_rating:.1f}/5."
        
        return SentimentResponse(
            overall_sentiment=sentiment,
            sentiment_score=score,
            avg_rating=avg_rating,
            positive_count=positive_reviews,
            neutral_count=neutral_reviews,
            negative_count=negative_reviews,
            summary=summary
        )

@app.get("/")
def read_root():
    return {"Hello": "World"}


