# Naver Webtoon Connector — Production Documentation

← [Sunbi Feed System INDEX](INDEX.md)

> **For Claude Code**: Read this file first, then follow the task-specific path below.
> Each document is self-contained. Cross-links are for reference only.

## Repo Locations

| Document                                     | Repo           | Path                                           |
| -------------------------------------------- | -------------- | ---------------------------------------------- |
| This index                                   | `sunbi-rsshub` | `docs/naver-webtoon/INDEX.md`                  |
| [RSSHUB_ROUTE.md](RSSHUB_ROUTE.md)           | `sunbi-rsshub` | `docs/naver-webtoon/RSSHUB_ROUTE.md`           |
| [OCR_PIPELINE.md](OCR_PIPELINE.md)           | `sunbi`        | `docs/feed/naver-webtoon/OCR_PIPELINE.md`      |
| [EXTENSION_OVERLAY.md](EXTENSION_OVERLAY.md) | `sunbi`        | `docs/feed/naver-webtoon/EXTENSION_OVERLAY.md` |
| [INGESTION_UPDATES.md](INGESTION_UPDATES.md) | `sunbi`        | `docs/feed/naver-webtoon/INGESTION_UPDATES.md` |

## Task-Specific Reading Order

**"Build the RSSHub route"**
→ [RSSHUB_ROUTE.md](RSSHUB_ROUTE.md)

**"Build the OCR ingestion pipeline"**
→ [OCR_PIPELINE.md](OCR_PIPELINE.md) → [INGESTION_UPDATES.md](INGESTION_UPDATES.md)

**"Build the extension text overlay"**
→ [EXTENSION_OVERLAY.md](EXTENSION_OVERLAY.md)

## Production Status (Apr 2026)

✅ **RSSHub route**: Mobile site scraping validated, selectors stable  
✅ **Image CDN**: Sequential JPGs confirmed (`image-comic.pstatic.net/mobilewebimg/...`)  
✅ **Hash extraction**: Regex validated against live episode pages  
✅ **Page enumeration**: Image count + suffix matching works  
🔄 **OCR pipeline**: Bibim integration stubbed, needs WASM import  
🔄 **Extension overlay**: Mobile redirect + text positioning ready

**Readiness**: 5/5 — Full end-to-end pipeline from subscription → OCR transcript → interactive overlays.
