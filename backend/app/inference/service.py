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
        Analyze the following crawled data from {data['url']} and generate a comprehensive 'Cahier des Charges' (Project Specifications).
        
        Website Title: {data['title']}
        Detected Links: {json.dumps(data['links'][:20])}
        Detected Forms: {json.dumps(data['forms'])}
        Detected Buttons: {json.dumps(data['buttons'])}
        
        The output must be a JSON object containing the following 15 sections:
        1. Contexte & Objectifs
        2. Description du besoin
        3. Analyse de l’existant
        4. Périmètre fonctionnel
        5. Acteurs et rôles
        6. Cas d’utilisation
        7. Exigences fonctionnelles (MVP, Standard, Advanced)
        8. Exigences non fonctionnelles
        9. Architecture technique proposée
        10. Modèle de données préliminaire
        11. API endpoints proposés
        12. Planning estimatif
        13. Estimation budgétaire
        14. Livrables
        15. Risques & hypothèses
        
        For each feature in 'Exigences fonctionnelles', include a 'complexity' (MVP/Standard/Advanced) and a 'confidence_score'.
        """
