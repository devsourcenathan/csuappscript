
import util from 'util';

// Structure pour les données d'entrée
const sampleData = [
    {
        visitDate: "2025-03-06",
        claimNumber: "119",
        dob: "1962-02-18",
        gender: "F",
        chfId: "OU010413078",
    }
];


async function authenticate() {
  const fetch = (await import("node-fetch")).default;
  const url = "https://csuapps.minsante.cm/api/graphql";

  // En-têtes initiaux avec CSRF et Cookie
  const initialHeaders = {
    "Content-Type": "application/json",
    csrftoken: "X2QIR7fOHouXTD08xauBtr6QPMZBiILI",
    Cookie:
      "csrftoken=X2QIR7fOHouXTD08xauBtr6QPMZBiILI; expires=Tue, 14 Apr 2026 18:35:26 GMT; Max-Age=31449600; Path=/; SameSite=Lax",
  };
  const payload = {
    query:
      "mutation authenticate($username: String!, $password: String!) {\n tokenAuth(username: $username, password: $password) {\n token\n refreshExpiresIn\n }\n}",
    variables: {
      password: "kevine2002",
      username: "ROCHOUME",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: initialHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Échec de l'authentification: ${response.status}`);
  }

  const data = await response.json();
  const cookies = response.headers.raw()["set-cookie"];
  let jwtToken = null;

  if (cookies) {
    for (const cookie of cookies) {
      if (cookie.startsWith("JWT=")) {
        jwtToken = cookie.split(";")[0].substring(4);
        break;
      }
    }
  }

  if (!jwtToken) {
    throw new Error("Token JWT non trouvé dans les cookies");
  }

  return jwtToken;
}

async function makeGraphQLRequest(url, headers, query, variables = {}) {
  const fetch = (await import("node-fetch")).default;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Détails de l'erreur:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la requête:", error);
    throw error;
  }
}

async function searchFamily(headers, chfId) {
  const query = `
    {
        families(members_ChfId_Istartswith: "${chfId}", first: 10, orderBy: ["-id"]) {
            totalCount
            edges {
                node {
                    id
                    headInsuree {
                        id
                        chfId
                        lastName
                        otherNames
                        email
                        dob
                    }
                }
            }
        }
    }`;

  const result = await makeGraphQLRequest(
    "https://csuapps.minsante.cm/api/graphql",
    headers,
    query
  );

  // Vérification exacte du chfId
  if (result.data.families.totalCount > 0) {
    const exactMatch = result.data.families.edges.find(
      (edge) =>
        edge.node.headInsuree.chfId.toLowerCase() === chfId.toLowerCase()
    );

    if (exactMatch) {
      return {
        found: true,
        familyData: exactMatch.node,
      };
    }
  }

  return {
    found: false,
    familyData: null,
  };
}

async function generateRandomEmail() {
  const uuid = crypto.randomUUID().substring(0, 8); // Prendre les 8 premiers caractères de l'UUID
  return `newhivuser_${uuid}@gmail.com`;
}

async function createFamily(headers, familyData) {
  // Générer un email aléatoire
  const randomEmail = await generateRandomEmail();
  const clientMutationId = crypto.randomUUID();

  const createQuery = `
    mutation {
        createFamily(
            input: {
                clientMutationId: "${clientMutationId}"
                clientMutationLabel: "Créer une famille - (${familyData.chfId})"
                headInsuree: {
                    chfId: "${familyData.chfId}"
                    lastName: " "
                    otherNames: " "
                    genderId: "${familyData.gender}"
                    dob: "${familyData.dob}"
                    dead: false
                    head: true
                    email: "${randomEmail}"
                    cardIssued: false
                    status: "AC"
                }
                locationId: ${familyData.locationId}
                poverty: false
                jsonExt: "{}"
            }
        ) {
            clientMutationId
            internalId
        }
    }`;

  console.log("Tentative de création de famille avec les données:", familyData);
  const createResult = await makeGraphQLRequest(
    "https://csuapps.minsante.cm/api/graphql",
    headers,
    createQuery
  );
  console.log("Résultat de la création:", createResult);

  // Vérification des logs de mutation
  const mutationLogs = await checkMutationLogs(headers, clientMutationId);
  console.log("Logs de mutation après création de la famille:", mutationLogs);

  // Attendre et réessayer plusieurs fois
  const maxRetries = 5;
  const delayMs = 2000; // 2 secondes entre chaque tentative

  for (let i = 0; i < maxRetries; i++) {
    console.log(`Tentative ${i + 1}/${maxRetries} de recherche de la famille`);

    // Attendre avant de vérifier
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Utilisation de searchFamily pour récupérer les détails de la famille créée
    const searchResult = await searchFamily(headers, familyData.chfId);
    console.log(`Résultat de la recherche (tentative ${i + 1}):`, searchResult);

    if (searchResult.found) {
      console.log(`Famille trouvée à la tentative ${i + 1}`);
      console.log(
        `Famille créée et vérifiée avec l'ID: ${searchResult.familyData.id}`
      );

      return {
        createResult,
        familyData: searchResult.familyData,
        mutationLogs,
      };
    }

    console.log(
      `Tentative ${
        i + 1
      }/${maxRetries} : Famille non trouvée, nouvelle tentative dans ${delayMs}ms`
    );
  }

  // Si nous arrivons ici, c'est que nous n'avons pas trouvé la famille après toutes les tentatives
  console.error("Détails complets de la dernière tentative:", {
    clientMutationId,
    createResult,
    mutationLogs,
    familyData,
  });

  throw new Error(
    `Impossible de trouver la famille créée avec chfId: ${familyData.chfId} après ${maxRetries} tentatives`
  );
}

async function createPolicy(headers, familyId) {
  const query = `
    mutation {
        createPolicy(
            input: {
                clientMutationId: "${crypto.randomUUID()}"
                clientMutationLabel: "Création de la police - ${new Date().toISOString()}"
                enrollDate: "${new Date().toISOString().split("T")[0]}"
                startDate: "${new Date().toISOString().split("T")[0]}"
                expiryDate: "${
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    .toISOString()
                    .split("T")[0]
                }"
                value: "0.00"
                productId: 72
                familyId: ${familyId}
                officerId: 9140
            }
        ) {
            clientMutationId
            internalId
        }
    }`;

  return await makeGraphQLRequest(
    "https://csuapps.minsante.cm/api/graphql",
    headers,
    query
  );
}

async function validateClaimCode(headers, claimCode) {
  const query = `
    {
        validateClaimCode(claimCode: "${claimCode}")
    }`;

  return await makeGraphQLRequest(
    "https://csuapps.minsante.cm/api/graphql",
    headers,
    query
  );
}

async function generateClaimCode(chfId, claimNumber, headers) {
  // Extraire les 5 premiers caractères du chfId (ex: OU010)
  const prefix = chfId.substring(0, 5);
  const year = new Date().getFullYear();

  // Parcourir les codes de 00 à 99
  for (let i = 0; i < 100; i++) {
    const code = String(i).padStart(2, "0");
    // Format: OU010.2024..00000 (où 000 est le claimNumber)
    const fullClaimCode = `${prefix}.${year}..${code}${claimNumber}`;
    try {
      const validationResult = await validateClaimCode(headers, fullClaimCode);
      if (validationResult.data.validateClaimCode) {
        return fullClaimCode;
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error);
      throw error;
    }
  }
  throw new Error("Aucun code de réclamation valide trouvé entre 00 et 99");
}

async function createClaim(headers, claimData) {
  // Générer et valider le code de réclamation avec les 3 derniers chiffres fournis
  const claimCode = await generateClaimCode(
    claimData.chfId,
    claimData.claimNumber,
    headers
  );

  const query = `
    mutation {
        createClaim(
            input: {
                clientMutationId: "${crypto.randomUUID()}"
                clientMutationLabel: "Créer une prestation"
                code: "${claimCode}"
                insureeId: ${claimData.insureeId}
                adminId: 8891
                dateFrom: "${claimData.visitDate}"
                dateTo: "${claimData.visitDate}"
                icdId: 1930
                jsonExt: "{}"
                feedbackStatus: 1
                reviewStatus: 1
                dateClaimed: "${new Date().toISOString().split("T")[0]}"
                healthFacilityId: 164
                program: 1
                visitType: "O"
                services: [
                    {
                        serviceId: ${claimData.serviceId}
                        priceAsked: "${claimData.priceAsked}"
                        qtyProvided: "1.00"
                        serviceServiceSet: []
                        serviceItemSet: []
                        status: 1
                    }
                ]
            }
        ) {
            clientMutationId
            internalId
        }
    }`;

  return await makeGraphQLRequest(
    "https://csuapps.minsante.cm/api/graphql",
    headers,
    query
  );
}

async function checkMutationLogs(headers, clientMutationId) {
  const query = `
    {
        mutationLogs(clientMutationId: "${clientMutationId}")
        {
            pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor}
            edges {
                node {
                    id,status,error,clientMutationId,clientMutationLabel,clientMutationDetails,requestDateTime,jsonExt,autogeneratedCode
                }
            }
        }
    }`;

  return await makeGraphQLRequest(
    "https://csuapps.minsante.cm/api/graphql",
    headers,
    query
  );
}

async function processRegistration(data, headers) {
  try {
    // Valeurs constantes
    const constantValues = {
      serviceId: 115,
      locationId: 3273,
      priceAsked: "1500.00",
    };

    // Étape 1: Recherche du patient avec correspondance exacte
    const searchResult = await searchFamily(headers, data.chfId);
    let familyId;

    if (!searchResult.found) {
      console.log(
        `Aucune correspondance exacte trouvée pour ${data.chfId}. Création d'une nouvelle famille.`
      );
      const familyResult = await createFamily(headers, {
        ...data,
        locationId: constantValues.locationId,
      });

      // Extraction de l'ID numérique du résultat vérifié
      const base64Id = familyResult.familyData.id;
      familyId = parseInt(atob(base64Id).split(":").pop());

      console.log(`ID numérique de la famille: ${familyId}`);
    } else {
      console.log(`Correspondance exacte trouvée pour ${data.chfId}`);
      const base64Id = searchResult.familyData.id;
      familyId = parseInt(atob(base64Id).split(":").pop());
    }

    // Étape 2: Création de la police
    const policyResult = await createPolicy(headers, familyId);

    // Générer le code de réclamation avant de créer la prestation
    const claimCode = await generateClaimCode(
      data.chfId,
      data.claimNumber,
      headers
    );

    // Étape 3: Création de la prestation
    const claimResult = await createClaim(headers, {
      ...data,
      insureeId: familyId,
      claimCode: claimCode,
      serviceId: constantValues.serviceId,
      priceAsked: constantValues.priceAsked,
    });

    console.log("Enregistrement terminé avec succès");
    return {
      familyId,
      policyId: policyResult.data.createPolicy.internalId,
      claimId: claimResult.data.createClaim.internalId,
      claimCode: claimCode,
    };
  } catch (error) {
    console.error("Erreur lors du traitement:", error);
    throw error;
  }
}

async function processAllRegistrations(dataArray) {
  const results = [];

  try {
    // Authentification une seule fois au début
    const jwtToken = await authenticate();

    // Création des en-têtes avec tous les éléments nécessaires
    const headers = {
      "Content-Type": "application/json",
      Authorization: `JWT ${jwtToken}`,
      "X-CSRFToken": "X2QIR7fOHouXTD08xauBtr6QPMZBiILI",
      Cookie: "csrftoken=X2QIR7fOHouXTD08xauBtr6QPMZBiILI; JWT=" + jwtToken,
    };

    for (const data of dataArray) {
      try {
        const result = await processRegistration(data, headers); // Passage des headers
        results.push({
          chfId: data.chfId,
          claimCode: result.claimCode,
          success: true,
          familyId: result.familyId,
          policyId: result.policyId,
          claimId: result.claimId,
        });
        console.log(
          `Traitement réussi pour ${data.chfId} avec le code de réclamation ${result.claimCode}`
        );
      } catch (error) {
        results.push({
          chfId: data.chfId,
          success: false,
          error: error.message,
        });
        console.error(`Échec du traitement pour ${data.chfId}:`, error);
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    throw error;
  }

  return results;
}

// Lancement du traitement
processAllRegistrations(sampleData).then((results) => {
  console.log("Résultats complets:", results);
});

