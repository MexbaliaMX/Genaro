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
  "nar-trump-ai-propaganda": {
    region_category: {
      metrics: [
        {
          kpi: "activity_index",
          breakdown: createBreakdown(
            [
              { region: "USA", category: "Politics", value: 89 },
              { region: "USA", category: "Media", value: 76 },
              { region: "Europe", category: "Politics", value: 54 },
              { region: "Europe", category: "Media", value: 43 },
              { region: "APAC", category: "Politics", value: 32 },
              { region: "APAC", category: "Media", value: 28 },
              { region: "LATAM", category: "Politics", value: 45 },
              { region: "LATAM", category: "Media", value: 38 }
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
              { date: "2025-11-06", value: 52 },
              { date: "2025-11-07", value: 58 },
              { date: "2025-11-08", value: 64 },
              { date: "2025-11-09", value: 69 },
              { date: "2025-11-10", value: 75 },
              { date: "2025-11-11", value: 82 },
              { date: "2025-11-12", value: 88 }
            ],
            ["date"]
          ),
        },
        {
          kpi: "origin_volume_synthetic",
          breakdown: createBreakdown(
            [
              { date: "2025-11-06", value: 24 },
              { date: "2025-11-07", value: 29 },
              { date: "2025-11-08", value: 35 },
              { date: "2025-11-09", value: 39 },
              { date: "2025-11-10", value: 42 },
              { date: "2025-11-11", value: 48 },
              { date: "2025-11-12", value: 54 }
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
              { platform: "Truth Social", value: 45 },
              { platform: "Twitter/X", value: 26 },
              { platform: "TikTok", value: 15 },
              { platform: "YouTube", value: 8 },
              { platform: "Gab", value: 6 }
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
              { hour: "2025-11-12T00:00:00Z", value: 48 },
              { hour: "2025-11-12T04:00:00Z", value: 45 },
              { hour: "2025-11-12T08:00:00Z", value: 51 },
              { hour: "2025-11-12T12:00:00Z", value: 55 },
              { hour: "2025-11-12T16:00:00Z", value: 52 },
              { hour: "2025-11-12T20:00:00Z", value: 49 },
              { hour: "2025-11-13T00:00:00Z", value: 47 }
            ],
            ["hour"]
          ),
        },
        {
          kpi: "sentiment_authentic",
          breakdown: createBreakdown(
            [
              { hour: "2025-11-12T00:00:00Z", value: 52 },
              { hour: "2025-11-12T04:00:00Z", value: 49 },
              { hour: "2025-11-12T08:00:00Z", value: 55 },
              { hour: "2025-11-12T12:00:00Z", value: 58 },
              { hour: "2025-11-12T16:00:00Z", value: 56 },
              { hour: "2025-11-12T20:00:00Z", value: 53 },
              { hour: "2025-11-13T00:00:00Z", value: 51 }
            ],
            ["hour"]
          ),
        },
        {
          kpi: "sentiment_synthetic",
          breakdown: createBreakdown(
            [
              { hour: "2025-11-12T00:00:00Z", value: 24 },
              { hour: "2025-11-12T04:00:00Z", value: 21 },
              { hour: "2025-11-12T08:00:00Z", value: 27 },
              { hour: "2025-11-12T12:00:00Z", value: 29 },
              { hour: "2025-11-12T16:00:00Z", value: 26 },
              { hour: "2025-11-12T20:00:00Z", value: 23 },
              { hour: "2025-11-13T00:00:00Z", value: 21 }
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
              { region: "USA", value: 89 },
              { region: "United Kingdom", value: 64 },
              { region: "Germany", value: 52 },
              { region: "Brazil", value: 46 },
              { region: "India", value: 38 }
            ],
            ["region"]
          ),
        },
        {
          kpi: "geo_trend_pct",
          breakdown: createBreakdown(
            [
              { region: "USA", value: 15 },
              { region: "United Kingdom", value: 8 },
              { region: "Germany", value: 6 },
              { region: "Brazil", value: 11 },
              { region: "India", value: 7 }
            ],
            ["region"]
          ),
        },
        {
          kpi: "geo_sentiment_shift",
          breakdown: createBreakdown(
            [
              { region: "USA", value: -12 },
              { region: "United Kingdom", value: 5 },
              { region: "Germany", value: 3 },
              { region: "Brazil", value: 8 },
              { region: "India", value: -4 }
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
  "nar-trump-ai-propaganda": {
    nodes: [
      { id: "trump-ai-01", role: "AI Creator", critical: true },
      { id: "trump-ai-02", role: "AI Creator", critical: false },
      { id: "media-117", role: "Echo Chamber", critical: false },
      { id: "media-204", role: "Echo Chamber", critical: true },
      { id: "media-322", role: "Echo Chamber", critical: false },
      { id: "bot-41", role: "Bot Amplifier", critical: false },
      { id: "bot-58", role: "Bot Amplifier", critical: false },
      { id: "bot-441", role: "Bot Amplifier", critical: false },
      { id: "syndicator-598", role: "Content Syndicator", critical: false },
    ],
    links: [
      { source: "trump-ai-01", target: "media-117", weight: 0.94 },
      { source: "trump-ai-01", target: "media-204", weight: 0.91 },
      { source: "trump-ai-01", target: "bot-41", weight: 0.72 },
      { source: "trump-ai-02", target: "media-322", weight: 0.81 },
      { source: "trump-ai-02", target: "bot-58", weight: 0.75 },
      { source: "bot-41", target: "bot-441", weight: 0.68 },
      { source: "bot-41", target: "syndicator-598", weight: 0.63 },
      { source: "bot-58", target: "bot-441", weight: 0.52 },
      { source: "media-204", target: "bot-441", weight: 0.45 },
    ],
    metadata: {
      event_id: "risk-2511-01",
      narrative_id: "nar-trump-ai-propaganda",
      risk_level: "high",
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
  "nar-trump-ai-propaganda": {
    network: {
      nodes: [
        { id: "trump-supporters", camp: "Supporter", influence: 9 },
        { id: "ai-content-producers", camp: "Supporter", influence: 7 },
        { id: "conspiracy-followers", camp: "Supporter", influence: 8 },
        { id: "moderate-republicans", camp: "Opposition", influence: 5 },
        { id: "mainstream-media-users", camp: "Opposition", influence: 6 },
        { id: "independent-voters", camp: "Neutral", influence: 4 },
      ],
      links: [
        { source: "trump-supporters", target: "conspiracy-followers", strength: 0.78 },
        { source: "trump-supporters", target: "ai-content-producers", strength: 0.72 },
        { source: "ai-content-producers", target: "conspiracy-followers", strength: 0.69 },
        { source: "moderate-republicans", target: "mainstream-media-users", strength: 0.61 },
        { source: "trump-supporters", target: "independent-voters", strength: 0.55 },
        { source: "mainstream-media-users", target: "independent-voters", strength: 0.45 },
      ],
    },
    segments: [
      { segment: "Far Right", engagement: 88, sentiment: 0.82 },
      { segment: "Moderate Republicans", engagement: 52, sentiment: 0.31 },
      { segment: "AI Enthusiasts", engagement: 79, sentiment: 0.75 },
      { segment: "Anti-AI Skeptics", engagement: 64, sentiment: -0.68 },
      { segment: "Conspiracy Theorists", engagement: 91, sentiment: 0.85 },
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
  "nar-trump-ai-propaganda": {
    threatRegions: [
      { region: "USA", score: 89, color: "#ef4444" },
      { region: "United Kingdom", score: 64, color: "#f97316" },
      { region: "Germany", score: 52, color: "#6366f1" },
      { region: "Brazil", score: 46, color: "#3b82f6" },
      { region: "India", score: 38, color: "#22d3ee" },
    ],
    categoryBreakdown: [
      { label: "AI-Generated Content", value: 42, color: "#ef4444" },
      { label: "Deepfakes/Misinformation", value: 31, color: "#f97316" },
      { label: "Echo Chambers", value: 18, color: "#6366f1" },
      { label: "Coordinated Campaigns", value: 12, color: "#22d3ee" },
      { label: "Organic Threats", value: 7, color: "#94a3b8" },
    ],
    incidents: [
      { day: 3, impact: 45, label: "AI-generated Obama arrest video" },
      { day: 7, impact: 68, label: "Truth Social propaganda surge" },
      { day: 11, impact: 52, label: "Synthetic media campaign" },
      { day: 14, impact: 76, label: "Grim Reaper government imagery" },
      { day: 18, impact: 58, label: "Counter narrative attempts" },
    ],
    impactScores: [
      { label: "Electoral Influence", value: 89, color: "#60a5fa" },
      { label: "Democratic Discourse", value: 45, color: "#ef4444" },
      { label: "Media Trust", value: 52, color: "#f97316" },
    ],
    forecastBands: [
      { horizon: "30d", risk: 72, lower: 65, upper: 78 },
      { horizon: "60d", risk: 78, lower: 70, upper: 85 },
      { horizon: "90d", risk: 84, lower: 75, upper: 92 },
    ],
    executiveDistribution: [
      { role: "White House", recipients: 4, color: "#3b82f6" },
      { role: "Election Security", recipients: 3, color: "#22d3ee" },
      { role: "Media Relations", recipients: 2, color: "#f97316" },
      { role: "Digital Strategy", recipients: 2, color: "#a855f7" },
      { role: "Legal", recipients: 2, color: "#10b981" },
      { role: "Crisis Management", recipients: 3, color: "#ef4444" },
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
  threat_index: [58, 60, 61, 63, 65, 66, 67, 72, 76, 81, 85, 88, 89],
  narratives_monitored: [19800, 20500, 21040, 21650, 22380, 23120, 23847, 24200, 24680, 25150, 25580, 26100, 26750],
  critical_alerts: [11, 13, 12, 15, 17, 16, 18, 22, 25, 28, 31, 34, 38],
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

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Export for use in modules
export { MockApiClient, mulberry32 };
export const mockApiService = new MockApiClient();