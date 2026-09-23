"""OpenAI API байланысы. Іске қосу: python ai_api.py"""
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import APIError, OpenAI


def ask_ai(prompt: str, instructions: str = "") -> str:
    """Дайын сұрауды ЖИ-ге жіберіп, жауабын мәтін ретінде қайтарады."""
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("prompt бос емес мәтін болуы керек.")
    if not isinstance(instructions, str):
        raise ValueError("instructions мәтін болуы керек.")

    # .env осы Python файлымен бір папкада тұрады.
    load_dotenv(Path(__file__).with_name(".env"))
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or api_key == "PASTE_YOUR_OPENAI_API_KEY_HERE":
        raise RuntimeError(".env ішіне нақты OPENAI_API_KEY енгіз.")

    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip()
    if not model:
        raise RuntimeError(".env ішіндегі OPENAI_MODEL бос болмауы керек.")

    try:
        with OpenAI(api_key=api_key, timeout=60.0, max_retries=1) as client:
            response = client.responses.create(
                model=model,
                instructions=instructions or None,
                input=prompt,
                max_output_tokens=6000,
                store=False,
            )
    except APIError as exc:
        # Кілт пен құжат мәтінін қате хабарламасына шығармаймыз.
        code = getattr(exc, "code", None) or type(exc).__name__
        status = getattr(exc, "status_code", None)
        raise RuntimeError(f"API қатесі: {code}; HTTP={status}.") from None

    if response.status != "completed":
        reason = getattr(response.incomplete_details, "reason", None)
        raise RuntimeError(
            f"Жауап толық алынбады: {response.status}; себеп={reason}."
        )

    answer = response.output_text.strip()
    if not answer:
        raise RuntimeError("API жауап берді, бірақ мәтіндік нәтиже жоқ.")
    return answer


if __name__ == "__main__":
    try:
        answer = ask_ai('Тек "API жұмыс істеп тұр" деп жаз.')
        print("Қосылу сәтті. ЖИ жауабы:")
        print(answer)
    except (RuntimeError, ValueError) as exc:
        raise SystemExit(f"Қате: {exc}") from None