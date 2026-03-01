from typing import Dict, Any
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

class GeneratorService:
    def generate_markdown(self, metadata: Dict[str, Any], cdc: Dict[str, Any]) -> str:
        md = f"""# Cahier des Charges: {metadata['title']}

"""
        md += f"""**URL:** {metadata['url']}

"""
        md += f"""---

"""
        
        for section, content in cdc.items():
            md += f"""## {section}

"""
            if isinstance(content, str):
                md += f"""{content}

"""
            else:
                import json
                md += f"""```json
"""
                md += json.dumps(content, indent=2)
                md += """
```

"""
        
        return md

    def generate_pdf(self, metadata: Dict[str, Any], cdc: Dict[str, Any]) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = styles['Heading1']
        title_style.alignment = TA_CENTER
        story.append(Paragraph(f"Cahier des Charges: {metadata['title']}", title_style))
        story.append(Spacer(1, 12))
        
        story.append(Paragraph(f"URL: {metadata['url']}", styles['Normal']))
        story.append(Spacer(1, 24))

        # Sections
        for section, content in cdc.items():
            story.append(Paragraph(section, styles['Heading2']))
            story.append(Spacer(1, 12))
            
            if isinstance(content, str):
                story.append(Paragraph(content.replace('\n', '<br/>'), styles['Normal']))
            else:
                import json
                text = json.dumps(content, indent=2).replace(' ', '&nbsp;').replace('\n', '<br/>')
                story.append(Paragraph(text, styles['Code']))
                
            story.append(Spacer(1, 12))

        doc.build(story)
        buffer.seek(0)
        return buffer
