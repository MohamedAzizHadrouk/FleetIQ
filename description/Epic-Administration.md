# Epic — Administration (FrontOffice)

**Produit** : FleetIQ  
**Version document** : 1.1  
**Date** : 10 septembre 2026  
**Objectif** : Parité exacte des 4 écrans Administration Webtrace FrontOffice dans la maquette React FleetIQ.

> Source : Webtrace `/gestion/accounts`, `/gestion/departments`, `/gestion/alerts/settings`, `/gestion/alerts/mail-sms`.  
> Cible : `src/features/admin` (+ `alert-config`, `alert-mail-sms`).  
> Centre d'alertes / Historique (design Webtrace) : voir **[Epic-Alert-Center-UI.md](Epic-Alert-Center-UI.md)**.

---

## 1. Vue d'ensemble

| Écran | `activeSection` | Feature folder |
|-------|-----------------|----------------|
| Gestion des Comptes | `administration` | `components/accounts` |
| Gestion des Départements | `departments` | `components/departments` |
| Paramétrage des alertes | `alert_configuration` | `alert-config` |
| Envoi Mail/SMS | `notifications` | `alert-mail-sms` |

Navigation : menu engrenage TopBar (4 items toujours visibles en maquette).

---

## 2. Architecture

```
src/features/admin/
  api/admin-api.ts
  mocks/
  hooks/useAdminQueries.ts
  types/
  components/shared|accounts|departments/
  alert-config/          # Webtrace equipment model (7 sections)
  alert-mail-sms/
  index.ts
```

Données : mocks in-memory + React Query. IDs véhicules/départements alignés avec alert-center org structure.

**Note** : l’ancien paramétrage multi-scope taxonomie (`features/alert-center/components/config/*`) n’est **plus monté** sur `AlertConfigurationPage` ; écran remplacé par le modèle Webtrace véhicule + sections.

---

## 3. Features

### Feature 1 — Gestion des comptes

- KPI Total / Actifs ce mois / Nouveaux (30j)
- Search + multi-select départements ; **pageSize défaut 5**
- Stepper 4 étapes : cercles numérotés ; login requis ; prénom/nom optionnels ; MDP min **8** ; pages optionnelles
- Labels submit : « Créer le compte » / « Modifier »
- Password modal carte amber, min 8
- Scope specialty : cellule primary = « Spécialité »

### Feature 2 — Gestion des départements

- KPI Total / Racines / Branches ; **pageSize 5**
- Formulaire : blocs gradient infos + véhicules ; radios **Racine / Branche** (pas Simple/Groupe)
- Parent = tous départements sauf soi ; multi-select véhicules partagé

### Feature 3 — Paramétrage des alertes

- Sidebar **Liste des vehicules** (arbre dept → cars), single-select
- Empty : « Selectionnez un vehicule »
- Header : `Parametrage des alertes` + `{car} — {dept}`
- Sections : General, Temperature, Carburant, Vitesse, Stop, Conduite, Georeperage
- Save/reset **par section** (« Envoyer les parametres » / « Parametres par defaut »)
- Geo : tabs Trajectoires / Polygones / Lieux + cartes config

### Feature 4 — Envoi des alertes par Mail/SMS

- Header + subtitle + CTA
- Search card séparée ; tabs sans badges count
- Form contact + Nom uniquement ; confirm delete
- Configure modal `max-w-5xl` : multi-select véhicules ; table Type | Heure début | Heure fin + toggle ; Annuler / Enregistrer

---

## 4. Critères d’acceptation (maquette)

- [ ] Les 4 écrans accessibles depuis le menu Administration
- [ ] Paramétrage = modèle véhicule Webtrace (pas multi-scope)
- [ ] Comptes / Départements / Mail-SMS alignés labels, pagination 5, modales
- [ ] Loading / empty / error visibles

---

## 5. Gaps

| # | Gap | Priorité |
|---|-----|----------|
| A1 | Stores admin vs alert-center org non synchronisés live | Moyenne |
| A2 | Pas de page-access gating TopBar | Haute (prod) |
| A3 | APIs Administration réelles | Haute (prod) |
| A4 | Config Mail/SMS alert rows non persistées (véhicules seulement) | Moyenne |

---

## 6. Références Webtrace

| Route Webtrace | FleetIQ |
|----------------|---------|
| `/gestion/accounts` | `administration` |
| `/gestion/departments` | `departments` |
| `/gestion/alerts/settings` | `alert_configuration` |
| `/gestion/alerts/mail-sms` | `notifications` |
