## Script done to populate the databse with questions of the Quiz initialy present on the frontend
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    exit(1)

SUPABASE_URL = SUPABASE_URL.rstrip("/")
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

QUESTIONS_DATA = [
  {
    "category": "Transport",
    "question": "Combien de kilomètres parcourez-vous en voiture par semaine ?",
    "options": [
      { "label": "0-20 km", "value": 10, "co2": 20 },
      { "label": "20-50 km", "value": 35, "co2": 70 },
      { "label": "50-100 km", "value": 75, "co2": 150 },
      { "label": "Plus de 100 km", "value": 150, "co2": 300 },
      { "label": "Je n'utilise pas de voiture", "value": 0, "co2": 0 }
    ]
  },
  {
    "category": "Transport",
    "question": "Combien de vols en avion prenez-vous par an ?",
    "options": [
      { "label": "Aucun", "value": 0, "co2": 0 },
      { "label": "1-2 vols courts courriers", "value": 1, "co2": 400 },
      { "label": "3-5 vols courts courriers", "value": 3, "co2": 800 },
      { "label": "1-2 vols longs courriers", "value": 2, "co2": 2000 },
      { "label": "Plus de 5 vols par an", "value": 6, "co2": 3000 }
    ]
  },
  {
    "category": "Alimentation",
    "question": "Combien de fois par semaine consommez-vous de la viande rouge ?",
    "options": [
      { "label": "Jamais", "value": 0, "co2": 0 },
      { "label": "1-2 fois", "value": 1, "co2": 100 },
      { "label": "3-4 fois", "value": 3, "co2": 200 },
      { "label": "5-7 fois", "value": 5, "co2": 350 },
      { "label": "Plus de 7 fois", "value": 8, "co2": 500 }
    ]
  },
  {
    "category": "Alimentation",
    "question": "Achetez-vous principalement des produits locaux et de saison ?",
    "options": [
      { "label": "Toujours", "value": 5, "co2": 50 },
      { "label": "Souvent", "value": 3, "co2": 150 },
      { "label": "Parfois", "value": 2, "co2": 250 },
      { "label": "Rarement", "value": 1, "co2": 350 },
      { "label": "Jamais", "value": 0, "co2": 450 }
    ]
  },
  {
    "category": "Énergie",
    "question": "Quelle est la taille de votre logement ?",
    "options": [
      { "label": "Studio (moins de 30m²)", "value": 25, "co2": 400 },
      { "label": "T2 (30-50m²)", "value": 40, "co2": 600 },
      { "label": "T3 (50-80m²)", "value": 65, "co2": 900 },
      { "label": "T4/T5 (80-120m²)", "value": 100, "co2": 1200 },
      { "label": "Maison (plus de 120m²)", "value": 150, "co2": 1800 }
    ]
  },
  {
    "category": "Énergie",
    "question": "Utilisez-vous des Énergies renouvelables ?",
    "options": [
      { "label": "Oui, 100% renouvelable", "value": 5, "co2": 0 },
      { "label": "Partiellement", "value": 3, "co2": 200 },
      { "label": "Non", "value": 0, "co2": 400 },
      { "label": "Je ne sais pas", "value": 1, "co2": 300 }
    ]
  },
  {
    "category": "Consommation",
    "question": "À quelle fréquence achetez-vous des vêtements neufs ?",
    "options": [
      { "label": "Rarement (moins de 5 par an)", "value": 1, "co2": 50 },
      { "label": "Occasionnellement (5-10 par an)", "value": 2, "co2": 150 },
      { "label": "Régulièrement (10-20 par an)", "value": 3, "co2": 300 },
      { "label": "Souvent (plus de 20 par an)", "value": 4, "co2": 500 }
    ]
  },
  {
    "category": "Consommation",
    "question": "Combien d'appareils électroniques achetez-vous par an ?",
    "options": [
      { "label": "Aucun", "value": 0, "co2": 0 },
      { "label": "1 appareil", "value": 1, "co2": 100 },
      { "label": "2-3 appareils", "value": 2, "co2": 250 },
      { "label": "Plus de 3 appareils", "value": 4, "co2": 500 }
    ]
  }
]

def main():
    print("Clearing existing questions...")
    requests.delete(f"{SUPABASE_URL}/rest/v1/onboarding_questions?id=not.is.null", headers=HEADERS)

    for i, q_data in enumerate(QUESTIONS_DATA):
        print(f"Inserting question: {q_data['question']}")
        
        q_payload = {
            "question": q_data["question"],
            "domain": q_data["category"],
            "order_index": i + 1
        }
        
        resp = requests.post(f"{SUPABASE_URL}/rest/v1/onboarding_questions", headers=HEADERS, json=q_payload)
        if resp.status_code not in (200, 201):
            print(f"Failed to insert question: {resp.text}")
            continue
            
        inserted_q = resp.json()[0]
        q_id = inserted_q["id"]
        
        answers_payload = []
        for opt in q_data["options"]:
            answers_payload.append({
                "question_id": q_id,
                "label": opt["label"],
                "max_value": float(opt["value"]),
                "co2_value": float(opt["co2"])
            })
            
        resp_ans = requests.post(f"{SUPABASE_URL}/rest/v1/onboarding_answers", headers=HEADERS, json=answers_payload)
        if resp_ans.status_code not in (200, 201):
            print(f"Failed to insert answers for question {q_id}: {resp_ans.text}")

    print("Successfully populated the database!")

if __name__ == "__main__":
    main()
