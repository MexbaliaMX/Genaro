# Integration Layer (agnóstica) - IMPLEMENTED

## Implementation Status
- ✅ Contract-first API design (OpenAPI/AsyncAPI) - Complete
- ✅ Event bus architecture with canonical topics - Complete
- ✅ DFT Canonical Model definitions - Complete
- ✅ SDK for connectors - Complete
- ✅ Ingest gateway implementation - Complete
- ✅ API contracts defined - Complete
- ✅ Core connector implementations - Complete
- ✅ Data pipeline with transformation and enrichment - Complete
- ✅ Canonical model validation and processing - Complete

## 1) Principles

* **Contract-first**: OpenAPI (sync) + AsyncAPI (eventos).
* **Desacople duro**: publish/subscribe; nada de dependencias directas a APIs externas.
* **Canónica única**: *DFT Canonical Model* para normalizar todas las fuentes.
* **Pluggable**: conectores como plugins (SDK).
* **Observabilidad y gobernanza** por defecto (trazas, métricas, catálogo, data lineage).
* **Portabilidad**: contenedores + IaC; cero servicios “pegajosos”.
* **Responsive design**: interfaces completamente adaptables que funcionan en todos los tamaños de pantalla sin necesidad de toggle manual.

---

## 2) Capas y componentes

### A. **Ingest Gateways** (perímetro)

* **API Gateway** (REST/GraphQL/gRPC) para *pull APIs*.
* **Webhooks Hub** para *push* (TikTok/X/Instagram/YouTube, RSS, medios).
* **Streaming Ingest**: WebSocket/SSE; cola de *firehose*.
* **Rate-limit & retry**: backoff exponencial, circuit breaker.
* **Auth externa**: OAuth2/OIDC/keys por conector (no se filtran tierra adentro).

### B. **Connectors/Adapters** (plugins)

* Workers independientes (contenedorizados) que hablan con cada fuente.
* **SDK de Conectores** (ver §7): estándar de logs, reintentos, mapping → canónico.
* Tipos:

  * **Public APIs** (X/TikTok/Instagram/YouTube/Reddit/News)
  * **Advertising Platforms** (Meta Ads, Google Ads)
  * **Enterprise** (SAP B1/SAP BTP/S4, Shopify, GSheets, CRM/Helpdesk)
  * **Files/Feeds** (S3/OSS/GCS, FTP, RSS)
* **CDC** (opcional): Debezium-like para bases transaccionales.

### C. **Event Bus** (núcleo asíncrono)

* Cola/stream (Kafka/Pulsar/Rabbit/OSS MQ).
* Tópicos canónicos (ej.):

  * `raw.content.ingested`
  * `raw.ad_spend.ingested`
  * `canon.content.normalized`
  * `signal.sentiment.scored`
  * `risk.narrative.detected`
  * `alert.threshold.breached`
* **Schema Registry** (Avro/JSON Schema/Protobuf).

### D. **Normalization & Enrichment**

* **Normalizers**: mapean *raw → canónico*.
* **Enrichers**: STT (voz→texto), OCR, EXIF/geo, NER, de-dup, lang-id.
* **PII Guard**: detección/mascarado; *ethical layer*.
* **Canonical Model Service**: Transforma datos de diversas fuentes al modelo canónico DFT
* **Data Pipeline Service**: Gestiona la conexión, extracción y procesamiento de datos de múltiples fuentes

### E. **Processing/Features**

* **Feature Store** (online/offline) para señales (sentiment, toxicity, stance, velocity).
* **Jobs** batch/stream (Flink/Spark/dbt/sqlmesh) para KPIs y agregados.
* **Rules Engine** (Drools/OPA/DIY) para umbrales/alertas.

### F. **Serving & Integration Out**

* **Query API** (REST/GraphQL) sobre almacenes:

  * *Hot*: search vectorial/time-series (OpenSearch/ClickHouse/TSDB).
  * *Warm*: lakehouse (Parquet/Iceberg/Delta).
  * *Cache*: KV/Redis.
* **Outgoing Webhooks** a Slack/Teams/Email/SMS/ServiceNow/Jira/SAP.
* **SAC/BI connectors** (SAP Analytics Cloud, Power BI, etc.).

### G. **Governance & SecOps**

* **API Contracts** (OpenAPI/AsyncAPI) versionados (semver).
* **Catálogo/linaje** (DataHub/Amundsen).
* **IAM**: RBAC/ABAC; secretos en Vault/KMS.
* **Compliance**: consentimiento de fuente, retención, borrado.

---

## 3) *DFT Canonical Model* (resumen)

Entidades nucleares para no casarte con ninguna fuente:

* **Actor**: `{id, handle, platform, verified?, org?, geo?}`
* **Artifact** (unidad de contenido): `{id, type[text|image|video|audio], text?, media_urls[], lang, created_at, source_ref}`
* **Channel**: `{platform, topic/hashtag, community_id?}`
* **Narrative**: `{id, title, seed_queries[], entities[], stance?}`
* **Mention** (vínculo Artifact↔Narrative): `{id, narrative_id, artifact_id, score}`
* **Signal**: `{artifact_id, sentiment, toxicity, emotion[], stance, quality, confidence}`
* **Metric**: KPIs agregados por ventana `{narrative_id|brand_id, window, kpi, value}`

> **Ventajas**: 1) queries uniformes, 2) entrenas modelos una sola vez, 3) reduces acoplamiento del dashboard y de los conectores.

---

## 4) Contratos de eventos (AsyncAPI – esquemas mínimos)

### `raw.content.ingested`

```json
{
  "source": "tiktok",
  "external_id": "xyz",
  "fetched_at": "2025-11-03T21:15:00Z",
  "payload": { "...raw from API..." }
}
```

### `canon.content.normalized`

```json
{
  "artifact": {
    "id": "art_...",
    "type": "video",
    "text": "transcript or caption...",
    "media": [{"url":"...","kind":"video"}],
    "lang": "es",
    "created_at": "2025-11-03T20:59:00Z",
    "actor_id": "act_..."
  },
  "channel": {"platform":"tiktok","topic":"#MiMarca"}
}
```

### `signal.sentiment.scored`

```json
{
  "artifact_id": "art_...",
  "signals": {
    "sentiment": {"value": 0.71, "model":"dft-sent-es-v2", "confidence":0.86},
    "toxicity": {"value": 0.08}
  }
}
```

### `risk.narrative.detected`

```json
{
  "narrative_id":"nar_...",
  "evidence":[{"artifact_id":"art_1","score":0.82}],
  "risk_level":"high",
  "explanation":"spike negative on supply delays"
}
```

---

## 5) APIs síncronas (OpenAPI – bocetos)

* `POST /ingest/webhook/{source}` → valida firma, publica a `raw.content.ingested`.
* `GET /narratives/{id}/metrics?window=7d`
* `GET /search?query=“<brand> AND recall”&since=...`
* `POST /alerts/test` (para probar reglas).
* `POST /exports/sac` (job asíncrono → escupe URL firmado).

---

## 6) Almacenamiento (agnóstico)

* **Lake/Lakehouse**: Parquet + Iceberg/Delta (OSS S3 / Alibaba OSS / GCS).
* **Search**: OpenSearch/Elasticsearch (texto + filtros).
* **Vector**: pgvector/Elasticsearch kNN/FAISS (si RAG).
* **Time-series/KPIs**: ClickHouse/Timescale/Influx.
* **Feature Store**: Feast (opcional).

---

## 7) **SDK de Conectores** (para terceros/rápida extensión)

**Objetivo:** que cualquier equipo agregue una fuente en días, sin tocar el core.

* **Plantilla** (CLI) que genera: `fetcher.py`, `mapper.py`, `secrets.yaml`, `tests/`.
* **Interfaces**:

  * `poll()` / `subscribe()` → entrega *raw batches*.
  * `map_to_canonical(raw) -> Artifact, Actor, Channel`.
  * `checkpoint(commit)` para idempotencia.
* **Extras**: throttle, firma de webhooks, validación de esquemas, *playground* local con datos sintéticos.

---

## 8) Observabilidad y SRE

* **Tracing**: OpenTelemetry (propaga trace-id por eventos).
* **Dashboards**: ingesta por fuente, latencias, lag, error budgets.
* **Dead-letter queues** con reproceso.
* **Chaos/DR**: inyectar fallos, probar *region failover*.

---

## 9) Seguridad y ética (resumen operativo)

* **Consent & Robots.txt**: sólo APIs/feeds permitidos y términos cumplidos.
* **PII**: máscara/seudonimiza antes de persistir (campo `pii_masked=true`).
* **Retention**: políticas por fuente (p.ej., 90d raw, 365d canónico, 730d métricas).
* **Explainability**: cada señal guarda `model`, `version`, `confidence`.

---

## 10. Data Sovereignty

The architecture is designed to support data sovereignty requirements, which are critical for public sector and multinational clients. This is achieved through:

*   **Geo-partitioning of Event Bus:** The event bus (e.g., Kafka) can be configured with topic partitions that are physically located in specific geographic regions.
*   **Region-aware Connectors and Processors:** Connectors and data processing services can be deployed to specific regions and configured to only process data from those regions.
*   **Policy-based Routing:** The Ingest Gateways can route data to specific regional event bus clusters based on the source of the data or other policy criteria.
*   **Infrastructure as Code (IaC):** The entire infrastructure can be deployed to a client's on-premises data center or a sovereign cloud environment using IaC scripts (e.g., Terraform, Ansible).

---

## 11) Flujo de extremo a extremo (secuencia)

1. Conector TikTok recibe webhook → `raw.content.ingested`.
2. Normalizer mapea → `canon.content.normalized`.
3. Enricher ejecuta STT/OCR/NER → añade metadatos.
4. Scoring publica `signal.sentiment.scored`.
5. Detector de narrativas agrupa y lanza `risk.narrative.detected`.
6. Rules Engine activa `alert.threshold.breached` → webhook a Slack/SAC.
7. Dashboard consulta KPIs/artefactos via GraphQL.

---

## 12. Genaro Agent Integration

The Genaro agent is a primary consumer of the data flowing through the integration layer. It interacts with the event bus in the following ways:

*   **Consumes Canonical Events:** The agent subscribes to the `canon.content.normalized` and `signal.*` topics to get a real-time feed of the normalized content and the signals generated by the enrichment and scoring services.
*   **Triggers Analysis:** Based on the incoming data, the agent triggers its own analytical processes, such as narrative detection, anomaly detection, and forecasting.
*   **Publishes Insights:** The agent publishes its insights back to the event bus on dedicated topics, such as `insight.narrative.summary` or `insight.recommendation.action`, which can then be consumed by other services (e.g., to populate dashboards or send alerts).
*   **Interacts with Serving APIs:** The agent can also interact with the serving APIs to perform ad-hoc queries and retrieve historical data for more complex analysis.

---

## 13) Roadmap técnico (PoC → MVP)

* **PoC (2–4 semanas)**

  * 2 conectores (X + TikTok), normalizador, bus, sentiment básico, dashboard mínimo, export a SAC.
* **MVP (6–10 semanas)**

  * +2 conectores (Instagram/YouTube), STT, detector de narrativas, reglas/alertas, RBAC, catálogo y linaje.

---

## 14) Checklists clave

**Conector nuevo**

* [ ] Credenciales seguras (Vault/KMS)
* [ ] Mapeo a canónico validado (JSON Schema)
* [ ] Idempotencia + reintentos
* [ ] Tests de tasa/lag/errores
* [ ] Observabilidad (trazas, métricas)

**Release**

* [ ] Versionado de contratos (semver)
* [ ] Backward-compat de esquemas en Registry
* [ ] Carga sintética para stress
