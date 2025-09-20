# Path: /Users/abhi/Desktop/Local-Artisian_AI/flask-server/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os
import pandas as pd
import logging
import traceback
from typing import Dict, List, Any
import numpy as np 
import re 

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Initialize Gemini AI
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)
try:
    model = genai.GenerativeModel("gemini-1.5-pro")
except Exception as e:
    logger.warning(f"Failed to initialize gemini-1.5-pro, trying gemini-pro: {e}")
    model = genai.GenerativeModel("gemini-pro")

# Load CSV data
df = pd.DataFrame()
try:
    csv_paths = [
        os.path.join(os.getcwd(), 'public', 'Artisans.csv'),
        os.path.join(os.path.dirname(__file__), '..', 'public', 'Artisans.csv'),
        os.path.join(os.path.dirname(__file__), 'Artisans.csv')
    ]
    
    csv_loaded = False
    for csv_path in csv_paths:
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            logger.info(f"✅ Successfully loaded {len(df)} records from {csv_path}")
            csv_loaded = True
            break
    
    if not csv_loaded:
        logger.error("❌ Could not find Artisans.csv file in any of the expected locations.")
        df = pd.DataFrame()
    else:
        if 'age' in df.columns:
            df['age'] = pd.to_numeric(df['age'], errors='coerce')
        phone_columns = [col for col in df.columns if 'phone' in col.lower()]
        for col in phone_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.replace(r'\.\d+', '', regex=True)
                df[col] = df[col].apply(lambda x: f"{int(float(x))}" if pd.notna(x) and x.replace('.', '', 1).isdigit() else '')
        
        searchable_cols = [col for col in ['name', 'craft_type', 'state', 'district', 'village', 'languages_spoken', 'languages'] if col in df.columns]
        if searchable_cols:
            df['search_text'] = df[searchable_cols].fillna('').astype(str).agg(' '.join, axis=1).str.lower()
        else:
            df['search_text'] = ''

except Exception as e:
    logger.error(f"❌ Error loading and processing CSV: {e}")
    logger.error(traceback.format_exc())
    df = pd.DataFrame()

# === Intent Detection and Helper Functions ===

OUT_OF_SCOPE_KEYWORDS = ['who is', 'what is', 'prime minister', 'president', 'weather', 'news', 'stock market', 'capital of', 'history of']

def classify_intent(query: str) -> str:
    query_lower = query.lower()
    
    if any(word in query_lower for word in OUT_OF_SCOPE_KEYWORDS):
        return 'out_of_scope'
    
    if 'nearby artisans' in query_lower or 'nearby' in query_lower:
        return 'nearby_search'
    if any(word in query_lower for word in ['custom orders', 'wedding rings', 'custom made']):
        return 'custom_orders'
    if 'workshops' in query_lower:
        return 'workshops'
    if any(word in query_lower for word in ['statistics', 'stats', 'count', 'how many', 'total', 'number', 'unique']):
        return 'statistics'
    if any(word in query_lower for word in ['find', 'search', 'show', 'list', 'get', 'display']):
        return 'search'
    return 'general'

def extract_entities_from_query(query: str) -> Dict[str, Any]:
    entities = {}
    query_lower = query.lower()
    
    craft_keywords = ['pottery', 'textile', 'weaving', 'embroidery', 'woodwork', 'metalwork', 'painting', 'jeweler', 'jewelry', 'carpet', 'tanjore', 'rogan', 'glass painting', 'jewelers']
    location_keywords = ['delhi', 'rajasthan', 'tamil nadu', 'kolkata', 'mumbai', 'gujarat', 'satna', 'uttar pradesh']

    craft_match = re.search(r'\b(' + '|'.join(re.escape(k) for k in craft_keywords) + r')\b', query_lower)
    if craft_match:
        entities['craft_type'] = craft_match.group(1)
        
    location_match = re.search(r'\b(' + '|'.join(re.escape(k) for k in location_keywords) + r')\b', query_lower)
    if location_match:
        entities['location'] = location_match.group(1)
        
    return entities

def search_artisans(query: str, max_results: int = 10) -> List[Dict]:
    if df.empty: return []
    query_lower = query.lower()

    entities = extract_entities_from_query(query)
    
    matching_rows = pd.DataFrame()
    
    # === NEW: Smarter search logic using entities first ===
    if 'craft_type' in entities and 'location' in entities:
        matching_rows = df[
            (df['craft_type'].str.lower().str.contains(entities['craft_type'], na=False)) &
            (df['state'].str.lower().str.contains(entities['location'], na=False) | df['district'].str.lower().str.contains(entities['location'], na=False))
        ]
    elif 'craft_type' in entities:
        matching_rows = df[df['craft_type'].str.lower().str.contains(entities['craft_type'], na=False)]
    elif 'location' in entities:
        matching_rows = df[df['state'].str.lower().str.contains(entities['location'], na=False) | df['district'].str.lower().str.contains(entities['location'], na=False)]
    
    # Fallback to simple keyword search if no entities were found or no matches were made
    if matching_rows.empty:
      irrelevant_terms = ['find', 'artists', 'show', 'get', 'list', 'i', 'need', 'in', 'from', 'for', 'a']
      search_terms = [word for word in query_lower.split() if word not in irrelevant_terms and len(word) > 2]
      
      if search_terms:
          combined_mask = pd.Series([True] * len(df))
          if 'search_text' in df.columns:
              for term in search_terms:
                  combined_mask &= df['search_text'].str.contains(term, na=False, regex=False)
          matching_rows = df[combined_mask]
    # === END NEW ===
    
    results = []
    for _, row in matching_rows.head(max_results).iterrows():
        artist_data = {
            'artisan_id': str(row.get('artisan_id', row.get('govt_artisan_id', row.get('id', 'N/A')))),
            'name': row.get('name', 'Unknown'),
            'gender': row.get('gender', 'N/A'),
            'age': int(row.get('age')) if pd.notna(row.get('age')) else 'N/A',
            'craft_type': row.get('craft_type', 'Traditional Craft'),
            'state': row.get('state', 'Unknown'),
            'district': row.get('district', 'Unknown'),
            'village': row.get('village', 'Unknown'),
            'languages': row.get('languages_spoken', row.get('languages', 'Hindi')),
            'email': row.get('contact_email', 'Not available'),
            'phone': row.get('contact_phone', 'Not available'),
            'phone_available': row.get('contact_phone_boolean', True),
            'govt_id': row.get('govt_artisan_id', 'N/A'),
            'cluster_code': row.get('artisan_cluster_code', 'N/A')
        }
        results.append(artist_data)
    return results

def get_statistics_from_df() -> Dict:
    if df.empty: return {"error": "No CSV data loaded"}
    stats = {'total_artisans': len(df)}
    for col in ['craft_type', 'state', 'district', 'gender']:
        if col in df.columns:
            stats[col + 's'] = {str(k): int(v) for k, v in df[col].value_counts().head(10).items()}
    if 'age' in df.columns and pd.api.types.is_numeric_dtype(df['age']):
        stats['age_statistics'] = {
            'average_age': round(float(df['age'].mean()), 1),
            'median_age': float(df['age'].median()),
            'min_age': int(df['age'].min()),
            'max_age': int(df['age'].max())
        }
    
    if 'craft_type' in df.columns:
        stats['unique_crafts'] = int(df['craft_type'].nunique())

    if 'state' in df.columns:
        stats['unique_states'] = int(df['state'].nunique())
    
    return stats

def filter_artisans_from_df(filters: Dict) -> List[Dict]:
    if df.empty: return []
    filtered_df = df.copy()
    for key, value in filters.items():
        if key in filtered_df.columns:
            filtered_df = filtered_df[filtered_df[key].astype(str).str.lower() == str(value).lower()]
    
    results = []
    for _, row in filtered_df.head(20).iterrows():
        results.append({
            'artisan_id': str(row.get('artisan_id', row.get('govt_artisan_id', row.get('id', 'N/A')))),
            'name': row.get('name', 'Unknown'),
            'craft_type': row.get('craft_type', 'Traditional Craft'),
            'state': row.get('state', 'Unknown'),
            'district': row.get('district', 'Unknown'),
            'age': int(row.get('age')) if pd.notna(row.get('age')) else 'N/A',
            'gender': row.get('gender', 'N/A')
        })
    return results

def get_similar_artisans_from_df(artisan_id: str, limit: int) -> Dict:
    if df.empty: return {}
    target = df[df['artisan_id'].astype(str) == artisan_id].iloc[0] if 'artisan_id' in df.columns else None
    if target is None: return {}

    similar_df = df[
        (df['craft_type'] == target['craft_type']) &
        (df['state'] == target['state']) &
        (df['artisan_id'].astype(str) != artisan_id)
    ].head(limit)
    
    similar_artists = []
    for _, row in similar_df.iterrows():
        similar_artists.append({
            'artisan_id': str(row.get('artisan_id', 'N/A')),
            'name': row.get('name', 'Unknown'),
            'craft_type': row.get('craft_type', 'Traditional Craft'),
            'state': row.get('state', 'Unknown'),
            'district': row.get('district', 'Unknown')
        })
        
    return {
        'similar_artists': similar_artists,
        'reference_artisan': {
            'artisan_id': str(target.get('artisan_id', 'N/A')),
            'name': target.get('name', 'Unknown'),
            'craft_type': target.get('craft_type', 'Traditional Craft')
        }
    }

# --- API Routes ---

@app.route('/', methods=['GET'])
def root_health_check():
    try:
        data_status = "loaded" if not df.empty else "not loaded"
        return jsonify({
            'status': 'healthy',
            'message': 'Kala-Kaart AI Assistant API is running',
            'data_status': data_status,
            'total_artisans': len(df) if not df.empty else 0,
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        query = data.get('message', '')
        
        if df.empty:
            raise ValueError("CSV data not loaded on the server.")

        intent = classify_intent(query)
        
        if intent == 'out_of_scope':
            response = {
                "message": "I am a specialized AI assistant for local artisans. I can help you find artists by craft, location, or get database statistics. I cannot answer general knowledge questions.",
                "llm_message": "🟡 Out-of-scope query detected: The request was not related to the artisan database. No search was performed.",
                "suggestions": [
                    "Show me artists in Rajasthan",
                    "What is your total artisan count?",
                    "Find me pottery artists"
                ],
                'artists': [],
                'stats': {},
                'status': 'success'
            }
            return jsonify(response)
        
        entities = extract_entities_from_query(query)
        
        artists = []
        stats = {}
        llm_message = ""
        suggestions = []

        if intent == 'nearby_search':
            llm_message = "I am not yet integrated with a location service to find artists 'nearby' you. Please specify a state or district instead."
            suggestions = ["Find artists in Tamil Nadu", "Find artists in Jaipur", "Browse all craft types"]
        elif intent == 'custom_orders':
            llm_message = "I can help you with custom orders by finding artisans who specialize in specific crafts. Tell me what you need, like 'jewelry makers for wedding rings'."
            suggestions = ["Find jewelers in Delhi", "Show me artists for woodwork", "Connect me with painters"]
        elif intent == 'workshops':
            llm_message = "I'm sorry, my current database does not contain information about upcoming workshops. You can ask me to find artisans by craft or location."
            suggestions = ["Find pottery artists", "Find artists in Gujarat", "Get database statistics"]
        elif intent == 'statistics':
            stats = get_statistics_from_df()
            llm_message = "Here are the database statistics you requested."
            suggestions = ["Show craft types", "Artists by state", "Gender distribution"]
        elif intent == 'search' or intent == 'general':
            artists = search_artisans(query, max_results=5)
            if artists:
                llm_message = f"Found {len(artists)} artisan(s) matching your query."
                suggestions = ["Find similar artists", "Search by location", "Browse other crafts"]
            else:
                llm_message = "I'm sorry, I couldn't find any artists that match your query. Please try a different search or ask for a different craft type."
                suggestions = ["Browse craft types", "Find artists in a specific state", "Get general statistics"]
        else:
            llm_message = "Hello! I am a RAG AI assistant. I can help you search for artisans by craft, location, or name. You can also ask for database statistics."
            suggestions = ["Show me pottery artists", "Find artists in Rajasthan", "Get database statistics"]

        response = {
            'intent': intent,
            'entities': entities,
            'message': llm_message,
            'artists': artists,
            'suggestions': suggestions,
            'stats': stats,
            'status': 'success'
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to process your request. Please try again.',
            'llm_message': '🔴 Error: Backend server encountered an internal error. Check logs for details.',
            'artists': [], 'suggestions': [], 'stats': {}
        }), 500

@app.route('/api/search', methods=['POST'])
def search_artisans_endpoint():
    try:
        data = request.get_json()
        query = data.get('query', '')
        max_results = data.get('max_results', 10)
        
        artists = search_artisans(query, max_results)
        
        return jsonify({
            'artists': artists,
            'total': len(artists),
            'query': query
        })
    except Exception as e:
        logger.error(f"Search endpoint error: {e}")
        return jsonify({'error': 'Search failed'}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics_endpoint():
    try:
        stats = get_statistics_from_df()
        return jsonify({
            'stats': stats,
            'message': 'Database statistics retrieved successfully'
        })
    except Exception as e:
        logger.error(f"Statistics endpoint error: {e}")
        return jsonify({'error': 'Failed to get statistics'}), 500

@app.route('/api/filter', methods=['POST'])
def filter_artisans_endpoint():
    try:
        data = request.get_json()
        filters = data or {}
        artists = filter_artisans_from_df(filters)
        return jsonify({
            'artists': artists,
            'total': len(artists),
            'filters_applied': filters
        })
    except Exception as e:
        logger.error(f"Filter endpoint error: {e}")
        return jsonify({'error': 'Filter failed'}), 500

@app.route('/api/similar/<artisan_id>', methods=['GET'])
def get_similar_artists_endpoint(artisan_id):
    try:
        limit = request.args.get('limit', 5, type=int)
        similar_data = get_similar_artisans_from_df(artisan_id, limit)
        if not similar_data:
            return jsonify({'error': 'Artisan or similar artists not found'}), 404
        return jsonify(similar_data)
    except Exception as e:
        logger.error(f"Similar artists endpoint error: {e}")
        return jsonify({'error': 'Failed to find similar artisans'}), 500

@app.route('/api/unique-values/<column>', methods=['GET'])
def get_unique_values_endpoint(column):
    try:
        if df.empty or column not in df.columns:
            return jsonify({'column': column, 'values': [], 'count': 0}), 404
        
        unique_values = df[column].dropna().unique().tolist()
        return jsonify({
            'column': column,
            'values': unique_values,
            'count': len(unique_values)
        })
    except Exception as e:
        logger.error(f"Unique values endpoint error: {e}")
        return jsonify({'error': 'Failed to get unique values'}), 500

if __name__ == '__main__':
    try:
        logger.info("\n🚀 Kala-Kaart AI Assistant API Starting...")
        logger.info("📡 Server will run on http://localhost:8000")
        logger.info("🔧 Debug mode: True")
        app.run(port=8000, debug=True, threaded=True)
    except Exception as e:
        logger.error(f"\n❌ Server startup failed: {e}")
        logger.error(traceback.format_exc())