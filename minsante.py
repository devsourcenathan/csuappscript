import requests
import json

url = "https://csuapps.minsante.cm/api/graphql"
headers = {
    'Content-Type': 'application/json',
    'csrftoken': 'x2QIR7foHouXTD08xauBtr6QPMZBilLi',  # Note: Ce token pourrait être dynamique
    'Cookie': 'csrftoken=x2QIR7foHouXTD08xauBtr6QPMZBilLi; JWT=ey...' # Le JWT actuel
}
payload = {
    "query": "mutation authenticate($username: String!, $password: String!) {\n            tokenAuth(username: $username, password: $password) {\n              refreshExpiresIn\n            }\n          }",
    "variables": {
        "password": "kevine2002",
        "username": "ROCHOUME"
    }
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

if response.status_code == 200:
    try:
        data = response.json()
        print("Réponse de l'authentification :", data)

        # Récupérer le token JWT du cookie (si c'est ainsi que l'API fonctionne après l'authentification)
        jwt_token = response.cookies.get('JWT')
        if jwt_token:
            print("Token JWT récupéré :", jwt_token)
            # Vous devrez stocker ce token pour les requêtes suivantes
        else:
            print("Token JWT non trouvé dans les cookies après l'authentification.")

    except json.JSONDecodeError:
        print("Erreur lors du décodage de la réponse JSON.")
        print("Réponse brute :", response.text)
else:
    print(f"La requête d'authentification a échoué avec le statut code : {response.status_code}")
    print("Réponse :", response.text)