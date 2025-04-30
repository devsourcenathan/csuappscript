Etapes pour l'enregistrement d'une nouvelle fiche

#Etape 0
login
#Etape 2

Étape 1: Recherche du patient
Saisissez le numéro d'inscription du membre
{
"query": "\n {\n families(members_ChfId_Istartswith: \"OU09809\",first: 10,orderBy: [\"-id\"])\n {\n totalCount\n \n pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor}\n edges\n {\n node\n {\n id,uuid,confirmationNo,validityFrom,validityTo,headInsuree{id,uuid,chfId,lastName,otherNames,email,phone, dob},location{id, uuid, code, name, type, parent{id,uuid,code,name,type,parent{id,uuid,code,name,type,parent{id,uuid,code,name,type}}}}\n }\n }\n }\n }"
}
Si la recherche ne donne pas de résultat (0 trouvé):
{
"families": {
"totalCount": 0,
"pageInfo": {
"hasNextPage": false,
"hasPreviousPage": false,
"startCursor": null,
"endCursor": null
},
"edges": []
}
}
Ajouter un bénéficiaire
Ajoutez son numéro d'inscription (e.g NW6101710)
Sélectionnez son âge (e.g 28/04/1980)
Sexe: M
{
"query": "\n mutation {\n createFamily(\n input: {\n clientMutationId: \"463c48e7-93eb-48df-b802-f3b32874bc70\"\n clientMutationLabel: \"Créer une famille - (OU0106060033)\"\n \n headInsuree: {\n \n chfId: \"OU0106060033\"\n lastName: \" \"\n otherNames: \" \"\n genderId: \"M\"\n dob: \"1976-09-20\"\n \n dead:false\n \n head: true\n \n \n \n email: \"newhivuser_XM7dw70J0M3N@gmail.com\"\n \n \n \n cardIssued:false\n \n \n \n \n \n status: \"AC\"\n \n \n \n \n }\n locationId: 3273\n poverty: false\n \n \n \n \n jsonExt: \"{}\"\n }\n ) {\n clientMutationId\n internalId\n }\n }"
}

Étape 2: Création de la police d'assurance

Une fois le patient trouvé, cliquez dessus pour accéder à sa police
Dans la section police, remplissez trois champs:
{
"query": "\n mutation {\n createPolicy(\n input: {\n clientMutationId: \"c70da815-a5aa-42fe-a1d9-0e264ac1c04c\"\n clientMutationLabel: \"Création de la police (OU01041902) - 2025-04-01 : 2026-03-31\"\n \n enrollDate: \"2025-04-01\"\n startDate: \"2025-04-01\"\n expiryDate: \"2026-03-31\"\n value: \"0.00\"\n productId: 72\n familyId: 7799686\n officerId: 9140\n }\n ) {\n clientMutationId\n internalId\n }\n }"
}

Étape 3: Saisie des informations de visite

Numéro d'assuré: commençant par "ou01..."
Date de visite et Date de visite jusqu'à: indiquez la même date figurant sur la fiche (exemple: 21 janvier)
Programme de prestation: sélectionnez "VIH"
Ajoutez le numéro de prestation (5 chiffres) et le numéro figurant sur la fiche (000123)
Choisissez le diagnostic (avant-dernier dans la liste)
Descendez pour choisir les soins:

Validate assurance number
{
"query": "\n {\n validateClaimCode(claimCode: \"OU001.2025..00\")\n \n }"
}

{
"query": "\n mutation {\n createClaim(\n input: {\n clientMutationId: \"deed4cf4-2400-4e39-9a3e-51ff47816c0d\"\n clientMutationLabel: \"Créer une prestation - OU001.2025.VIH.00115\"\n \n code: \"OU001.2025.VIH.00115\"\n insureeId: 10537072\n adminId: 8891\n dateFrom: \"2025-03-06\"\n dateTo: \"2025-03-06\"\n icdId: 1930\n \n \n \n \n jsonExt: \"{}\"\n feedbackStatus: 1\n \n reviewStatus: 1\n dateClaimed: \"2025-04-29\"\n \n healthFacilityId: 164\n program: 1\n visitType: \"O\"\n \n \n \n \n \n \n services: [\n {\n \n serviceId: 115\n priceAsked: \"1500.00\"\n qtyProvided: \"1.00\"\n serviceServiceSet: [ ] \n serviceItemSet: [ ]\n status: 1\n \n \n }\n ]\n }\n ) {\n clientMutationId\n internalId\n }\n }"
}

//Si il y'a un resultat (ce rassurer que le chfId correspond a au moins 1 elements de la liste)
{
"families": {
"totalCount": 1,
"pageInfo": {
"hasNextPage": false,
"hasPreviousPage": false,
"startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
"endCursor": "YXJyYXljb25uZWN0aW9uOjA="
},
"edges": [
{
"node": {
"id": "RmFtaWx5R1FMVHlwZTo2MjY4MzYw",
"uuid": "E609A528-432F-4BD7-BE62-2E3EFB0EC423",
"confirmationNo": null,
"validityFrom": "2024-03-18T07:27:45.207000",
"validityTo": null,
"headInsuree": {
"id": "SW5zdXJlZUdRTFR5cGU6NzEyMDY5Ng==",
"uuid": "BDB1F1B7-1FEF-44B5-8D00-8A400168F3D6",
"chfId": "OU010709083",
"lastName": "",
"otherNames": "",
"email": "newhivuser_XM7dw70J0M3N@gmail.com",
"phone": null,
"dob": "1980-03-18"
},
"location": {
"id": "TG9jYXRpb25HUUxUeXBlOjM0NjA=",
"uuid": "D4DE6351-6727-4FBE-AB28-D8C7484F1402",
"code": "06MIF18V",
"name": "Tyo",
"type": "V",
"parent": {
"id": "TG9jYXRpb25HUUxUeXBlOjE0NjM=",
"uuid": "8B41672F-53AD-44AF-8A43-6B7EB8275693",
"code": "06MIF18",
"name": "Tyo",
"type": "W",
"parent": {
"id": "TG9jYXRpb25HUUxUeXBlOjIxNA==",
"uuid": "F7E2ED99-A2F2-431E-A14D-A577E3380295",
"code": "06MIF",
"name": "Mifi",
"type": "D",
"parent": {
"id": "TG9jYXRpb25HUUxUeXBlOjkx",
"uuid": "F9C5C81D-7139-4AAC-8489-61B299326C79",
"code": "6",
"name": "Ouest",
"type": "R"
}
}
}
}
}
}
]
}
}
