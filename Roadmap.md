# 🗺️ Roadmap de Funcionalidades – Genaro DFT 2.0

## 📌 Fase 1 – Completado (0–6 meses) → **MVP extendido**

**Estado:** ✅ COMPLETADO

Enfoque: **rápido valor de negocio** y diferenciación inicial.

* ✅ **Credibility Index** → ranking de narrativas según confiabilidad de fuentes.
* ✅ **Early-Meme Detector (versión básica)** → detección temprana de hashtags e imágenes recurrentes.
* ✅ **Briefing Multiformato** → exportar reportes en versiones ejecutivas, técnicas y regulatorias.
* ✅ **Cross-Team War Room Mode (lite)** → vista compartida de crisis para PR, Legal y C-Suite.
* ✅ **Explainability Dashboard** → cada recomendación con drivers de datos y justificación.
* ✅ **Synthetic Media Watermarking (sandbox only)** → huellas digitales en todo contenido generado.
* ✅ **Datos para Mockups** → servicio de datos (front-end) que consume APIs contract-first; reemplaza sintéticos.
* ✅ **API Gateway Inicial** → endpoints `/ingest/webhook`, `/narratives/{id}/metrics`, `/search` según OpenAPI.
* ✅ **Lint & Tests Básicos** → Spectral para OpenAPI/AsyncAPI + pruebas de Lighthouse/axe en dark mockups.
* ✅ **Backend Stub** → mock server que emula contratos REST para acelerar integración UI.

**Valor:** Refuerza credibilidad, auditoría y rapidez de respuesta en crisis.

---

## 📌 Fase 2 – En progreso (6–12 meses) → **Diferenciación competitiva**

Enfoque: **simulación avanzada y colaborativa**.

* 🔄 **Narrative DNA Mapping** → descomposición de narrativas en “genes” que se recombinan.
* 🔄 **Emotion Spread Forecasting** → predicción de emociones dominantes (ej. ira vs esperanza).
* 🔄 **Scenario Mixer** → simulación de eventos combinados (ej. filtración + anuncio).
* 🔄 **Stakeholder Response Simulator** → reacciones proyectadas de clientes, reguladores, ONGs.
* 🔄 **Integration with ESG Reporting** → exportar insumos para reportes de sostenibilidad.
* 🔄 **Bias Radar (beta)** → alertas de sesgos detectados en narrativas o recomendaciones.
* ✅ **Data Orchestration** → pipelines (batch/stream) que alimentan Feature Store según AsyncAPI.
* ✅ **Contract Testing** → suites de integración que validan esquema openapi/asyncapi vs. servicios reales.
* ✅ **CI/CD Automatizado** → pipeline con lint, pruebas end-to-end de mockups y despliegues controlados.
* 🔄 **Seguridad & IAM** → OAuth2 client-credentials + API keys para conectores; Vault/KMS para secretos.

**Valor:** Permite jugar a la “geopolítica narrativa” con mayor granularidad y conecta con agendas de sostenibilidad y compliance.

---

## 📌 Fase 3 – Futuro (12–18 meses) → **Innovación y resiliencia**

Enfoque: **I+D y resiliencia organizacional**.

* 🔄 **Competitive Strategy Twin** → modelos que simulan estilo de comunicación de competidores.
* 🔄 **Narrative Immunization Testing** → evaluar cómo campañas educativas fortalecen resiliencia social.
* 🔄 **Red Team Companion** → simula ataques de manipulación para pruebas internas y entrenamientos.
* 🔄 **Learning Replay** → línea de tiempo mostrando evolución de predicciones y decisiones.
* 🔄 **Policy Simulation Mode** → modelar efectos reputacionales de cambios regulatorios.
* 🔄 **Marketplace de Integraciones** → plugins para CRMs, Ad platforms, Risk Mgmt, ciberseguridad.
* 🔄 **Streaming Realtime API** → WebSockets/SSE alimentados por Feature Store para dashboards live.
* 🔄 **Observabilidad de Contratos** → monitoreo de SLA/SLO sobre APIs/eventos + catálogo/línea de datos.
* 🔄 **Automated a11y & perf** → pruebas continuas de accesibilidad/performance en navegadores objetivo.

**Valor:** Posiciona a Genaro no solo como **copiloto de reputación**, sino como **ecosistema de resiliencia narrativa y estrategia regulatoria**.

---

## 🎯 Estado Actual del Proyecto

* **✅ Fase 1 completada:** Credibility Index, Meme Detector, Briefings multiformato, Explainability.
* **🔄 Fase 2 en progreso:** Narrative DNA, Emotion Forecast, Scenario Mixer, ESG & Bias Radar.
* **📋 Fase 3 planificada:** Strategy Twins, Immunization, Red Team Companion, Policy Simulations.
