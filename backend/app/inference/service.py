import os
from groq import Groq
from typing import Dict, Any
import json

class InferenceService:
    def __init__(self):
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY", "dummy_key"))
        self.model = "llama-3.3-70b-versatile"

    async def generate_cdc(self, crawled_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = self._build_prompt(crawled_data)
        
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert Requirements Engineer. Your task is to generate a professional 'Cahier des Charges' (CdC) based on website analysis data. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(completion.choices[0].message.content)

    def _build_prompt(self, data: Dict[str, Any]) -> str:
        return f"""
        Analyze the following crawled data from {data['url']} and generate a professional 'Cahier des Charges' (Project Specifications).
        
        Website Title: {data['title']}
        Detected Links: {json.dumps(data['links'][:20])}
        Detected Forms: {json.dumps(data['forms'])}
        Detected Buttons: {json.dumps(data['buttons'])}
        
        The output must be a JSON object containing the following 15 sections. 
        Each section must be detailed, professional, and directly relevant to the data analyzed.
        
        Sections:
        1. "Contexte & Objectifs": Describe the current state and what the project aims to achieve.
        2. "Description du besoin": Explicitly state what the target users need.
        3. "Analyse de l’existant": Detail any existing systems or competition found from the data.
        4. "Périmètre fonctionnel": Define the boundaries of the system.
        5. "Acteurs et rôles": List the types of users and their expected interactions.
        6. "Cas d’utilisation": Provide 3-5 key user scenarios.
        7. "Exigences fonctionnelles": List features categorized by complexity (MVP, Standard, Advanced). 
           Format: Array of objects with 'feature', 'description', 'complexity', and 'confidence_score' (0-1).
        8. "Exigences non fonctionnelles": Include security, performance, and accessibility requirements.
        9. "Architecture technique proposée": Suggest a modern stack based on the requirements.
        10. "Modèle de données préliminaire": List the main entities and their attributes.
        11. "API endpoints proposés": Suggest key REST or GraphQL endpoints.
        12. "Planning estimatif": Provide a high-level timeline for development phases.
        13. "Estimation budgétaire": Provide a realistic cost range for development.
        14. "Livrables": List all the items to be handed over (code, docs, etc.).
        15. "Risques & hypothèses": Identify potential project risks and assumptions made.

        The JSON must be valid, use French for section titles and content, and maintain a high-quality consultant tone.
        """
