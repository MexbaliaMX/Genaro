# DFT 2.0 + Genaro — Solution Design & Functional Specifications

## 0) Executive Intent - IMPLEMENTED

**Status:** ✅ **IMPLEMENTED** - Classic social sentiment tracking evolved into a **multimodal, narrative-level intelligence platform** that can (1) monitor & explain how stories spread, (2) forecast their trajectory, (3) stress-test counter-messages safely, and (4) do so with **strong governance**.

**Goal:** Evolve classic social sentiment tracking into a **multimodal, narrative-level intelligence platform** that can (1) monitor & explain how stories spread, (2) forecast their trajectory, (3) stress-test counter-messages safely, and (4) do so with **strong governance**.
**Differentiator:** The **Genaro** agent—an auditable, tool-using copilot that produces briefings, simulates audience response, and enforces ethics guardrails.

---

## 1) Personas & primary use cases

**Personas**

*   **Camila (Campaign/Comms Lead):** Camila is responsible for the public perception of a major political campaign. She is constantly under pressure to react to breaking news and social media trends. She needs a tool that can quickly give her the lay of the land, identify potential threats to the campaign's narrative, and provide guidance on how to respond. She is not a data scientist, so the information needs to be presented in a clear, concise, and actionable way.
*   **Alex (Analyst/Researcher):** Alex is a data journalist who specializes in disinformation and online extremism. They are an expert in social media analysis and are comfortable working with large datasets. They need a tool that allows them to go deep into the data, explore causal relationships, and identify sophisticated manipulation campaigns. They are looking for a tool that can help them uncover the "story behind the story."
*   **Priya (Trust & Safety / Compliance Officer):** Priya works for a large social media platform and is responsible for ensuring that the platform is not used to spread harmful content. She needs a tool that can help her identify and track policy-violating content, conduct audits, and provide evidence for regulatory inquiries. She is particularly concerned with issues of fairness, bias, and transparency.
*   **David (Executive/Stakeholder):** David is a C-suite executive at a Fortune 500 company. He is not involved in the day-to-day details of social media monitoring, but he needs to be kept informed of major trends and potential risks to the company's reputation. He needs a tool that can provide him with high-level dashboards and automated weekly briefings that summarize the key takeaways.
*   **Sam (Data Scientist/Engineer):** Sam is responsible for building and maintaining the machine learning models that power the Genaro platform. They need a tool that provides them with a robust feature store, a streamlined model development lifecycle, and comprehensive model evaluation tools. They are focused on model performance, scalability, and reliability.
*   **Marcus (Performance Marketing Lead):** Marcus is responsible for managing advertising budgets across various platforms like Meta and Google. He needs to track ad spend in real-time, understand the cost-effectiveness of different campaigns, and optimize his budget allocation to maximize ROI. He needs a tool that can consolidate financial data from multiple ad platforms and present it in a clear, actionable dashboard.

**Top use cases**

1. **Narrative tracking** (not just sentiment): where the story begins, how it mutates, who amplifies it.
2. **Multimodal fusion:** text + image + video (frames/transcripts) + meme templates.
3. **Threat detection:** deepfakes, coordinated inauthentic behavior, botnets, synthetic amplification.
4. **Forecasting:** likelihood a narrative will trend; expected sentiment/stance shift and geospatial spread.
5. **Counter-narrative sandbox:** safely prototype messages and estimate impact by audience cohort.
6. **Governance:** consent, minimization, PII handling, audit trails, bias/harms monitoring.
7. **Advertising Cost Tracking & Optimization:** Real-time monitoring of ad spend across platforms (Meta, Google) and correlation with narrative performance to optimize budget allocation.

---

## 2) High-level architecture (logical)

1. **Ingestion Layer**

   * Social/APIs (X/Twitter, YouTube, Reddit, public FB/IG where policy-compliant), RSS/crawl, public Telegram channels, podcast feeds, newswire, **Advertising Platforms (Meta Ads, Google Ads)**.
   * Media fetchers: thumbnails, frames, audio; web archiving (hashing) for evidentiary integrity.
   * **Streaming bus:** Kafka (topics per source/modality/locale).

2. **Media & NLP Processing**

   * **ASR:** speech-to-text for video/podcasts.
   * **OCR/Captioning:** text in images/memes; subtitle extraction.
   * **Perception:** image/video embeddings (CLIP-class), perceptual hash; meme template detection.
   * **NLP enrichers:** language ID, NER, event extraction, stance & emotion classification, toxicity/abuse, bot-likelihood scoring, rumor/claim tagging.

3. **Genaro Orchestrator (Agentic Layer)**

   * Tool-use policies; prompt templates with **guardrails**.
   * Tools: retrieval (vector DB), fact-checkers, evidence linker (URLs, hashes, time), code-gen for analytics queries, creative A/B sandbox (offline), ethics validator.

4. **Analytics & Modeling**

   * **Topic/Narrative modeling:** BERTopic / Top2Vec variants + graph community detection.
   * **Causal & spread graphs:** user/content interaction graph; influence/rate modeling.
   * **Forecasting:** sequence models (Temporal Fusion Transformer / Prophet baseline); “virality likelihood” classifier.
   * **Deepfake & manipulation detectors:** image/video/audio forgery models; inconsistency heuristics.
   * **Bot/coordination:** temporal activity bursts, shared text/image fingerprints, synchronized posting, account metadata.

5. **Storage & Compute**

   * **Data Lake:** raw/bronze (object storage).
   * **Feature Store:** curated features for ML (time-windowed aggregates).
   * **Vector DB:** embeddings for text/image/video (e.g., pgvector/Weaviate).
   * **OLAP:** HANA/Snowflake/BigQuery for dashboards, slicing.
   * **Graph DB:** Neo4j/Janus for propagation/influence maps.

6. **Experience Layer**

   * **Dashboards:** Narrative Health, Risk & Integrity, Creative Sandbox, Forecasts, **Advertising Dashboard**.
   * **Alerting:** policy-driven triggers with severity routing (Slack/Teams/Email).
   * **Briefings:** Genaro drafts daily/weekly intel notes with linked evidence.

7. **Governance, Risk, Compliance**

   * Data classification, PII minimization, consent registry, DPIA artifacts.
   * RBAC/ABAC, **immutable audit logs**, model cards, eval pipelines.
   * Content provenance (hash chains), policy packs (platform terms/regulatory).

(**Infra**: Kubernetes; IaC; CI/CD; secret mgmt; observability: traces+metrics+logs)

---

## 3) Detailed component design

### 3.1 Ingestion

*   **Connectors:** Source adapters run as microservices; rate-limit aware; retry/backoff; policy filters (no private content; honor TOS).
    *   **Advertising Platform Connectors:** Dedicated connectors for Meta Ads API and Google Ads API to pull campaign performance data (spend, impressions, clicks, conversions). These connectors must handle API authentication (OAuth 2.0), rate limits, and data schema mapping.
*   **Schema:** `event_id, source, actor_id (hashed), timestamp, url, modality, raw_content_ptr, locale, geohint`.
    *   **Advertising Data Schema:** Extend schema to include `campaign_id`, `ad_set_id`, `ad_id`, `platform_cost`, `impressions`, `clicks`, `conversions`, `currency`, `campaign_objective`.
*   **Compliance:** On-ingest redaction (names/emails) unless explicit legal basis; opt-out list enforcement.

### 3.2 Multimodal processing

* **Text pipeline:** normalize → lang ID → sentence split → NER → stance (pro/anti/neutral) → emotion (e.g., GoEmotions) → sentiment (−3..+3) → claim/Rumor tag → embed.
* **Image/video pipeline:** frame sampling → embed → meme template match → OCR text → toxicity cues → deepfake risk score → embed.
* **Audio:** ASR → diarization (optional) → text pipeline.
* **Bot/coordination:** time series anomalies, textual near-duplicate bursts, account age/interaction entropy.

### 3.3 Narrative intelligence

* **Clustering:** dynamic topic formation with temporal smoothing; multilingual alignment.
* **Graph build:** nodes = accounts/URLs/templates; edges = shares/mentions/similarity; compute centrality & communities.
* **Narrative sheet (system object):**

  * Id, title, keywords, seed posts, stance split, sentiment distribution, top entities, key influencers, regions, media types, integrity flags, trajectory, forecast.

### 3.4 Forecasting

* Features: posting rate, acceleration, influencer activation, bot-likelihood mix, media richness, platform-specific seasonality, geography spread entropy.
* Models: **TFT** for time-series; gradient boosting for virality classification; calibration with backtests.
* Output: `prob_trend_up`, `horizon_day1..day7`, `confidence`, `drivers`.

### 3.5 Integrity & safety

* **Deepfake:** model ensemble + perceptual heuristics; triage scores: *Benign / Suspicious / Likely Synthetic*.
* **Coordination detection:** score with evidence facets (co-posting windows, payload similarity, shared URL chains).
* **Risk policies:** “If fake risk ≥ X OR coordination ≥ Y AND spread ≥ Z → SEV-High alert.”

### 3.6 Genaro (agent)

* **Modes:**

  * *Analyst*: Q&A, drilldowns, “explain the spike,” evidence linking.
  * *Strategist*: propose **ethical** counter-narratives (never targeted at protected/vulnerable groups; no dark patterns).
  * *Guardian*: pre-deployment checks (consent, bias, compliance), red-flag language, audit report.
* **Tooling:** RAG over vector+OLAP; fact-check against trusted corpora; code-assist for ad-hoc queries; prompt templates with policy constraints; citation enforcement.
* **Outputs:** Briefings (PDF/HTML), creative variants in *sandbox only*, risk assessments, “diff since yesterday.”

---

## 4) Data model (core entities)

*   **ContentItem**: id, source, modality, text_ptr, media_ptr, actor_hash, timestamp, embed_ptr.
*   **Enrichment**: item_id, lang, sentiment, stance, emotions[], toxicity, entities[], claims[].
*   **Narrative**: narrative_id, title, keywords[], members[item_id], stance_mix, sentiment_mix, regions[], influencers[], integrity_flags[], forecast.
*   **Actor**: actor_hash, platform, metadata_hash (non-PII), bot_score.
*   **Alert**: alert_id, severity, rule_id, narrative_id/item_id, evidence[], created_at, acked_by.
*   **SandboxScenario**: scenario_id, cohorts[], messages[], sim_results, ethics_report.
*   **AuditLog**: actor, action, object_type/id, timestamp, hash.
*   **AdCampaign**: campaign_id, platform, name, objective, start_date, end_date, budget, currency.
*   **AdSet**: ad_set_id, campaign_id, name, targeting, bid_strategy.
*   **AdCreative**: ad_id, ad_set_id, name, creative_url, text_content, image_url, video_url.
*   **AdPerformance**: ad_id, date, impressions, clicks, conversions, cost, currency, narrative_id (linked to relevant narrative).

---

## 5) Functional specifications (features, stories, acceptance)

### 5.1 Narrative Tracker

*   **F-1: Automatically Create and Update Narratives**
    *   **Story:** As Camila (Campaign/Comms Lead), I want the system to automatically group related content into narratives and provide meaningful labels, so that I can quickly understand the main stories circulating online without having to manually sift through thousands of individual posts.
    *   **Acceptance Criteria:**
        *   The system must automatically group content items into narratives with a thematic purity of at least 85% in benchmark tests.
        *   Each narrative must be automatically assigned a concise, descriptive label (e.g., "Debate over new climate policy," "Criticism of CEO's recent statement").
        *   The system must provide a list of top keywords and entities for each narrative.
        *   As an Analyst, I must be able to manually merge two or more narratives or split a single narrative into multiple new ones.
        *   Narratives should be updated in near real-time, with new content being added to existing narratives or forming new ones within 15 minutes of ingestion.

*   **F-2: View Detailed Narrative Sheet**
    *   **Story:** As Alex (Analyst/Researcher), I want to be able to click on any narrative and see a detailed "narrative sheet" with all the relevant information in one place, so that I can conduct a deep-dive analysis of the narrative's characteristics and evolution.
    *   **Acceptance Criteria:**
        *   The narrative sheet must display time-series charts for the narrative's volume, sentiment, and stance distribution over a user-selectable time period (last 24 hours, 7 days, 30 days).
        *   It must include a geographic heatmap showing the narrative's prevalence across different regions.
        *   It must list the top 10 most influential accounts (influencers) and organizations amplifying the narrative, ranked by their reach and engagement.
        *   It must display any integrity flags associated with the narrative, such as "Coordinated Behavior Detected" or "High Deepfake Risk."
        *   It must show a feed of the most representative and high-impact content items (seed posts) for the narrative.
        *   The sheet must display the latest forecast for the narrative's trajectory, including the top 3 drivers of the forecast.
        *   All data on the narrative sheet must be filterable by time, region, and other key dimensions.

### 5.2 Integrity & Threats

*   **F-3: Receive Real-time Alerts on Deepfakes and Bots**
    *   **Story:** As Priya (Trust & Safety / Compliance Officer), I want to receive real-time alerts when the system detects content with a high probability of being a deepfake or part of a bot network, so that I can quickly investigate and take action to mitigate the potential harm.
    *   **Acceptance Criteria:**
        *   Alerts must be triggered for any content item that has a deepfake probability score above 90% or a bot-likelihood score above 85%.
        *   Alerts must be delivered via email and Slack/Teams integrations within 5 minutes of detection.
        *   Each alert must include a severity level (e.g., High, Medium, Low), a link to the content item, and a clear explanation of why the alert was triggered (e.g., "Inconsistent head movement in video," "Account created 5 minutes ago, posting 100 times per hour").
        *   The alert must provide links to related evidence, such as the perceptual hash of the image or the account's activity history.
        *   The system must provide a dashboard where I can view and manage all active alerts.

*   **F-4: Visualize and Investigate Coordinated Behavior**
    *   **Story:** As Alex (Analyst/Researcher), I want to be able to visualize and investigate suspected cases of coordinated inauthentic behavior, so that I can understand how manipulation campaigns are organized and who is behind them.
    *   **Acceptance Criteria:**
        *   The system must provide a visual "burst plot" that shows spikes in activity around a particular narrative or piece of content.
        *   I must be able to click on a burst to see a synchronized cluster view of the accounts involved, showing their posting times and the content they shared.
        *   The cluster view must allow me to filter and sort accounts by their creation date, number of followers, and other metadata.
        *   I must be able to export the evidence bundle for a coordinated campaign, including a list of account hashes, URLs of shared content, and timestamps of activity.
        *   The system must be able to identify at least 80% of the participants in known, historical coordination campaigns in benchmark tests.

### 5.3 Forecasting

*   **F-5: Forecast Narrative Trends**
    *   **Story:** As Camila (Campaign/Comms Lead), I want to see a forecast of how a narrative is likely to trend over the next few days, so that I can proactively prepare my communications strategy and allocate resources effectively.
    *   **Acceptance Criteria:**
        *   For each narrative, the system must provide a forecast for its volume and sentiment for the next 1, 3, and 7 days.
        *   The forecast must be presented as a time-series chart with a confidence interval.
        *   The system must list the top 3 drivers of the forecast (e.g., "Increased activity from verified journalists," "High engagement from a new demographic group," "Low trust score of source material").
        *   The forecast models must be calibrated weekly, and the Mean Absolute Percentage Error (MAPE) should be below 20% in backtests.
        *   I must be able to run a "what-if" analysis by manually adjusting the drivers to see how the forecast changes.

*   **F-6: Assess Risk of Narrative Capture**
    *   **Story:** As Priya (Trust & Safety / Compliance Officer), I want the system to assess the risk of a narrative being "captured" or dominated by a malicious or inauthentic cohort, so that I can prioritize my team's moderation efforts.
    *   **Acceptance Criteria:**
        *   For each narrative, the system must calculate a "narrative capture risk" score, which is the probability that a malicious cohort will dominate the conversation in the next 48 hours.
        *   The risk score must be based on factors such as the cohort's size, coordination level, and the toxicity of their content.
        *   The system must provide a list of recommended mitigation actions, such as "Review accounts for policy violations" or "Increase fact-checking on this topic."
        *   The system must be able to correctly identify at least 75% of historical narrative capture events in benchmark tests.

### 5.4 Genaro Copilot

*   **F-7: Ask Analytical Questions in Natural Language**
    *   **Story:** As David (Executive/Stakeholder), I want to be able to ask Genaro questions in plain English, such as "What are the top 5 narratives this week?" or "Why did sentiment for our brand drop yesterday?", so that I can get quick answers to my questions without having to navigate complex dashboards.
    *   **Acceptance Criteria:**
        *   Genaro must be able to understand and answer a wide range of analytical questions about narratives, sentiment, and trends.
        *   All answers must be presented in clear, concise language and include supporting data visualizations.
        *   Every answer must include citations that link back to the source data, dashboards, or metrics.
        *   Genaro's answers must be accurate and consistent with the data presented in the dashboards.
        *   Genaro should be able to answer at least 90% of the questions in a predefined benchmark question set correctly.

*   **F-8: Test Counter-Narratives in a Strategy Sandbox**
    *   **Story:** As Camila (Campaign/Comms Lead), I want to use the Strategy Sandbox to test different counter-messaging strategies and see their simulated impact on different audience cohorts, so that I can make data-driven decisions about which messages to deploy.
    *   **Acceptance Criteria:**
        *   The sandbox must allow me to define specific audience cohorts based on their demographics, interests, and media consumption habits.
        *   I must be able to create and test multiple message variants for each cohort.
        *   The sandbox must provide a simulation of the expected effect of each message on the cohort's sentiment, stance, and engagement, with a stated confidence level.
        *   Genaro must propose **only** compliant and ethical counter-messages, and each proposed variant must come with a target cohort rationale and an ethics checklist.
        *   The sandbox must not allow me to deploy messages directly. I can only export the results of the simulation.

*   **F-9: Perform Guardian Checks for Compliance and Ethics**
    *   **Story:** As Priya (Trust & Safety / Compliance Officer), I want Genaro to act as a "guardian" that automatically checks all content and actions for compliance with our policies and ethical guidelines, so that I can ensure that the platform is being used responsibly.
    *   **Acceptance Criteria:**
        *   Genaro must automatically scan all imported content for PII and other sensitive data and redact it where appropriate.
        *   Genaro must flag any user actions that could potentially violate our policies, such as attempting to target vulnerable groups with messaging.
        *   Any export of data, briefing, or sandbox run must automatically have an audit appendix attached, which includes details on the data sources, consent posture, bias notes, and model versions used.
        *   Genaro must be able to explain its decisions and recommendations in a clear and transparent way.

### 5.5 Dashboards

*   **F-10: Monitor Narrative Health**
    *   **Story:** As Camila (Campaign/Comms Lead), I want a "Narrative Health" dashboard that gives me a high-level overview of the most important narratives and their key metrics, so that I can quickly assess the overall state of our public perception.
    *   **Acceptance Criteria:**
        *   The dashboard must display a list of the top 10 most active narratives, ranked by volume or growth.
        *   For each narrative, the dashboard must show its current sentiment and stance distribution, as well as any integrity flags.
        *   The dashboard must include a "narrative of the day" feature that highlights the most significant new or rapidly growing narrative.
        *   All charts and metrics on the dashboard must be updated in near real-time (less than 15 minutes of data latency).

*   **F-11: Track Risks and Integrity Threats**
    *   **Story:** As Priya (Trust & Safety / Compliance Officer), I want a "Risk & Integrity" dashboard where I can track all active alerts and investigate potential threats, so that I can effectively manage the safety and integrity of our platform.
    *   **Acceptance Criteria:**
        *   The dashboard must display a list of all active alerts, which can be filtered and sorted by severity, type (e.g., deepfake, bot), and date.
        *   The dashboard must include a "fake risk" meter that shows the overall level of synthetic and manipulated content on the platform.
        *   The dashboard must provide a view of active coordination clusters, with the ability to drill down into the details of each cluster.
        *   The dashboard must be updated in near real-time (less than 5 minutes of data latency for alerts).

*   **F-12: Manage Sandbox Scenarios**
    *   **Story:** As Camila (Campaign/Comms Lead), I want a "Sandbox Studio" dashboard where I can create, manage, and review my sandbox scenarios, so that I can easily track my experiments and share the results with my team.
    *   **Acceptance Criteria:**
        *   The dashboard must display a list of all my sandbox scenarios, with their status (e.g., draft, running, completed).
        *   I must be able to create new scenarios, define audience cohorts, and create message variants from the dashboard.
        *   For each completed scenario, the dashboard must display the simulated lift in sentiment, stance, and engagement, with clear caveats about the simulation's limitations.
        *   I must be able to export the results of any scenario as a PDF or PowerPoint presentation.

### 5.6 Governance

*   **F-13: Control Access with Role-Based and Attribute-Based Access Control (RBAC/ABAC)**
    *   **Story:** As a System Administrator, I want to be able to assign users to predefined roles with specific permissions, as well as create custom access rules based on user attributes, so that I can ensure that users only have access to the data and features that are appropriate for their job function.
    *   **Acceptance Criteria:**
        *   The system must provide at least five predefined roles: Viewer, Analyst, Strategist, Admin, and Compliance.
        *   Each role must have a clearly defined set of permissions. For example, Viewers can only see dashboards, while Strategists can use the Sandbox.
        *   The system must support attribute-based access control (ABAC) rules, such as restricting access to data from a specific country to users in that country.
        *   All access control rules must be enforced at the API level.

*   **F-14: Maintain a Comprehensive Audit Trail**
    *   **Story:** As Priya (Trust & Safety / Compliance Officer), I want the system to maintain a comprehensive and immutable audit trail of all user actions, so that I can investigate security incidents and ensure compliance with our policies.
    *   **Acceptance Criteria:**
        *   Every action taken by a user or by the Genaro agent, including every query, content view, and sandbox run, must be logged.
        *   Each audit log entry must include the actor, the action taken, the object of the action, a timestamp, and a cryptographic hash to ensure its integrity.
        *   The audit log must be stored in a way that is immutable and cannot be tampered with.
        *   I must be able to search and filter the audit log by user, action, and date.

*   **F-15: Enforce Data Minimization and Retention Policies**
    *   **Story:** As a System Administrator, I want to be able to configure data minimization and retention policies, so that I can ensure that we are only storing the data that is necessary and that we are complying with data protection regulations.
    *   **Acceptance Criteria:**
        *   All personally identifiable information (PII) must be hashed or anonymized at the point of ingestion.
        *   The system must allow me to configure data retention policies, such as automatically deleting raw data after 90 days.
        *   The system must support jurisdiction-based routing, so that data from a specific country can be stored and processed in that country.

### 5.7 FINOPS Features

*   **F-16: Track Advertising Costs Across Platforms**
    *   **Story:** As Marcus (Performance Marketing Lead), I want to automatically track advertising costs from Meta Ads and Google Ads in a single view, so that I can get a consolidated understanding of my ad spend without manually logging into multiple platforms.
    *   **Acceptance Criteria:**
        *   The system must connect to Meta Ads and Google Ads APIs to pull daily ad spend data.
        *   The system must display total ad spend per platform, per campaign, and per ad set.
        *   I must be able to view historical ad spend data over user-defined periods (e.g., daily, weekly, monthly).
        *   The data must be updated at least once every 24 hours.

*   **F-17: Advertising Performance Dashboard**
    *   **Story:** As Marcus (Performance Marketing Lead), I want an advertising performance dashboard that shows key metrics like impressions, clicks, conversions, and cost per conversion, so that I can quickly assess the effectiveness of my campaigns and identify areas for optimization.
    *   **Acceptance Criteria:**
        *   The dashboard must display key performance indicators (KPIs) such as impressions, clicks, conversions, CTR, CPC, and CPA.
        *   I must be able to filter the dashboard by platform, campaign, ad set, and date range.
        *   The dashboard must allow me to compare the performance of different campaigns or ad sets side-by-side.
        *   The dashboard must highlight campaigns or ad sets that are over-performing or under-performing based on predefined thresholds.
        *   I must be able to export the dashboard data as a CSV or PDF.

*   **F-18: Correlate Ad Spend with Narrative Impact**
    *   **Story:** As Marcus (Performance Marketing Lead), I want to see how my advertising spend correlates with the narrative impact (e.g., sentiment, volume, stance) of my campaigns, so that I can understand the true ROI of my advertising efforts beyond traditional marketing metrics.
    *   **Acceptance Criteria:**
        *   The system must link ad campaigns to relevant narratives based on content and targeting.
        *   The advertising dashboard must include a view that overlays ad spend with narrative metrics (e.g., sentiment score, narrative volume) over time.
        *   I must be able to identify which ad campaigns are most effective at shifting narrative sentiment or increasing narrative volume.
        *   The system should provide insights or recommendations on how to optimize ad spend to achieve desired narrative outcomes.

---

## 6) APIs (illustrative)

**Auth:** OAuth2/JWT; scopes per role.
**Authorization:** Role-based Access Control (RBAC) with permission-based access to endpoints
**Security:** All endpoints protected with authentication middleware, sensitive operations require specific role permissions

**Authentication APIs:**
```
POST /v1/auth/login {username, password} → {access_token, refresh_token, user}
POST /v1/auth/refresh {refresh_token} → {access_token, user}
POST /v1/auth/validate → {valid, user}
POST /v1/auth/logout → {message}
GET /v1/auth/profile → {user, permissions}
```

**Narrative and Analytics APIs:**
```
GET /v1/narratives?since=...&locale=...
GET /v1/narratives/{id}
GET /v1/narratives/{id}/metrics?window=...
POST /v1/narratives/search {query, since, until, page, page_size} → {results, total}
GET /v1/metrics/kpis?entity_id=...&entity_type=...&window=...
```

**Advanced ML Model APIs:**
```
POST /v1/ml/deepfake/detect {media_url, media_type} → {is_synthetic, confidence, risk_score, explanation}
POST /v1/ml/content/analyze {content} → {sentiment, toxicity, emotions, sarcasm_detected, quality_score}
POST /v1/ml/narrative/detect {content_batch} → {narratives, confidence, topic_keywords}
POST /v1/ml/forecast/narrative/{narrativeId} {horizon_days, include_confidence} → {volume_predictions, sentiment_predictions, risk_predictions}
```

**Data Pipeline APIs:**
```
POST /v1/pipeline/connect {id, name, type, config} → {sourceId, connected, message}
POST /v1/pipeline/fetch/{sourceId} {options} → {canonicalData, count}
POST /v1/pipeline/validate {data} → {valid, errorCount}
POST /v1/pipeline/transform {rawData, sourceType} → {canonicalData}
```

**Advertising APIs:**
```
GET /v1/advertising/campaigns?platform=...&date_range=...
GET /v1/advertising/campaigns/{id}/performance?date_range=...
```

**Sandbox and Genaro APIs:**
```
POST /v1/sandbox/simulate {cohorts, messages[]}
POST /v1/genaro/request {requestType, query, context} → {response_id, content, confidence}
GET /v1/genaro/response/{requestId}
POST /v1/genaro/ethics-check {content, audience, purpose}
```

**Admin/Management APIs:**
```
GET /v1/admin/users
POST /v1/exports/sac {destination, filters} → {job_id, status}
GET /v1/health → {status, timestamp}
```

**Webhook events:** `AlertCreated`, `NarrativeChanged`, `ForecastUpdated`, `AdSpendUpdated`, `AnalyticsResults`, `GenaroResponse`.

---

## 7) NFRs (non-functional requirements)

*   **Latency:**
    *   **Ingestion to Dashboard (Text):** End-to-end latency for text-based content, from ingestion to being visible in dashboards, must be less than 10 minutes.
    *   **Ingestion to Dashboard (Video):** End-to-end latency for video content, including ASR processing, must be less than 20 minutes.
    *   **API Response Time:** All API endpoints must have a 99th percentile response time of less than 500ms.
    *   **Dashboard Load Time:** All dashboards must load in less than 5 seconds for a user with a standard internet connection.

*   **Scale:**
    *   **Initial Volume:** The system must be able to process 10 million content items per day.
    *   **Scalability:** The system must be able to scale linearly to handle at least 100 million content items per day by adding more resources (horizontal scaling).
    *   **Concurrent Users:** The system must support at least 500 concurrent users without a significant degradation in performance.

*   **Availability:**
    *   **Uptime:** The system must have an uptime of at least 99.5%, which translates to no more than 3.65 hours of downtime per year.
    *   **Graceful Degradation:** In the event of a partial system failure, the system must degrade gracefully. For example, if the forecasting model is unavailable, the rest of the system should continue to function normally.
    *   **Disaster Recovery:** The system must have a disaster recovery plan in place to restore service within 24 hours in the event of a major outage.

*   **Security:**
    *   **Encryption:** All data must be encrypted at rest and in transit using industry-standard encryption algorithms (e.g., TLS 1.3, AES-256).
    *   **Key Management:** All encryption keys must be managed using a key management service (KMS).
    *   **Secrets Management:** All secrets, such as API keys and passwords, must be stored in a secure secrets vault.
    *   **Network Security:** The system must be protected by a firewall and other network security measures to prevent unauthorized access.
    *   **Vulnerability Scanning:** The system must be regularly scanned for security vulnerabilities, and any identified vulnerabilities must be patched within a defined timeframe based on their severity.
    *   **Authentication:** Implement OAuth2/JWT with refresh token rotation and proper token expiration policies.
    *   **Authorization:** Implement Role-Based Access Control (RBAC) with granular permission management per endpoint/functionality.
    *   **API Security:** All API endpoints must implement authentication, authorization, rate limiting, and input validation to prevent abuse.
    *   **Audit Logging:** All security-relevant events must be logged for compliance and forensic analysis.

*   **Privacy:**
    *   **Data Protection:** The system must comply with all relevant data protection regulations, such as GDPR and CCPA.
    *   **DSR Handling:** The system must provide a mechanism for handling Data Subject Requests (DSRs), such as requests for access or deletion of data.
    *   **Purpose Limitation:** The system must only use data for the purposes for which it was collected.
    *   **Opt-out Lists:** The system must maintain and enforce opt-out lists for users who do not want their data to be processed.

*   **Internationalization (i18n):**
    *   **Multilingual Support:** The system must support at least 10 languages, including English, Spanish, French, German, and Japanese.
    *   **Locale-aware Models:** The sentiment and stance models must be locale-aware and trained on data from different regions to ensure their accuracy.
    *   **UI Localization:** The user interface must be localized for each supported language.

*   **Observability:**
    *   **Metrics:** The system must expose a comprehensive set of metrics (e.g., RED/USE) for monitoring its performance and health.
    *   **Logging:** All system components must produce structured logs that can be easily searched and analyzed.
    *   **Tracing:** The system must use distributed tracing to track requests as they flow through the different microservices.
    *   **Model Drift:** The system must monitor for model drift and alert the data science team when the performance of a model degrades.
    *   **Explainability:** The system must provide explainability traces for Genaro's decisions and recommendations.

---

## 8) ML/MLOps

* **Data contracts** for ingestion; unit tests on schema.
* **Feature Store** with lineage; reproducible training (DVC).
* **Evaluation:** sentiment F1 by locale; stance ROC-AUC; deepfake precision@k; forecast MAPE; fairness slices.
* **Drift:** PSI & embedding shift; alert on thresholds.
* **Human-in-the-loop:** adjudication UI; weekly error analysis; model cards.

---

## 9) Genaro Guardrails (policy)

* No personalized microtargeting using sensitive attributes.
* Disallows messaging that exploits fear/anger in vulnerable groups.
* Requires **consent/legal basis** for any personal data beyond public interest.
* All outputs carry **source citations** and **confidence**; risky suggestions are blocked with rationale.
* Sandbox content is **non-deployable** by default (export only).

---

## 10) Deployment blueprint

* **Kubernetes** (AKS/EKS/GKE); GPU nodepool for heavy models.
* **Data plane:** Object storage (lake), HANA/Snowflake/BigQuery (OLAP), Vector DB (pgvector/Weaviate), Graph DB.
* **Pipelines:** Kafka → Spark/Flink → stores; Airflow/Argo for batch.
* **CI/CD:** GitOps (ArgoCD), blue-green for services, canary for models (shadow eval).
* **Secrets/Keys:** Vault/KMS; per-env separation; least privilege IAM.

---

## 11) Success metrics (KPIs)

*   **Analyst Outcomes:**
    *   **Time-to-Insight:** Reduce the average time it takes for an analyst to go from a raw piece of information to a meaningful insight by 60-80%. This will be measured through user surveys and by tracking the time spent on specific analytical tasks.
    *   **Explanatory Coverage:** Increase the percentage of significant narrative shifts that can be explained by the system's insights by 50%. This will be measured by comparing the system's explanations to expert analysis of historical events.

*   **Forecast Quality:**
    *   **Hit Rate:** Achieve a hit rate of at least 80% for narrative trend forecasts, meaning that the forecast correctly predicts the direction of the trend 8 out of 10 times.
    *   **Calibration:** Ensure that the forecast models are well-calibrated, with a Mean Absolute Percentage Error (MAPE) of less than 20%.
    *   **Early-Warning Lead Time:** Provide at least 48 hours of lead time for early warnings of significant narrative shifts or integrity threats.

*   **Integrity Efficacy:**
    *   **Deepfake Detection:** Detect at least 90% of deepfakes before they go viral (i.e., before they reach 100,000 views or shares).
    *   **Coordinated Cluster Recall:** Achieve a recall of at least 80% for the detection of coordinated inauthentic behavior clusters, meaning that the system correctly identifies at least 80% of the accounts participating in a coordinated campaign.

*   **Governance:**
    *   **Auditability:** Ensure that 100% of user and system actions are logged in the audit trail.
    *   **Policy Violations:** Have zero critical policy violations, such as unauthorized access to data or the use of the system for malicious purposes.
    *   **DPIA:** Keep the Data Protection Impact Assessment (DPIA) up to date with any changes to the system or its use of data.

*   **Adoption:**
    *   **Executive Usage:** Have at least 75% of executives who receive the weekly Genaro briefings report that they find them useful and informative.
    *   **Sandbox Usage:** Have at least 50% of strategists run at least one sandbox simulation per month.
    *   **Ethics Pass Rate:** Achieve a 100% pass rate for the ethics checklist on all sandbox runs.

*   **FINOPS & Advertising Efficiency:**
    *   **Ad Spend Visibility:** Achieve 100% visibility into ad spend across integrated platforms.
    *   **ROI Improvement:** Demonstrate a 15% improvement in advertising campaign ROI by optimizing spend based on narrative insights.
    *   **Budget Optimization:** Reduce manual effort in budget allocation by 30% through automated recommendations.

---

## 12) Risks & mitigations

* **API/terms volatility:** abstraction layer + feature flags.
* **Model bias:** diverse training corpora; fairness tests; human review.
* **Adversarial media:** model ensemble + human escalation playbooks.
* **Regulatory change:** compliance pack updates, policy-as-code.
* **Misuse risk:** strict RBAC, sandbox-only generative features, mandatory audit.

---

## 13) Phased delivery (no dates, dependency-driven)

**Phase A (Foundations):** ingest → enrich → dashboards v1; governance baseline.
**Phase B (Narratives & Forecasts):** topic graphs, TFT forecasting; alerts.
**Phase C (Integrity):** deepfake/coordination detectors; Risk dashboard.
**Phase D (Genaro):** Analyst Q&A → Guardian checks → Sandbox (export-only).
**Phase E (Hardening):** scale, perf, i18n, model cards, red-team.

---

## 14) What you get on day one of DFT 2.0

* A secure, scalable pipeline that **understands narratives, not just sentiment**.
* **Genaro** to explain, forecast, and **ethically** advise—with receipts (citations & audits).
* A governance backbone that makes this **deployable in the real world**.

---

## 15) Environments

* **Development:** Local or containerized environments for individual developers. Should support hot-reloading for rapid iteration. Data is synthetic or heavily anonymized.
* **Testing/QA:** A stable, shared environment for automated and manual testing. Uses a dedicated, persistent dataset that mirrors production characteristics.
* **Staging/Pre-production:** A 1:1 replica of the production environment, including infrastructure, configuration, and data volume (anonymized). Used for final validation, performance testing, and soak tests before release.
* **Production:** The live environment serving end-users. Access is highly restricted and all changes must go through the full CI/CD pipeline.
