# Projectinstructies voor Codex

Bouw deze applicatie als een overzichtelijke React + Firebase webapp voor een huishoudboekje. De applicatie moet onderhoudbaar, goed gestructureerd en makkelijk uit te leggen zijn.

Belangrijke regels:
- Gebruik React met functionele componenten.
- Gebruik Firebase voor authenticatie en Firestore voor data-opslag.
- Houd componenten klein en geef ieder bestand één duidelijke verantwoordelijkheid.
- Maak geen grote bestanden of grote componenten. Splits code op als een bestand te lang of onduidelijk wordt.
- Gebruik separation of concern:
  - `components/` voor herbruikbare UI-onderdelen.
  - `pages/` voor pagina’s.
  - `services/` voor Firebase- en databasefuncties.
  - `hooks/` voor gedeelde React-logica.
  - `utils/` voor kleine hulpfuncties.
- Zet Firebase-code niet direct in componenten, maar gebruik service-bestanden.
- Gebruik duidelijke namen voor functies, componenten en variabelen.
- Refactor dubbele code naar herbruikbare functies of componenten.
- Gebruik waar passend design patterns, zoals:
  - Service pattern voor Firebase-acties.
  - Repository-achtige structuur voor databasefuncties.
  - Custom hooks voor gedeelde state en logica.
  - Container/presentational component pattern als pagina’s te groot worden.
- Schrijf code die makkelijk getest kan worden.
- Voeg alleen code toe die nodig is voor de opdracht.
- Zorg dat de code begrijpelijk is voor studenten en goed uitgelegd kan worden tijdens de presentatie.

Doel: een nette, onderhoudbare en overzichtelijke applicatie maken die voldoet aan de eisen van de ADWEB-eindopdracht.