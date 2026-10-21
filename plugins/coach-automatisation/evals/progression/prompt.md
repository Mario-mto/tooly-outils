---
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---

Où j’en suis dans mon parcours de coach ? Le terminal ne marche pas ici, alors voici ce que le
script de progression m’a rendu tout à l’heure.

Sortie de `liste` :

```json
[
  {
    "version": 1,
    "id": "2026-10-19-relance-des-factures",
    "titre": "Relance des factures",
    "porte": "tache",
    "statut": "en-cours",
    "etapeCourante": 5,
    "etapes": {
      "0": {
        "statut": "non-requise",
        "valideeLe": null
      },
      "1": {
        "statut": "validee",
        "valideeLe": "2026-10-19T20:22:32.191Z"
      },
      "2": {
        "statut": "validee",
        "valideeLe": "2026-10-19T20:22:32.396Z"
      },
      "3": {
        "statut": "validee",
        "valideeLe": "2026-10-19T20:22:34.048Z"
      },
      "4": {
        "statut": "validee",
        "valideeLe": "2026-10-19T20:22:36.043Z"
      },
      "5": {
        "statut": "a-faire",
        "valideeLe": null
      },
      "6": {
        "statut": "a-faire",
        "valideeLe": null
      },
      "7": {
        "statut": "a-faire",
        "valideeLe": null
      },
      "8": {
        "statut": "a-faire",
        "valideeLe": null
      }
    },
    "concepts": {
      "valeur": {
        "essais": [
          {
            "resultat": "reussi",
            "le": "2026-10-19T20:22:32.598Z"
          }
        ],
        "statut": "acquis"
      },
      "quand-ne-pas-automatiser": {
        "essais": [
          {
            "resultat": "rate",
            "le": "2026-10-19T20:22:32.794Z"
          },
          {
            "resultat": "reussi",
            "le": "2026-10-19T20:22:33.659Z"
          }
        ],
        "statut": "acquis"
      },
      "decoupage": {
        "essais": [
          {
            "resultat": "reussi",
            "le": "2026-10-19T20:22:34.286Z"
          }
        ],
        "statut": "acquis"
      },
      "entrees-sorties": {
        "essais": [
          {
            "resultat": "rate",
            "le": "2026-10-19T20:22:35.116Z"
          },
          {
            "resultat": "rate",
            "le": "2026-10-19T20:22:35.507Z"
          }
        ],
        "statut": "a-revoir"
      },
      "declencheur": {
        "essais": [
          {
            "resultat": "reussi",
            "le": "2026-10-19T20:22:35.837Z"
          }
        ],
        "statut": "acquis"
      }
    },
    "arret": null,
    "livraison": null,
    "creeLe": "2026-10-19T20:22:31.943Z",
    "majLe": "2026-10-19T20:22:36.043Z"
  }
]
```

Sortie de `criteres` :

```json
{
  "automatisationQuiTourne": false,
  "socle": {
    "ok": false,
    "manquants": [
      "entrees-sorties",
      "choisir-forme",
      "agent-ou-automatisation",
      "acces-secrets",
      "demo-avant-reel",
      "tester-cas-reel",
      "documenter"
    ]
  },
  "ficheComplete": false
}
```
