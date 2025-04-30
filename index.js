import util from 'util';


async function authenticate() {
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;
    } catch (error) {
        console.error("Erreur lors de l'import dynamique de node-fetch :", error);
        return;
    }

    const url = "https://csuapps.minsante.cm/api/graphql";
    const headers = {
        'Content-Type': 'application/json',
        'csrftoken': 'X2QIR7fOHouXTD08xauBtr6QPMZBiILI; expires=Tue, 14 Apr 2026 18:35:26 GMT; Max-Age=31449600; Path=/; SameSite=Lax',
        'Cookie': 'csrftoken=X2QIR7fOHouXTD08xauBtr6QPMZBiILI; expires=Tue, 14 Apr 2026 18:35:26 GMT; Max-Age=31449600; Path=/; SameSite=Lax; JWT=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IlJPQ0hPVU1FIiwiZXhwIjoxNzQ0ODI4NTI2LCJvcmlnSWF0IjoxNzQ0NzQyMTI2fQ.0qlOnp8mKxTvCR7yvl-p-p9CjUbicVDVBs65Z1gEf10; expires=Wed, 16 Apr 2025 18:35:26 GMT; HttpOnly; Max-Age=86400; Path=/;JWT-refresh-token=cb312e27eac87c3ab188de4c6bed78cfe7e97e26; expires=Thu, 15 May 2025 18:35:26 GMT; HttpOnly; Max-Age=2592000; Path=/' // Le JWT actuel
    };
    const payload = {
        "query": "mutation authenticate($username: String!, $password: String!) {\n tokenAuth(username: $username, password: $password) {\n refreshExpiresIn\n }\n}",
        "variables": {
            "password": "kevine2002",
            "username": "ROCHOUME"
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Réponse de l'authentification :", util.inspect(data, false, null));

            // Récupérer le token JWT du cookie (si c'est ainsi que l'API fonctionne après l'authentification)
            const cookies = response.headers.raw()['set-cookie'];
            let jwtToken = null;
            if (cookies) {
                for (const cookie of cookies) {
                    if (cookie.startsWith('JWT=')) {
                        jwtToken = cookie.split(';')[0].substring(4);
                        break;
                    }
                }
                if (jwtToken) {
                    console.log("Token JWT récupéré :", jwtToken);
                    // Vous devrez stocker ce token pour les requêtes suivantes
                } else {
                    console.log("Token JWT non trouvé dans les cookies après l'authentification.");
                }
            } else {
                console.log("Aucun cookie 'set-cookie' trouvé dans la réponse.");
            }

        } else {
            console.error(`La requête d'authentification a échoué avec le statut code : ${response.status}`);
            const text = await response.text();
            console.error("Réponse :", text);
        }
    } catch (error) {
        console.error("Erreur lors de la requête :", error);
    }
}

authenticate();