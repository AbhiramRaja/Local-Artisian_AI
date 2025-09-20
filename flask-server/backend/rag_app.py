import google.generativeai as genai
import pandas as pd
import os
import logging
from typing import List, Dict, Any, Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ArtisanRAG:
    def __init__(self, api_key: str, csv_file_path: Optional[str] = None):
        """Initialize the RAG system with Gemini API and CSV data"""
        try:
            genai.configure(api_key=api_key)
            # Updated model names - try these in order
            model_names = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']
            
            for model_name in model_names:
                try:
                    self.model = genai.GenerativeModel(model_name)
                    # Test the model with a simple generation
                    test_response = self.model.generate_content("Hello")
                    logger.info(f"Successfully initialized Gemini model: {model_name}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to initialize {model_name}: {e}")
                    continue
            else:
                raise Exception("All model initialization attempts failed")
                
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {e}")
            raise
        
        # Load CSV data
        self.artisan_df = None
        if csv_file_path and os.path.exists(csv_file_path):
            try:
                self.artisan_df = pd.read_csv(csv_file_path)
                logger.info(f"Successfully loaded CSV data: {len(self.artisan_df)} artisans")
                self.preprocess_data()
            except Exception as e:
                logger.error(f"Failed to load CSV data: {e}")
        else:
            logger.warning("No CSV file provided or file doesn't exist")

    def preprocess_data(self):
        """Preprocess the loaded CSV data for better searching"""
        if self.artisan_df is not None:
            # Clean phone numbers (convert scientific notation to regular numbers)
            if 'contact_phone' in self.artisan_df.columns:
                self.artisan_df['contact_phone'] = self.artisan_df['contact_phone'].apply(
                    lambda x: f"{int(x)}" if pd.notna(x) and str(x) != 'nan' else ""
                )
            
            # Create searchable text columns
            searchable_columns = ['name', 'craft_type', 'state', 'district', 'village', 'languages_spoken']
            self.artisan_df['search_text'] = ''
            
            for col in searchable_columns:
                if col in self.artisan_df.columns:
                    self.artisan_df['search_text'] += ' ' + self.artisan_df[col].fillna('').astype(str)
            
            self.artisan_df['search_text'] = self.artisan_df['search_text'].str.lower().str.strip()

    def extract_search_terms(self, query: str) -> List[str]:
        """Extract meaningful search terms from user query"""
        query_lower = query.lower()
        
        # Remove common words that aren't useful for searching
        stop_words = {
            'artisan', 'artisans', 'from', 'in', 'of', 'the', 'a', 'an', 'and', 'or',
            'show', 'me', 'find', 'get', 'give', 'tell', 'about', 'information',
            'data', 'details', 'list', 'all', 'some', 'with', 'who', 'what',
            'where', 'when', 'how', 'can', 'you', 'please', 'i', 'want', 'need'
        }
        
        # Split and clean terms
        words = query_lower.replace(',', ' ').replace('.', ' ').split()
        meaningful_terms = [word for word in words if word not in stop_words and len(word) > 2]
        
        # If no meaningful terms found, use the original query
        if not meaningful_terms:
            meaningful_terms = [query_lower]
        
        return meaningful_terms

    def search_artisans(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search the CSV data for relevant artisans"""
        if self.artisan_df is None:
            return []
        
        # Extract meaningful search terms
        search_terms = self.extract_search_terms(query)
        
        matching_rows = pd.DataFrame()
        
        # Search for each term
        for term in search_terms:
            # Strategy 1: Search in combined search text
            if 'search_text' in self.artisan_df.columns:
                mask1 = self.artisan_df['search_text'].str.contains(term, na=False, regex=False)
                term_matches1 = self.artisan_df[mask1]
                
                if len(term_matches1) > 0:
                    matching_rows = pd.concat([matching_rows, term_matches1]).drop_duplicates()
                    continue
            
            # Strategy 2: Search individual columns if strategy 1 fails
            search_columns = ['name', 'craft_type', 'state', 'district', 'village', 'languages_spoken']
            masks = []
            
            for col in search_columns:
                if col in self.artisan_df.columns:
                    mask = self.artisan_df[col].fillna('').astype(str).str.lower().str.contains(term, regex=False)
                    masks.append(mask)
            
            if masks:
                combined_mask = masks[0]
                for mask in masks[1:]:
                    combined_mask = combined_mask | mask
                term_matches2 = self.artisan_df[combined_mask]
                if len(term_matches2) > 0:
                    matching_rows = pd.concat([matching_rows, term_matches2]).drop_duplicates()
        
        # Limit results
        matching_rows = matching_rows.head(max_results)
        
        results = []
        for _, row in matching_rows.iterrows():
            results.append({
                'artisan_id': row['artisan_id'],
                'name': row['name'],
                'gender': row['gender'],
                'age': row['age'],
                'craft_type': row['craft_type'],
                'state': row['state'],
                'district': row['district'],
                'village': row['village'],
                'languages': row['languages_spoken'],
                'email': row['contact_email'],
                'phone': row['contact_phone'],
                'phone_available': row['contact_phone_boolean'],
                'govt_id': row['govt_artisan_id'],
                'cluster_code': row['artisan_cluster_code']
            })
        
        return results

    def filter_artisans(self, filters: Dict) -> List[Dict]:
        """Filter artisans based on specific criteria"""
        if self.artisan_df is None:
            return []
        
        df = self.artisan_df.copy()
        
        # Apply filters
        if 'state' in filters:
            df = df[df['state'].str.lower() == filters['state'].lower()]
        if 'district' in filters:
            df = df[df['district'].str.lower() == filters['district'].lower()]
        if 'craft_type' in filters:
            df = df[df['craft_type'].str.lower() == filters['craft_type'].lower()]
        if 'gender' in filters:
            df = df[df['gender'].str.lower() == filters['gender'].lower()]
        if 'age_min' in filters:
            df = df[df['age'] >= filters['age_min']]
        if 'age_max' in filters:
            df = df[df['age'] <= filters['age_max']]
        
        results = []
        for _, row in df.head(20).iterrows():  # Limit to 20 results
            results.append({
                'artisan_id': row['artisan_id'],
                'name': row['name'],
                'craft_type': row['craft_type'],
                'state': row['state'],
                'district': row['district'],
                'village': row['village'],
                'age': row['age'],
                'gender': row['gender'],
                'phone': row['contact_phone'],
                'email': row['contact_email']
            })
        
        return results

    def get_statistics(self, state: str = None, district: str = None) -> Dict:
        """Get statistics about artisans"""
        if self.artisan_df is None:
            return {"error": "No CSV data loaded"}
        
        df = self.artisan_df.copy()
        
        # Apply filters
        if state:
            df = df[df['state'].str.lower() == state.lower()]
        if district:
            df = df[df['district'].str.lower() == district.lower()]
        
        stats = {
            'total_artisans': len(df),
            'craft_types': df['craft_type'].value_counts().head(10).to_dict(),
            'states': df['state'].value_counts().head(10).to_dict(),
            'districts': df['district'].value_counts().head(10).to_dict(),
            'gender_distribution': df['gender'].value_counts().to_dict(),
            'age_statistics': {
                'average_age': round(df['age'].mean(), 1),
                'median_age': df['age'].median(),
                'min_age': df['age'].min(),
                'max_age': df['age'].max()
            },
            'contact_info': {
                'with_phone': df['contact_phone_boolean'].value_counts().get('Yes', 0),
                'without_phone': df['contact_phone_boolean'].value_counts().get('No', 0)
            }
        }
        
        return stats

    def get_unique_values(self, column: str) -> List[str]:
        """Get unique values for a specific column"""
        if self.artisan_df is None or column not in self.artisan_df.columns:
            return []
        
        return sorted(self.artisan_df[column].dropna().unique().tolist())

    def generate_response(self, query: str) -> str:
        """Generate response using Gemini with retrieved context from CSV data"""
        if self.artisan_df is None:
            return "Sorry, no artisan data is currently loaded. Please ensure the CSV file is available."
        
        try:
            context_parts = []
            
            # Check for statistics request
            if any(word in query.lower() for word in ['statistics', 'stats', 'count', 'how many', 'total']):
                state = None
                district = None
                
                # Extract state/district from query
                states = self.get_unique_values('state')
                for state_name in states:
                    if state_name.lower() in query.lower():
                        state = state_name
                        break
                
                if state:
                    districts = self.artisan_df[self.artisan_df['state'] == state]['district'].unique()
                    for district_name in districts:
                        if district_name.lower() in query.lower():
                            district = district_name
                            break
                
                stats = self.get_statistics(state, district)
                context_parts.append(f"=== ARTISAN STATISTICS ===\n{stats}")
            
            # Search for specific artisans
            search_results = self.search_artisans(query, max_results=5)
            
            if search_results:
                context_parts.append("=== MATCHING ARTISANS ===")
                for i, artisan in enumerate(search_results, 1):
                    context_parts.append(f"""
{i}. {artisan['name']} (ID: {artisan['artisan_id']})
   - Craft: {artisan['craft_type']}
   - Location: {artisan['village']}, {artisan['district']}, {artisan['state']}
   - Age: {artisan['age']}, Gender: {artisan['gender']}
   - Languages: {artisan['languages']}
   - Email: {artisan['email']}
   - Phone: {artisan['phone']} (Available: {artisan['phone_available']})
   - Government ID: {artisan['govt_id']}
   - Cluster Code: {artisan['cluster_code']}
""")
            
            context = "\n".join(context_parts)
            
            # Create the prompt
            prompt = f"""
You are an assistant for an artisan information system. Use ONLY the provided data to answer the user's question. Do not add any external information about crafts or techniques.

Available Data:
{context}

User Question: {query}

Please provide a helpful answer based solely on the data provided above. If the data doesn't contain information to answer the question, say so clearly.
"""
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"Sorry, I encountered an error: {e}"

def main():
    # Initialize the RAG system
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("Please set your GOOGLE_API_KEY environment variable")
        print("Example: export GOOGLE_API_KEY='your_api_key_here'")
        return
    
    # Initialize with CSV file path
    csv_file_path = "artisans.csv"  # Update with your actual CSV file path
    
    try:
        rag_system = ArtisanRAG(api_key, csv_file_path)
        
    except Exception as e:
        print(f"Failed to initialize system: {e}")
        return
    
    print("\nWelcome to the Artisan Information Chatbot!")
    print("Type 'quit' to exit")
    print("\nYou can ask about:")
    print("- Find artisans by name, craft type, location, or language")
    print("- Get statistics about artisans (e.g., 'statistics for Rajasthan')")
    print("- Search for specific crafts (e.g., 'pottery artisans')")
    print("- Filter by location (e.g., 'artisans from Bihar')")
    
    while True:
        try:
            query = input("\nWhat would you like to know about our artisans? ").strip()
            
            if query.lower() in ['quit', 'exit', 'bye']:
                print("Thank you for using the Artisan Information Chatbot!")
                break
            
            if not query:
                continue
            
            print("\nSearching...")
            
            response = rag_system.generate_response(query)
            print(f"\nResponse: {response}")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    main()