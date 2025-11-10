/**
 * MockApiClient simulates the Genaro DFT 2.0 contracts (OpenAPI + AsyncAPI) so the HTML mockups can
 * retrieve realistic data shapes without depending on a live backend. The dataset mirrors the
 * structures defined in `api/openapi.yaml` and `api/asyncapi.yaml`:
 *   - `/narratives/{id}/metrics` responses populate narrative heatmaps, timelines, sentiment, geo.
 *   - `/metrics/kpis` responses drive coordination indexes and executive/advertising KPIs.
 *   - `risk.narrative.detected` and sandbox runs emulate AsyncAPI events for network visualizations.
 *
 * Each helper returns a Promise to imitate network latency and keep the rendering logic identical to
 * future real integrations.
 */
(function () {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rng = mulberry32(42);

  const createBreakdown = (rows, dimensions) =>
    rows.reduce((acc, row) => {
      const key = dimensions.map((dim) => `${dim}=${row[dim]}`).join("|");
      acc[key] = row.value;
      return acc;
    }, {});

  const average = (breakdown) => {
    const values = Object.values(breakdown || {});
    if (!values.length) return 0;
    const total = values.reduce((sum, value) => sum + value, 0);
    return Number((total / values.length).toFixed(2));
  };

  const narrativeMetricsDb = {
    "nar-global-ops": {
      region_category: {
        metrics: [
          {
            kpi: "activity_index",
            breakdown: createBreakdown(
              [
                { region: "North America", category: "Finance", value: 92 },
                { region: "North America", category: "Politics", value: 74 },
                { region: "Europe", category: "Finance", value: 68 },
                { region: "Europe", category: "Consumer", value: 57 },
                { region: "APAC", category: "Energy", value: 61 },
                { region: "APAC", category: "Healthcare", value: 49 },
                { region: "LATAM", category: "Finance", value: 54 },
                { region: "LATAM", category: "Politics", value: 63 },
              ],
              ["region", "category"]
            ),
          },
        ],
      },
      origin_daily: {
        metrics: [
          {
            kpi: "origin_volume_organic",
            breakdown: createBreakdown(
              [
                { date: "2024-05-16", value: 42 },
                { date: "2024-05-17", value: 48 },
                { date: "2024-05-18", value: 55 },
                { date: "2024-05-19", value: 51 },
                { date: "2024-05-20", value: 57 },
                { date: "2024-05-21", value: 63 },
                { date: "2024-05-22", value: 66 },
              ],
              ["date"]
            ),
          },
          {
            kpi: "origin_volume_synthetic",
            breakdown: createBreakdown(
              [
                { date: "2024-05-16", value: 19 },
                { date: "2024-05-17", value: 22 },
                { date: "2024-05-18", value: 28 },
                { date: "2024-05-19", value: 33 },
                { date: "2024-05-20", value: 29 },
                { date: "2024-05-21", value: 34 },
                { date: "2024-05-22", value: 38 },
              ],
              ["date"]
            ),
          },
        ],
      },
      platform: {
        metrics: [
          {
            kpi: "platform_share",
            breakdown: createBreakdown(
              [
                { platform: "Twitter", value: 34 },
                { platform: "Facebook", value: 28 },
                { platform: "TikTok", value: 19 },
                { platform: "Reddit", value: 12 },
                { platform: "LinkedIn", value: 7 },
              ],
              ["platform"]
            ),
          },
        ],
      },
      sentiment_hour: {
        metrics: [
          {
            kpi: "sentiment_overall",
            breakdown: createBreakdown(
              [
                { hour: "2024-05-22T00:00:00Z", value: 61 },
                { hour: "2024-05-22T04:00:00Z", value: 64 },
                { hour: "2024-05-22T08:00:00Z", value: 69 },
                { hour: "2024-05-22T12:00:00Z", value: 71 },
                { hour: "2024-05-22T16:00:00Z", value: 67 },
                { hour: "2024-05-22T20:00:00Z", value: 63 },
                { hour: "2024-05-23T00:00:00Z", value: 59 },
              ],
              ["hour"]
            ),
          },
          {
            kpi: "sentiment_authentic",
            breakdown: createBreakdown(
              [
                { hour: "2024-05-22T00:00:00Z", value: 56 },
                { hour: "2024-05-22T04:00:00Z", value: 59 },
                { hour: "2024-05-22T08:00:00Z", value: 61 },
                { hour: "2024-05-22T12:00:00Z", value: 64 },
                { hour: "2024-05-22T16:00:00Z", value: 62 },
                { hour: "2024-05-22T20:00:00Z", value: 58 },
                { hour: "2024-05-23T00:00:00Z", value: 55 },
              ],
              ["hour"]
            ),
          },
          {
            kpi: "sentiment_synthetic",
            breakdown: createBreakdown(
              [
                { hour: "2024-05-22T00:00:00Z", value: 34 },
                { hour: "2024-05-22T04:00:00Z", value: 37 },
                { hour: "2024-05-22T08:00:00Z", value: 39 },
                { hour: "2024-05-22T12:00:00Z", value: 35 },
                { hour: "2024-05-22T16:00:00Z", value: 33 },
                { hour: "2024-05-22T20:00:00Z", value: 31 },
                { hour: "2024-05-23T00:00:00Z", value: 29 },
              ],
              ["hour"]
            ),
          },
        ],
      },
      geo: {
        metrics: [
          {
            kpi: "geo_intensity",
            breakdown: createBreakdown(
              [
                { region: "USA", value: 78 },
                { region: "United Kingdom", value: 62 },
                { region: "Germany", value: 54 },
                { region: "Brazil", value: 47 },
                { region: "Singapore", value: 42 },
              ],
              ["region"]
            ),
          },
          {
            kpi: "geo_trend_pct",
            breakdown: createBreakdown(
              [
                { region: "USA", value: 12 },
                { region: "United Kingdom", value: 7 },
                { region: "Germany", value: 5 },
                { region: "Brazil", value: 9 },
                { region: "Singapore", value: 4 },
              ],
              ["region"]
            ),
          },
          {
            kpi: "geo_sentiment_shift",
            breakdown: createBreakdown(
              [
                { region: "USA", value: 18 },
                { region: "United Kingdom", value: 9 },
                { region: "Germany", value: 6 },
                { region: "Brazil", value: -4 },
                { region: "Singapore", value: -2 },
              ],
              ["region"]
            ),
          },
        ],
      },
    },
  };

  const aggregateMetrics = {
    coordination_index: {
      metrics: [
        {
          kpi: "coordination_index",
          breakdown: createBreakdown(
            Array.from({ length: 24 }, (_, hour) => ({
              hour,
              value: hour < 6 ? 38 + hour * 3 : 52 + Math.sin(hour / 3) * 18,
            })),
            ["hour"]
          ),
        },
      ],
    },
  };

  const riskGraphs = {
    "nar-global-ops": {
      nodes: [
        { id: "cmd-01", role: "Commander", critical: true },
        { id: "cmd-02", role: "Commander", critical: false },
        { id: "bot-117", role: "Bot", critical: false },
        { id: "bot-204", role: "Bot", critical: true },
        { id: "bot-322", role: "Bot", critical: false },
        { id: "relay-41", role: "Relay", critical: false },
        { id: "relay-58", role: "Relay", critical: false },
        { id: "bot-441", role: "Bot", critical: false },
        { id: "bot-598", role: "Bot", critical: false },
      ],
      links: [
        { source: "cmd-01", target: "bot-117", weight: 0.92 },
        { source: "cmd-01", target: "bot-204", weight: 0.88 },
        { source: "cmd-01", target: "relay-41", weight: 0.65 },
        { source: "cmd-02", target: "bot-322", weight: 0.73 },
        { source: "cmd-02", target: "relay-58", weight: 0.69 },
        { source: "relay-41", target: "bot-441", weight: 0.58 },
        { source: "relay-41", target: "bot-598", weight: 0.55 },
        { source: "relay-58", target: "bot-441", weight: 0.44 },
        { source: "bot-204", target: "bot-441", weight: 0.37 },
      ],
      metadata: {
        event_id: "risk-2405-01",
        narrative_id: "nar-global-ops",
        risk_level: "critical",
      },
    },
  };

  const sandboxSimulations = {
    "nar-global-ops": {
      network: {
        nodes: [
          { id: "aud-1", camp: "Our", influence: 8 },
          { id: "aud-2", camp: "Opposition", influence: 6 },
          { id: "aud-3", camp: "Neutral", influence: 4 },
          { id: "aud-4", camp: "Our", influence: 7 },
          { id: "aud-5", camp: "Opposition", influence: 5 },
          { id: "aud-6", camp: "Neutral", influence: 3 },
        ],
        links: [
          { source: "aud-1", target: "aud-3", strength: 0.7 },
          { source: "aud-1", target: "aud-5", strength: 0.6 },
          { source: "aud-2", target: "aud-4", strength: 0.55 },
          { source: "aud-2", target: "aud-6", strength: 0.48 },
          { source: "aud-4", target: "aud-3", strength: 0.62 },
          { source: "aud-5", target: "aud-6", strength: 0.37 },
        ],
      },
      segments: [
        { segment: "Analysts", engagement: 82, sentiment: 0.34 },
        { segment: "Investors", engagement: 68, sentiment: 0.48 },
        { segment: "Advocates", engagement: 91, sentiment: 0.62 },
        { segment: "Skeptics", engagement: 47, sentiment: -0.21 },
        { segment: "Regulators", engagement: 55, sentiment: 0.12 },
      ],
    },
  };

  const executiveBundles = {
    "nar-global-ops": {
      threatRegions: [
        { region: "USA", score: 82, color: "#ef4444" },
        { region: "United Kingdom", score: 68, color: "#f97316" },
        { region: "Germany", score: 55, color: "#6366f1" },
        { region: "Brazil", score: 47, color: "#3b82f6" },
        { region: "Singapore", score: 42, color: "#22d3ee" },
      ],
      categoryBreakdown: [
        { label: "Coordinated Campaigns", value: 34, color: "#ef4444" },
        { label: "Bot Networks", value: 28, color: "#f97316" },
        { label: "Deepfakes", value: 19, color: "#6366f1" },
        { label: "Organic Threats", value: 12, color: "#22d3ee" },
        { label: "Unknown Vectors", value: 7, color: "#94a3b8" },
      ],
      incidents: [
        { day: 2, impact: 40, label: "Bot surge" },
        { day: 5, impact: 65, label: "Deepfake attempt" },
        { day: 9, impact: 33, label: "Media rumor" },
        { day: 12, impact: 72, label: "Campaign escalation" },
        { day: 16, impact: 55, label: "Investor panic" },
      ],
      impactScores: [
        { label: "Brand Sentiment", value: 82, color: "#60a5fa" },
        { label: "Financial ROI", value: 68, color: "#22c55e" },
        { label: "Stakeholder Confidence", value: 74, color: "#f97316" },
      ],
      forecastBands: [
        { horizon: "30d", risk: 55, lower: 45, upper: 64 },
        { horizon: "60d", risk: 60, lower: 48, upper: 72 },
        { horizon: "90d", risk: 68, lower: 54, upper: 81 },
      ],
      executiveDistribution: [
        { role: "CEO Office", recipients: 2, color: "#3b82f6" },
        { role: "CFO Office", recipients: 3, color: "#22d3ee" },
        { role: "COO / Ops", recipients: 2, color: "#f97316" },
        { role: "CMO / Comms", recipients: 2, color: "#a855f7" },
        { role: "Risk & Compliance", recipients: 2, color: "#10b981" },
        { role: "Legal", recipients: 1, color: "#ef4444" },
      ],
    },
  };

  const advertisingBundles = {
    "brand-genaro": {
      spendOverTime: Array.from({ length: 12 }, (_, idx) => ({
        week: idx + 1,
        spend: 65 + rng() * 20,
        conversions: 38 + rng() * 12,
        sentiment: 48 + rng() * 8,
      })),
      channelMix: [
        { label: "Twitter", value: 34 },
        { label: "Meta", value: 28 },
        { label: "TikTok", value: 19 },
        { label: "LinkedIn", value: 12 },
        { label: "Other", value: 7 },
      ],
      narrativeCorrelation: [
        { narrative: "Sustainability", spend: 25, sentiment: 18 },
        { narrative: "Innovation", spend: 32, sentiment: 20 },
        { narrative: "Trust", spend: 18, sentiment: 11 },
        { narrative: "Crisis", spend: 15, sentiment: -9 },
      ],
      budgetMix: [
        { label: "Paid Media", value: 54 },
        { label: "Influencers", value: 21 },
        { label: "Owned", value: 15 },
        { label: "Earned", value: 10 },
      ],
    },
  };

  const dashboardTrends = {
    threat_index: [58, 60, 61, 63, 65, 66, 67],
    narratives_monitored: [19800, 20500, 21040, 21650, 22380, 23120, 23847],
  };

  class MockApiClient {
    async getNarrativeMetrics({ id, window = "24h", breakdown }) {
      await delay(60);
      const dataset = narrativeMetricsDb[id]?.[breakdown];
      if (!dataset) {
        throw new Error(`No mock narrative metrics for ${id} with breakdown=${breakdown}`);
      }
      return {
        narrative_id: id,
        window,
        metrics: dataset.metrics.map((metric) => ({
          kpi: metric.kpi,
          window,
          value: metric.value ?? average(metric.breakdown),
          breakdown: metric.breakdown,
        })),
      };
    }

    async getMetricsKpis({ kpi, window = "24h" }) {
      await delay(50);
      const dataset = aggregateMetrics[kpi];
      if (!dataset) {
        throw new Error(`No mock aggregate metrics for ${kpi}`);
      }
      return dataset.metrics.map((metric) => ({
        kpi: metric.kpi,
        window,
        value: metric.value ?? average(metric.breakdown),
        breakdown: metric.breakdown,
      }));
    }

    async getRiskSignals({ narrativeId }) {
      await delay(40);
      const graph = riskGraphs[narrativeId];
      if (!graph) {
        throw new Error(`No risk graph for narrative ${narrativeId}`);
      }
      return graph;
    }

    async getSandboxSimulation({ narrativeId }) {
      await delay(40);
      const sandbox = sandboxSimulations[narrativeId];
      if (!sandbox) {
        throw new Error(`No sandbox run for narrative ${narrativeId}`);
      }
      return sandbox;
    }

    async getExecutiveOverview({ narrativeId }) {
      await delay(40);
      const bundle = executiveBundles[narrativeId];
      if (!bundle) {
        throw new Error(`No executive bundle for narrative ${narrativeId}`);
      }
      return bundle;
    }

    async getAdvertisingPerformance({ entityId }) {
      await delay(40);
      const bundle = advertisingBundles[entityId];
      if (!bundle) {
        throw new Error(`No advertising bundle for entity ${entityId}`);
      }
      return bundle;
    }

    async getDashboardTrends() {
      await delay(25);
      return dashboardTrends;
    }
  }

  window.MockApiClient = new MockApiClient();

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
})();
