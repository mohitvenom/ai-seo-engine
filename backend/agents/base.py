import json, os
import openai
import google.genai as genai
from dotenv import load_dotenv

load_dotenv()

openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def _clean(text: str) -> dict:
    return json.loads(text.strip().replace("```json", "").replace("```", "").strip())

async def call_openai(system: str, user: str) -> dict:
    res = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        response_format={"type": "json_object"},
        max_tokens=1000,
    )
    return json.loads(res.choices[0].message.content)

async def call_gemini(system: str, user: str) -> dict:
    response = await gemini_client.aio.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"{system}\n\n{user}",
        config={"response_mime_type": "application/json"}
    )
    return _clean(response.text)

async def call_llm(system: str, user: str, provider: str = "openai") -> dict:
    if provider == "gemini":
        return await call_gemini(system, user)
    return await call_openai(system, user)