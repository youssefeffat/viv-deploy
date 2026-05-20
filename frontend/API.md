# API utilisée par le frontend

Cette documentation couvre les endpoints utilisés par le frontend de l'application Viveris Carbone. Les shapes JSON sont adaptées exactement aux clés utilisées côté front (noms de champs et structure identiques à `sessionStorage` / objets manipulés).

Base URL: `https://api.example.com` (remplacez par l'URL réelle)

Auth (recommandé)

## GET /api/quiz/questions

- Méthode: `GET`
- Route: `/api/quiz/questions`
- Description: retourne la liste complète des questions du quiz, dans le même format que la constante `questions` actuellement utilisée côté front.
- Corps de la requête: aucun.
- Headers recommandés: `Accept: application/json`, `Authorization: Bearer <token>` (si nécessaire)

### Réponse (200)
Un tableau d'objets question. Format exact attendu par le front:

```json
[
  {
    "id": 1,
    "category": "Transport",
    "question": "Combien de kilomètres parcourez-vous en voiture par semaine ?",
    "options": [
      { "label": "0-20 km", "value": 10, "co2": 20 },
      { "label": "20-50 km", "value": 35, "co2": 70 }
    ]
  },
  {
    "id": 2,
    "category": "Transport",
    "question": "Combien de vols en avion prenez-vous par an ?",
    "options": [
      { "label": "Aucun", "value": 0, "co2": 0 },
      { "label": "1-2 vols courts courriers", "value": 1, "co2": 400 }
    ]
  }

### Erreurs possibles
- `401 Unauthorized` — token manquant / invalide (si auth requise)
- `500 Internal Server Error`
```bash
curl -X GET "https://api.example.com/api/quiz/questions" \
---

## POST /api/emissions/save

- Méthode: `POST`
- Route: `/api/emissions/save`
- Description: sauvegarde le résultat du quiz et les prédictions (choix de flexibilité) de l'utilisateur. Le frontend envoie les clés `quizResult` et `userPredictions` (notamment l'objet `answers`). IMPORTANT : le serveur doit recalculer de manière autoritaire l'empreinte à partir des `answers` fournies (en utilisant la source canonique des questions/coefs côté serveur) et renvoyer les résultats calculés (`quizResult`, `categoryEmissions`, `targetCO2`). Le champ `quizResult.totalInTons` envoyé par le client ne doit pas être considéré comme source de vérité.
- Headers requis: `Content-Type: application/json`, `Authorization: Bearer <token>` (si lié à un compte utilisateur)

### Corps attendu (JSON) — keys identiques au front

Le frontend utilise les clés suivantes dans `sessionStorage`:

- `quizResult` — objet contenant `totalInTons` et `answers`.
  - `totalInTons`: valeur envoyée par le front (ex: "2.8"), mais le serveur doit recalculer et renvoyer sa propre valeur numérique.
```json
{
    "answers": {
      "1": { "label": "0-20 km", "value": 10, "co2": 20 },
      "2": { "label": "Aucun", "value": 0, "co2": 0 }
    }
> Validation recommandée côté serveur:
- `userPredictions.flexibility` doit contenir entre 1 et 3 éléments (renvoyer `400` si hors limite).
### Comportement serveur (obligatoire)

- Charger la source canonique des questions/coûts côté serveur (coefficients `co2` fiables).
- Sauvegarder l'enregistrement (lier à `user` si connecté) et renvoyer un `emissionId` / `savedAt` pour traçabilité.
### Réponse (200) — confirmation (serveur-calculé)
  "success": true,
  "emissionId": "em_2026_0001",
      "Alimentation": 0.5,
      "Énergie": 0.6,
      "Consommation": 0.2
    }
  },
  "categoryEmissions": {
    "Transport": 1.0,
    "Alimentation": 0.5,
    "Énergie": 0.6,
    "Consommation": 0.2
  },
  "targetCO2": 2.3,
  "savedAt": "2026-05-11T14:12:00Z"
}
```

### Erreurs possibles
```

- `401 Unauthorized` — token manquant / invalide (si auth requise)
- `500 Internal Server Error`

### Exemple (curl)
```bash
curl -X POST "https://api.example.com/api/emissions/save" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
    "userPredictions": {"flexibility":["transport","energy"]}
```

### Recommandations d'implémentation
- Si l'application supporte le mode offline, accepter un `clientId` pour relier les sauvegardes anonymes à un compte ultérieurement.

---

## Notes générales
- Les clés et structures documentées ci‑dessus reprennent exactement les noms utilisés côté frontend (`quizResult`, `totalInTons`, `answers`, `userPredictions`, `flexibility`, ...).
- Si vous voulez que le backend renvoie des identifiants internes (ex: `emissionId`), ajoutez-les dans la réponse (`savedAt`, `emissionId`).

---

---


### GET /api/users/me

- Méthode: `GET`
- Route: `/api/users/me`
- Description: retourne les informations de l'utilisateur connecté (profil) ainsi que ses statistiques : empreinte totale, répartition par catégorie, points, arbres plantés, succès (achievements), séries (streaks). Le front n'envoie rien dans le corps, seulement le jeton dans l'en‑tête.
- Headers: `Authorization: Bearer <token>`, `Accept: application/json`


```json
{
  "user": {
    "id": "user_123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com"
  },
  "quizResult": {
    "totalInTons": "2.8",
    "answers": { /* (optionnel) id -> {label,value,co2} */ },
    "categoryBreakdown": {
      "Transport": 1.8,
      "Alimentation": 1.2,
      "Énergie": 1.5,
      "Consommation": 0.7
    }
  },
  "categoryEmissions": {
    "Transport": 1.8,
    "Alimentation": 1.2,
    "Énergie": 1.5,
    "Consommation": 0.7
  },
  "points": 1240,
  "treesPlanted": 2,
  "achievements": [
    { "id": "first-tree", "name": "Premier arbre", "unlocked": true },
    { "id": "7-days", "name": "7 Jours consécutifs", "unlocked": true }
  ],
  "streak": 12,
  "bestStreak": 18
}
```

Notes d'intégration :
- `categoryEmissions` reprend exactement la clé utilisée par le front (`localStorage.setItem("categoryEmissions", ...)`). Le frontend peut écrire directement ce champ dans le `localStorage` pour garder la compatibilité.
- `quizResult` est fourni en option si vous souhaitez garder l'historique des réponses; `totalInTons` peut être string ou number.

### Erreurs possibles
- `401 Unauthorized` — jeton absent / invalide.
- `500 Internal Server Error`.

### Exemple (curl)
```bash
curl -X GET "https://api.example.com/api/users/me" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
 
---

### GET /api/users/me/friends

- Méthode: `GET`
- Route: `/api/users/me/friends`
- Description: renvoie la liste des amis de l'utilisateur connecté avec les informations nécessaires pour l'affichage du profil/fil d'amis (points, arbres, avatar, etc.). Utile pour afficher la liste d'amis dans le profil ou comparer les scores avec ses contacts.
- Headers recommandés: `Accept: application/json`, `Authorization: Bearer <token>`

Options utiles (query params): `?limit=20&page=1` (pagination), `?search=` (filtrer par nom).

### Réponse (200)
Un tableau d'objets ami. Champs recommandés pour la compatibilité avec le front :

```json
[
  {
    "id": "user_456",
    "name": "Alice Martin",
    "avatar": "AM",
    "points": 1340,
    "trees": 1,
    "percentage": 78,
    "mutualFriends": 3,
    "status": "friend"
  }
]
```

- `id`: identifiant unique de l'utilisateur (string).
- `name`: nom affiché / pseudo (string).
- `avatar`: chaîne courte ou identifiant d'avatar (string).
- `points`: points totaux (number) — utile pour trier/afficher.
- `trees`: arbres "plantés" ou équivalent (number).
- `percentage`: score relatif ou progress pour affichage compact (0–100) (optionnel).
- `mutualFriends`: nombre d'amis en commun (optionnel).
- `status`: état de la relation (par ex. `friend`, `pending`) — utile si la même route expose demandes en attente.

### Erreurs possibles
- `401 Unauthorized` — jeton absent / invalide.
- `500 Internal Server Error`.

### Exemple (curl)
```bash
curl -X GET "https://api.example.com/api/users/me/friends?limit=50" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Notes d'implémentation:
- Supporter pagination pour éviter des réponses trop volumineuses.
- Si l'application gère invitations/requests, renvoyer `status` pour distinguer `friend` / `requested` / `pending`.
- Le backend peut renvoyer un champ `total` (nombre total d'amis) pour la pagination côté front.

---

### POST /api/users/{userId}/friends

- Méthode: `POST`
- Route: `/api/users/{userId}/friends` (ex: `/api/users/user_456/friends`)
- Description: envoie une demande d'ami à l'utilisateur ciblé (`userId`). Selon l'implémentation serveur, si une demande entrante existe déjà (de la part du destinataire), le serveur peut automatiquement accepter la relation et renvoyer l'état `friends`.
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`

### Corps attendu (optionnel)
```json
{ "message": "Salut, ajoutons-nous ?" }
```

### Réponse (200)
```json
{
  "success": true,
  "status": "requested", // ou "friends" si la relation est maintenant active
  "friendId": "user_456",
  "totalFriends": 34
}
```

### Erreurs possibles
- `400 Bad Request` — payload invalide.
- `401 Unauthorized` — jeton absent / invalide.
- `404 Not Found` — utilisateur ciblé introuvable.
- `409 Conflict` — une relation incompatible existe déjà (ex: blocage).

### Exemple (curl)
```bash
curl -X POST "https://api.example.com/api/users/user_456/friends" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "message": "Salut, ajoutons-nous ?" }'
```

Notes d'implémentation:
- Le serveur peut renvoyer `status` = `requested` (demande envoyée) ou `friends` (acceptée).
- Prévoir un système d'idempotence ou vérifier l'existence d'une demande pour éviter doublons.

### POST /api/users/{userId}/friends/accept

- Méthode: `POST`
- Route: `/api/users/{userId}/friends/accept` (ex: `/api/users/user_456/friends/accept`)
- Description: accepte une demande d'ami entrante pour l'utilisateur connecté. Utiliser `userId` pour identifier l'émetteur de la demande ou envoyer `requestId` si vous gérez des objets de demande.
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`

### Corps attendu (optionnel)
```json
{ "requestId": "req_123" }
```

### Réponse (200)
```json
{
  "success": true,
  "status": "friends",
  "friendId": "user_456",
  "totalFriends": 35
}
```

### Erreurs possibles
- `400 Bad Request` — payload invalide.
- `401 Unauthorized` — jeton absent / invalide.
- `404 Not Found` — demande ou utilisateur introuvable.
- `409 Conflict` — relation déjà établie ou bloquée.

### Exemple (curl)
```bash
curl -X POST "https://api.example.com/api/users/user_456/friends/accept" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "requestId": "req_123" }'
```

Notes d'implémentation:
- Après acceptation, renvoyer l'état `friends` et mettre à jour le compteur `totalFriends`.
- Si vous utilisez `requestId`, valider que la demande existe et émane bien du `userId` indiqué.

### POST /api/users/{userId}/friends/decline

- Méthode: `POST`
- Route: `/api/users/{userId}/friends/decline` (ex: `/api/users/user_456/friends/decline`)
- Description: refuse ou décline une demande d'ami reçue. Peut aussi être utilisé pour refuser une invitation envoyée par le client.
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`

### Corps attendu (optionnel)
```json
{ "requestId": "req_123", "reason": "Je ne connais pas cette personne" }
```

### Réponse (200)
```json
{
  "success": true,
  "status": "declined",
  "friendId": "user_456"
}
```

### Erreurs possibles
- `400 Bad Request` — payload invalide.
- `401 Unauthorized` — jeton absent / invalide.
- `404 Not Found` — demande introuvable.

### Exemple (curl)
```bash
curl -X POST "https://api.example.com/api/users/user_456/friends/decline" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "requestId": "req_123", "reason": "Je ne connais pas cette personne" }'
```

Notes:
- Ces endpoints peuvent être utilisés en complément de la route POST `/api/users/{userId}/friends` (envoi de demande) et DELETE `/api/users/{userId}/friends` (annulation/suppression).
- Pour granularité, vous pouvez aussi exposer `/api/friends/requests/{requestId}/accept` et `/decline` si vous préférez manipuler des objets `request`.

### DELETE /api/users/{userId}/friends

- Méthode: `DELETE`
- Route: `/api/users/{userId}/friends` (ex: `/api/users/user_456/friends`)
- Description: supprime la relation d'amitié existante ou annule une demande d'ami précédemment envoyée.
- Headers: `Authorization: Bearer <token>`

### Réponse (200)
```json
{
  "success": true,
  "status": "removed", // ou "request_canceled"
  "friendId": "user_456",
  "totalFriends": 33
}
```

### Erreurs possibles
- `401 Unauthorized` — jeton absent / invalide.
- `404 Not Found` — relation introuvable.
- `500 Internal Server Error`.

### Exemple (curl)
```bash
curl -X DELETE "https://api.example.com/api/users/user_456/friends" \
  -H "Authorization: Bearer $TOKEN"
```

Notes:
- Opération idempotente : supprimer une relation déjà absente doit renvoyer `200`.
- Si vous souhaitez des opérations séparées (accept/refuse), ajoutez des endpoints dédiés `/accept` et `/decline`.

### Gestion du compte (mot de passe / suppression)

#### PUT /api/users/me/password

- Méthode: `PUT`
- Route: `/api/users/me/password`
- Description: permet à l'utilisateur connecté de changer son mot de passe.
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`

### Corps attendu
```json
{ "currentPassword": "oldpass", "newPassword": "N3wP@ssw0rd" }
```

### Réponse (200)
```json
{ "success": true, "message": "Password changed" }
```

### Erreurs possibles
- `400 Bad Request` — validation (ex: nouveau mot de passe trop faible).
- `401 Unauthorized` — jeton absent / invalide.
- `403 Forbidden` — `currentPassword` invalide.

Notes de sécurité:
- Valider la complexité du mot de passe côté serveur.
- Ne jamais renvoyer de détails sur le mot de passe dans les logs.

#### DELETE /api/users/me

- Méthode: `DELETE`
- Route: `/api/users/me`
- Description: supprime le compte de l'utilisateur connecté. Par défaut, faire une suppression "soft" (désactivation). Accepter `?hard=true` pour suppression définitive si nécessaire et autorisé.
- Headers: `Authorization: Bearer <token>`

### Réponse (204)
- réponse sans corps si suppression réussie.

### Erreurs possibles
- `401 Unauthorized` — jeton absent / invalide.
- `403 Forbidden` — suppression interdite (ex: besoin de re-authentication récente).
- `500 Internal Server Error`.

Notes:
- Demander confirmation côté client avant suppression et éventuellement un re-auth (ré-authentification) pour sécurité.

### Statistiques & Succès (achievements)

Le profil (`GET /api/users/me`) expose déjà des champs de base (`points`, `treesPlanted`, `achievements`, `streak`, `bestStreak`). Pour opérations de calcul et mises à jour serveur, exposer les endpoints suivants :

#### GET /api/users/me/stats

- Méthode: `GET`
- Route: `/api/users/me/stats`
- Description: renvoie les statistiques calculées de l'utilisateur : `co2ThisYear`, `co2LastYear`, `co2ReducedThisYear`, `challengesCompleted`, `bestStreak`, `currentStreak`, `badges`.
- Headers: `Authorization: Bearer <token>`

### Réponse (200) exemple
```json
{
  "userId": "user_123",
  "co2ThisYear": 2.3,
  "co2LastYear": 3.1,
  "co2ReducedThisYear": 0.8,
  "challengesCompleted": 12,
  "bestStreak": 18,
  "currentStreak": 12,
  "badges": [ { "id": "first-tree", "name": "Premier arbre", "unlocked": true } ]
}
```

#### POST /api/users/me/stats/recalculate

- Méthode: `POST`
- Route: `/api/users/me/stats/recalculate`
- Description: demande au serveur de recalculer les statistiques de l'utilisateur (CO2 annuel, réduction, streak, badges) à partir des événements et enregistrements existants (emissions, challenges, logins, etc.). Utile après import de données ou correction.
- Headers: `Authorization: Bearer <token>`

### Réponse (200)
```json
{ "success": true, "recalculatedAt": "2026-05-12T10:32:00Z" }
```

#### POST /api/users/me/achievements/{achievementId}/unlock

- Méthode: `POST`
- Route: `/api/users/me/achievements/{achievementId}/unlock`
- Description: déverrouille manuellement un badge/succès pour l'utilisateur (usage admin ou déclenchement serveur après vérification). Le frontend n'a normalement pas besoin d'appeler cela car les achievements sont calculés automatiquement lors d'événements (`challenge.completed`, `emission.saved`).
- Headers: `Authorization: Bearer <token>`

### Corps attendu (optionnel)
```json
{ "source": "challenge", "sourceId": 31 }
```

### Réponse (200)
```json
{ "success": true, "achievement": { "id": "first-tree", "name": "Premier arbre", "unlocked": true }, "totalPoints": 2670 }
```

Notes d'implémentation:
- Préférer calculer achievements côté serveur lors d'événements (ex: `challenge.completed` provoque `points.updated` et possiblement un `achievement` unlock). Utiliser webhooks pour notifier des services externes.
- `bestStreak` et `currentStreak` sont généralement calculés par le serveur à partir des logs d'activité (login/usage quotidien). Fournir `recalculate` pour corriger au besoin.

## 4. Recalculer un domaine précis (PUT)

Le frontend permet à l'utilisateur de recalculer les émissions d'un seul domaine (ex: Transport) en ré-envoyant les réponses liées uniquement à ce domaine.

### PUT /api/emissions/category

- Méthode: `PUT`
- Route: `/api/emissions/category`
- Description: met à jour les émissions pour une catégorie précise en fonction des nouvelles réponses fournies pour cette catégorie. Le backend calcule le nouveau total pour la catégorie et renvoie le total mis à jour (et éventuellement le total global mis à jour).
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>` (recommandé)

### Corps attendu (exemple exact conforme au front)

```json
{
  "category": "Transport",
  "answers": {
    "1": { "label": "0-20 km", "value": 10, "co2": 20 },
    "2": { "label": "Aucun", "value": 0, "co2": 0 }
  }
}
```

Explication: `answers` est le même objet que celui construit côté `Dashboard` avant l'enregistrement ; les clés sont les `id` des questions et les valeurs sont les objets option sélectionnée.

### Réponse (200)

```json
{
  "success": true,
  "category": "Transport",
  "newCategoryTotal": 1.85,
  "categoryEmissions": {
    "Transport": 1.85,
    "Alimentation": 1.2,
    "Énergie": 1.5,
    "Consommation": 0.7
  },
  "updatedTotalInTons": 5.25,
  "savedAt": "2026-05-11T15:00:00Z"
}
```

Notes:
- `newCategoryTotal` est en tonnes (nombre). Le front peut afficher `toFixed(2)`.
- `categoryEmissions` contient la répartition complète mise à jour pour remplacer le `localStorage` existant.

### Erreurs possibles
- `400 Bad Request` — payload invalide (ex: `category` manquant ou `answers` invalide). Exemple:

```json
{ "success": false, "error": "ValidationError", "details": ["answers must include all required question ids for category Transport"] }
```

- `401 Unauthorized` — jeton manquant / invalide.
- `500 Internal Server Error`.

### Exemple (curl)
```bash
curl -X PUT "https://api.example.com/api/emissions/category" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category": "Transport",
    "answers": {"1": {"label":"0-20 km","value":10,"co2":20}}
  }'
```

---

Si vous voulez, je peux générer automatiquement un spec OpenAPI (YAML) basé sur ces shapes ou ajouter des exemples Postman.

---

## 5. Les Défis (Gamification)

Le module Défis gère la sélection dynamique des challenges, la validation (toggle) et la création de défis personnalisés.

### GET /api/challenges/recommendations

- Méthode: `GET`
- Route: `/api/challenges/recommendations`
- Description: renvoie une liste d'environ 6 défis recommandés pour l'utilisateur, personnalisés selon son profil (flexibility / categoryEmissions). Le frontend n'envoie rien dans le corps.
- Headers: `Authorization: Bearer <token>` (recommandé), `Accept: application/json`

### Réponse (200)
Un tableau d'objets défi. Le front attend au minimum ces clés (identique à `data/challenges.json` + `completed`):

```json
[
  {
    "id": 31,
    "title": "Utiliser les transports en commun",
    "points": 20,
    "category": "Transport",
    "completed": false
  },
  {
    "id": 12,
    "title": "Cuisiner une recette végétalienne",
    "points": 40,
    "category": "Alimentation",
    "completed": true
  }
]
```

Notes:
- `completed` indique si l'utilisateur a déjà complété ce défi (utile pour l'UI). Le backend peut calculer ceci depuis l'historique utilisateur.
- Le backend peut inclure un champ optionnel `reason` (ex: "flexibility") pour expliquer la recommandation.

### Erreurs possibles
- `401 Unauthorized`
- `500 Internal Server Error`

### Exemple (curl)
```bash
curl -X GET "https://api.example.com/api/challenges/recommendations" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

### POST /api/challenges/{challengeId}/toggle

- Méthode: `POST`
- Route: `/api/challenges/{id}/toggle` (ex: `/api/challenges/31/toggle`)
- Description: valide ou annule la validation d'un défi pour l'utilisateur. Le front envoie l'état souhaité (`completed`) et le backend renvoie le nouveau solde de points et l'avancement des arbres.
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`

### Corps attendu
```json
{ "completed": true }
```

### Réponse (200)
```json
{
  "success": true,
  "challengeId": 31,
  "completed": true,
  "pointsDelta": 20,
  "totalPoints": 2670,
  "treesPlanted": 2,
  "treeProgress": 67
}
```

Explications:
- `pointsDelta`: +points si `completed=true`, -points si `completed=false`.
- `totalPoints`: nouveau total de points de l'utilisateur.
- `treesPlanted`: nombre d'arbres plantés (par ex: `Math.floor(totalPoints/1000)`).
- `treeProgress`: pourcentage (0–100) vers l'arbre suivant, compatible avec l'affichage côté front.

### Erreurs possibles
- `400 Bad Request` — payload invalide
- `401 Unauthorized`
- `404 Not Found` — défi introuvable
- `500 Internal Server Error`

### Exemple (curl)
```bash
curl -X POST "https://api.example.com/api/challenges/31/toggle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "completed": true }'
```

---

### POST /api/challenges

- Méthode: `POST`
- Route: `/api/challenges`
- Description: crée un nouveau défi personnalisé (ex: via `CreateChallengeModal`). Le frontend envoie `title`, `category` et `points`.
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>` (optionnel si vous autorisez créations anonymes)

### Corps attendu
```json
{
  "title": "Aller au travail à vélo",
  "category": "Transport",
  "points": 40
}
```

### Réponse (201)
```json
{
  "success": true,
  "challenge": {
    "id": 201,
    "title": "Aller au travail à vélo",
    "category": "Transport",
    "points": 40,
    "createdBy": "user_123",
    "createdAt": "2026-05-11T15:30:00Z",
    "completed": false
  }
}
```

### Erreurs possibles
- `400 Bad Request` — données manquantes ou invalides
- `401 Unauthorized` — si création réservée aux utilisateurs
- `500 Internal Server Error`

### Exemple (curl)
```bash
curl -X POST "https://api.example.com/api/challenges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "title": "Aller au travail à vélo", "category": "Transport", "points": 40 }'
```

---

### Notes d'implémentation
- Le backend doit fusionner les recommandations avec l'état `completed` de l'utilisateur (historique stocké côté serveur).
- Valider les `points` côté serveur pour éviter fraude (ex: plage raisonnable 5–500).
- Pour synchronisation hors ligne, prévoir `clientId` ou `idempotencyKey` pour la création/toggle.

---

Si vous le souhaitez, je peux générer un spec OpenAPI (YAML) couvrant ces endpoints, ou créer une collection Postman importable pour tests rapides.

---

## 6. Communauté & Classement

Affiche le classement (podium + liste) des utilisateurs pour la page Communauté.

### GET /api/community/leaderboard

- Méthode: `GET`
- Route: `/api/community/leaderboard`
- Description: renvoie la liste des meilleurs utilisateurs (podium + classement complet). Le frontend n'envoie rien dans le corps — il fournit seulement le jeton si nécessaire.
- Headers: `Accept: application/json`, `Authorization: Bearer <token>` (optionnel selon configuration)

### Réponse (200)
Le backend renvoie un tableau d'objets utilisateur, ordonné par `points` décroissants. Champs utilisés par le front (identiques à ceux consommés dans `CommunityPage`):

```json
[
  { "rank": 1, "name": "Jordan Forest", "avatar": "JF", "points": 3200, "trees": 12, "percentage": 95 },
  { "rank": 2, "name": "Alex Rivers", "avatar": "AR", "points": 2800, "trees": 10, "percentage": 87 }
]
```

- `rank`: position dans le classement (number)
- `name`: pseudo / nom affiché (string)
- `avatar`: chaîne courte ou identifiant d'avatar (string)
- `points`: points totaux (number)
- `trees`: arbres "plantés" ou équivalent (number)
- `percentage`: (optionnel) score relatif pour affichage sur le podium (0–100)

Notes:
- Le backend peut renvoyer seulement les `top 3` puis le reste (comme le frontend le découpe en `topThree` et `restOfLeaderboard`).
- Optionnel: supporter query params comme `?limit=20` ou `?period=monthly` si besoin ultérieur — le front actuel n'envoie rien.

### Erreurs possibles
- `401 Unauthorized` — si accès restreint
- `500 Internal Server Error`

### Exemple (curl)
```bash
curl -X GET "https://api.example.com/api/community/leaderboard" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

Si vous souhaitez, je peux maintenant générer un spec OpenAPI (YAML) couvrant tous les endpoints documentés, ou créer une collection Postman JSON prête à importer.

## Webhooks de notifications

Le backend peut émettre des webhooks HTTP `POST` vers des URLs configurées afin de notifier des services externes (notifications push, analytics, automations) lors d'événements importants (amis, défis, émissions, points, classement, ...).

Principes généraux:
- Les webhooks sont envoyés en `POST` avec un corps JSON et des headers de métadonnées (`X-Event-Type`, `X-Delivery-Id`, `X-Timestamp`, `X-Hub-Signature-256`).
- Le consommateur doit répondre `2xx` pour valider la livraison. En cas d'erreur temporaire (5xx) le serveur émetteur effectue plusieurs retries (voir Politique de retry ci‑dessous).
- Chaque livraison inclut un `deliveryId` unique pour assurer l'idempotence et le suivi.

Événements disponibles (exemples):
- `friend.requested`
- `friend.accepted`
- `friend.declined`
- `friend.removed`
- `emission.saved`
- `challenge.completed`
- `points.updated`
- `leaderboard.updated`

Format de livraison recommandé
- Headers:
  - `Content-Type: application/json`
  - `X-Event-Type: <event>` (ex: `friend.requested`)
  - `X-Delivery-Id: <uuid>`
  - `X-Timestamp: <ISO-8601 timestamp>`
  - `X-Hub-Signature-256: sha256=<hex>` (HMAC-SHA256 du body avec le `secret` webhook)

- Body (JSON):

```json
{
  "event": "friend.requested",
  "data": { /* payload spécifique à l'événement */ },
  "meta": {
    "deliveryId": "dly_2026_0001",
    "webhookId": "wh_001",
    "sentAt": "2026-05-12T10:00:00Z"
  }
}
```

Exemples de payloads

- `friend.requested`:

```json
{
  "event": "friend.requested",
  "data": {
    "requestId": "req_123",
    "fromUser": { "id": "user_123", "name": "Jean Dupont" },
    "toUser": { "id": "user_456", "name": "Alice Martin" },
    "message": "Salut, ajoutons-nous ?",
    "createdAt": "2026-05-12T10:00:00Z"
  },
  "meta": { "deliveryId": "dly_2026_0001", "webhookId": "wh_001" }
}
```

- `emission.saved`:

```json
{
  "event": "emission.saved",
  "data": {
    "emissionId": "em_2026_0001",
    "userId": "user_123",
    "quizResult": {
      "totalInTons": 2.3,
      "categoryBreakdown": { "Transport": 1.0, "Alimentation": 0.5 }
    },
    "savedAt": "2026-05-11T14:12:00Z"
  },
  "meta": { "deliveryId": "dly_2026_0002", "webhookId": "wh_001" }
}
```

Sécurité recommandée
- Utiliser un `secret` par webhook et signer le corps avec HMAC-SHA256. Placer la signature dans `X-Hub-Signature-256: sha256=<hex>`.
- Vérifier également `X-Timestamp` (tolérance par ex. 5 minutes) pour prévenir la relecture (replay attacks).

Gestion des webhooks (API)
- `POST /api/webhooks` — crée un webhook. Corps attendu:

```json
{ "url": "https://example.com/webhook", "events": ["emission.saved","friend.requested"], "secret": "<optional-secret>", "description": "notif prod" }
```

Réponse (201): `{ "id": "wh_001", "url": "...", "events": [...], "createdAt": "..." }`

- `GET /api/webhooks` — liste les webhooks configurés.
- `GET /api/webhooks/{id}` — détail d'un webhook.
- `DELETE /api/webhooks/{id}` — supprime un webhook.

Exemple (curl) — créer un webhook:

```bash
curl -X POST "https://api.example.com/api/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "url": "https://example.com/webhook", "events": ["emission.saved"] }'
```

Delivery, retries et idempotence
- Considérer la livraison comme réussie si le consommateur renvoie `2xx`.
- Politique de retry recommandée: 3 tentatives en cas d'erreur réseau ou `5xx`, avec backoff exponentiel (ex: 1s, 2s, 4s).
- Si le consommateur renvoie `410 Gone`, supprimer le webhook côté serveur.
- Inclure `deliveryId` pour permettre l'idempotence côté consommateur (ne pas traiter deux fois la même `deliveryId`).

Notes d'implémentation
- Conserver un journal des livraisons (`deliveryId`, status, response code, timestamps) pour le debug.
- Exposer un endpoint de test `POST /api/webhooks/{id}/deliver-test` pour permettre aux utilisateurs de valider leur endpoint.
- Documenter clairement la méthode de calcul de la signature et la tolérance temporelle.

