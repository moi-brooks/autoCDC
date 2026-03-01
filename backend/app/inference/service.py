import os
from groq import Groq
from typing import Dict, Any
import json

class InferenceService:
    def __init__(self):
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY", "dummy_key"))
        self.model = "llama-3.3-70b-versatile"

    async def generate_cdc(self, crawled_data: Dict[str, Any], language: str = "fr") -> Dict[str, Any]:
        prompt = self._build_prompt(crawled_data, language)
        
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": f"You are an expert Requirements Engineer. Your task is to generate a professional 'Cahier des Charges' (CdC) based on website analysis data. Output ONLY valid JSON. Language: {language}"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(completion.choices[0].message.content)

    def _build_prompt(self, data: Dict[str, Any], lang: str) -> str:
        sections = {
            "fr": [
                '1. "Présentation du Projet": Présentation globale, Contexte (1.1), Besoins Exprimés (1.2) et Utilisateurs du Système (1.3).',
                '2. "Organisation du Travail": Méthodologie (Agile Scrum), outils recommandés (Jira, Trello) et organisation des sprints.',
                '3. "Analyse de l’existant": État des lieux détaillé, analyse de la concurrence et opportunités d\'amélioration.',
                '4. "Périmètre fonctionnel": Définition précise de ce que le système fera et ne fera pas (Limites du projet).',
                '5. "Acteurs et rôles": Description détaillée des types d\'utilisateurs (Administrateur, Utilisateur Final, etc.) et leurs permissions.',
                '6. "Cas d’utilisation": Scénarios d\'utilisation clés détaillés avec diagrammes textuels si nécessaire.',
                '7. "Exigences fonctionnelles": Liste exhaustive (MVP, Standard, Advanced) présentée sous forme de tableaux Markdown clairs.',
                '8. "Exigences non fonctionnelles": Sécurité, Performance, Disponibilité, Accessibilité et Ergonomie (UX/UI).',
                '9. "Architecture technique proposée": Stack technologique recommandée (Backend, Frontend, Base de données) et justification.',
                '10. "Modèle de données préliminaire": Description textuelle des entités principales et de leurs relations (MCD/MLD).',
                '11. "API Endpoints": Liste des points d\'entrée principaux, méthodes HTTP et utilité pour l\'intégration.',
                '12. "Planning estimatif": Diagramme de Gantt textuel ou phases de développement avec timeline prévisionnelle.',
                '13. "Estimation budgétaire": Analyse détaillée des coûts (développement, infrastructure, maintenance, formation).',
                '14. "Livrables": Dossier de conception, Application source, Documentation technique, Manuel utilisateur et Rapport de tests.',
                '15. "Risques & hypothèses": Identification des facteurs de risque critiques et suppositions de départ du projet.'
            ],
            "en": [
                '1. "Project Presentation": Global overview, Context (1.1), Expressed Needs (1.2), and System Users (1.3).',
                '2. "Work Organization": Methodology (Agile Scrum), recommended tools (Jira, Trello), and sprint organization.',
                '3. "Existing Analysis": Detailed current state assessment, competitor analysis, and improvement opportunities.',
                '4. "Functional Scope": Precise definition of what the system will and will not do (Project boundaries).',
                '5. "Actors & Roles": Detailed description of user types (Admin, End User, etc.) and their permissions.',
                '6. "Use Cases": Key use scenarios detailed with textual diagrams where appropriate.',
                '7. "Functional Requirements": Exhaustive list (MVP, Standard, Advanced) presented in clear Markdown tables.',
                '8. "Non-Functional Requirements": Security, Performance, Availability, Accessibility, and Ergonomics (UX/UI).',
                '9. "Technical Architecture": Recommended tech stack (Backend, Frontend, Database) and justification.',
                '10. "Data Model": Textual description of main entities and their relationships (ERD logic).',
                '11. "API Endpoints": List of main entry points, HTTP methods, and utility for integration.',
                '12. "Estimated Planning": Textual Gantt chart or development phases with forecast timeline.',
                '13. "Budget Estimation": Detailed cost analysis (development, infrastructure, maintenance, training).',
                '14. "Deliverables": Design folder, Source application, Technical documentation, User manual, and Test report.',
                '15. "Risks & Hypotheses": Identification of critical risk factors and initial project assumptions.'
            ]
        }
        
        lang_instruction = "IMPORTANT: ALL section content MUST be written in FRENCH. Use professional French engineering terminology." if lang == "fr" else "IMPORTANT: ALL section content MUST be written in ENGLISH. Use professional English engineering terminology."

        return f"""
        Analyze the following crawled data from {data['url']} and generate a professional 'Cahier des Charges' (Project Specifications) following the style of a formal technical report.
        
        Website Title: {data['title']}
        Detected Links: {json.dumps(data['links'][:20])}
        Detected Forms: {json.dumps(data['forms'])}
        Detected Buttons: {json.dumps(data['buttons'])}
        
        The output must be a JSON object containing the following 15 sections. 
        Each section value MUST be a LONG, DETAILED STRING in MARKDOWN format.
        Do NOT put JSON objects or arrays inside the section content; use Markdown lists or tables instead.
        
        Sections to generate:
        {" ".join(sections.get(lang, sections["en"]))}

        {lang_instruction}
        Maintain a high-quality consultant/academic tone. Be extremely thorough and specific to the website data provided.
        Each section should contain at least 200-300 words of professional analysis.
        """
