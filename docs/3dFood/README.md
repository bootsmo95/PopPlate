# 3dFood

3dFood er en restaurant-SaaS hvor restauranten uploader billeder af en ret, systemet genererer en 3D-model, og gæsten scanner en QR-kode for at se retten i AR eller 3D på mobilen.

## Nyt produktflow
### Admin / restaurant
1. Får konto og rolle som paying user/admin
2. Logger ind i kundeportal
3. Opretter ny ret
4. Uploader billeder af retten
5. Giver retten navn + metadata
6. Sender til generering
7. Ser status: queued / processing / failed / ready
8. Previewer resultatet
9. Retry'er hvis kvaliteten er dårlig
10. Publicerer retten og henter QR-kode

### Gæst / restaurantbesøgende
1. Scanner QR-kode
2. Åbner public dish page
3. Giver kamera-tilladelse hvis AR er understøttet
4. Ser retten placeret på bordet i AR eller som fallback i 3D viewer

## Teknisk retning
- Frontend/app: Nuxt 4
- Hosting/deploy: Coolify
- Database: PostgreSQL på Coolify
- Auth: Authentik på Coolify eller app-local auth hvis vi vil starte enklere
- Storage: S3-kompatibel storage på Coolify (primært MinIO hvis tilgængelig)
- Queue/background jobs: app-worker på Coolify + Redis hvis nødvendigt
- 3D/AR viewer: PlayCanvas + device-specific AR fallback

## Vigtige docs
### Produkt / MVP
- `MVP_SPEC.md`
- `MCP_HANDOFF.md`
- `DECISIONS.md`
- `ASSET_SPEC.md`
- `ANALYTICS_SPEC.md`

### Arkitektur
- `ARCHITECTURE.md`
- `DATA_MODEL.md`
- `COOLIFY_STACK.md`

### Agent-eksekvering
- `AGENT_SWARM_BOARD.md`

## Hvis du starter en agent swarm
Læs i denne rækkefølge:
1. `MCP_HANDOFF.md`
2. `MVP_SPEC.md`
3. `DECISIONS.md`
4. `ARCHITECTURE.md`
5. `DATA_MODEL.md`
6. `COOLIFY_STACK.md`
7. `ASSET_SPEC.md`
8. `ANALYTICS_SPEC.md`
9. `AGENT_SWARM_BOARD.md`

## Fokus
MVP'et skal bevise to ting:
1. At restauranter forstår og kan bruge upload -> generering -> preview -> QR flowet
2. At gæster faktisk gider scanne og se retter i AR/3D

Det skal **ikke** bevise perfekt automatisk 3D-generering i version 1.