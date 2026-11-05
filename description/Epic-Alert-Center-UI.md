# Epic — Centre d'alertes (UI Webtrace)

**Produit** : FleetIQ  
**Version document** : 1.1  
**Date** : 10 septembre 2026  
**Objectif** : Documenter la parité visuelle et catalogue du Centre d'alertes / Historique avec Webtrace FrontOffice.

> Depuis sept. 2026, la maquette FleetIQ reprend le **layout colonne unique Webtrace** (fond `#f4f6f8`, KPI horizontaux, cartes type horizontales, drawer config bleu, modal détails bleu). Le panneau inspecteur véhicule n'est plus monté sur cet écran.

---

## Catalogue alertes (parité Webtrace)

Référence Webtrace : `WebtraceFrontendV3/.../alert-catalog.config.ts` (**81 types / 5 groupes**).

| Groupe centre | Contenu FleetIQ | Notes |
|---------------|-----------------|-------|
| Tableau de bord | ~37 indicateurs `DASHBOARD_INDICATORS` (+ extras FleetIQ) | Aligné board-table Webtrace |
| Gestion de parc | Modules documents / missions-coupons / maintenance-pièces / location / sinistres | Extras docs/leasing FleetIQ conservés |
| Geofencing | Types `geolocation` taxonomie (incl. présence/absence zone) | Extras FleetIQ (ville, horaires…) conservés |
| Sécurité | `getSecurityOnlyAlertTypes()` : protection, arming, réservoirs, stops, temp, contact/porte, SOS | Aligné catalogue sécurité Webtrace |
| Qualité conduite | Types `driving_quality` (incl. limite route TN + conso carburant) | Extras comportement FleetIQ (harsh_*) conservés |

Sources : `types/alerts.ts`, `alert-taxonomy.ts`, pools section (`dashboard-indicators`, `fleet-parc-alert-modules`, `security-alert-types`, filtre catégorie).

**Règle** : on **ajoute** pour parité catalogue ; on ne retire pas les extras FleetIQ.

---

## Écrans

| Écran | `activeSection` | Design |
|-------|-----------------|--------|
| Centre d'alertes | `alertes` | Webtrace exact |
| Historique | `alert_history` | Webtrace chrome |
| Paramétrage | `alert_configuration` | Webtrace (admin equipment) — voir [Epic-Administration](Epic-Administration.md) |

## Structure UI Centre d'alertes

- Shell scroll `#f4f6f8`, titre 1.75rem, bouton Historique pill
- 3 KPI horizontaux (concernés / SOS / hors ligne)
- Sections accordéon + grille `minmax(15.5rem)` cartes horizontales (counts 0 inclus)
- Config : overlay drawer header `#3b82f6`
- Détails : modal header bleu, matricule lien, « Voir sur carte »

## Fichiers clés

- `src/features/alert-center/components/layout/AlertCenterPage.tsx`
- `.../dashboard/AlertCenterStatsPanel.tsx`, `AlertSectionPanel.tsx`, `AlertTypeIndicatorTile.tsx`
- `.../dashboard/SectionDisplayConfigSheet.tsx`, `SectionAlertVehiclesDialog.tsx`
- `src/pages/AlertHistoryPage.tsx` + `history/*`
- Taxonomie / pools : `constants/alert-taxonomy.ts`, `design-system/dashboard-indicators.ts`

## Hors scope UI

- Panneau latéral véhicule (`ContextualRightPanel`) — conservé dans le repo, non monté
- Paramétrage equipment admin — hors de cette epic catalogue
