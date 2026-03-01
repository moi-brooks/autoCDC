import asyncio
from playwright.async_api import async_playwright
from typing import Dict, List, Any

class CrawlerService:
    async def crawl_url(self, url: str) -> Dict[str, Any]:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                await page.goto(url, wait_until="networkidle", timeout=60000)
                
                content = {
                    "url": url,
                    "title": await page.title(),
                    "html": await page.content(),
                    "links": await self._extract_links(page),
                    "forms": await self._extract_forms(page),
                    "buttons": await self._extract_buttons(page),
                }
                
                return content
            finally:
                await browser.close()

    async def _extract_links(self, page) -> List[Dict[str, str]]:
        links = await page.query_selector_all("a")
        extracted = []
        for link in links:
            text = await link.inner_text()
            href = await link.get_attribute("href")
            if href:
                extracted.append({"text": text.strip(), "href": href})
        return extracted

    async def _extract_forms(self, page) -> List[Dict[str, Any]]:
        forms = await page.query_selector_all("form")
        extracted = []
        for form in forms:
            inputs = await form.query_selector_all("input, select, textarea, button")
            form_data = {
                "id": await form.get_attribute("id"),
                "fields": []
            }
            for field in inputs:
                form_data["fields"].append({
                    "name": await field.get_attribute("name"),
                    "type": await field.get_attribute("type"),
                    "placeholder": await field.get_attribute("placeholder")
                })
            extracted.append(form_data)
        return extracted

    async def _extract_buttons(self, page) -> List[str]:
        buttons = await page.query_selector_all("button")
        return [await b.inner_text() for b in buttons if await b.inner_text()]
