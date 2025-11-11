const BODY_DATA = document.body?.dataset || {};
const DATA_NARRATIVE_ID = BODY_DATA.narrativeId || "nar-global-ops";
const DATA_BRAND_ID = BODY_DATA.brandId || "brand-genaro";
const THREE_SRC = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
const SHOULD_REDUCE_MOTION = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
const ALLOWED_TOOLTIP_TAGS = new Set(["STRONG", "BR"]);
const NODE_TYPES = {
  ELEMENT: typeof Node !== "undefined" ? Node.ELEMENT_NODE : 1,
  COMMENT: typeof Node !== "undefined" ? Node.COMMENT_NODE : 8,
};
const ERROR_CONTAINER_MAP = {
  heatmap: ["dashboard-heatmap"],
  timeline: ["narrative-timeline"],
  platform: ["narrative-platform"],
  sentiment: ["narrative-sentiment"],
  geo: ["narrative-geo"],
  riskGraph: ["risk-network"],
  coordination: ["risk-coordination"],
  sandbox: ["sandbox-network", "sandbox-audience"],
  executive: ["exec-distribution", "exec-threatmap", "exec-categories", "exec-timeline", "exec-impact", "exec-forecast"],
  advertising: ["ads-spend-performance", "ads-channel", "ads-correlation", "ads-budget"],
};

function sanitizeTooltipHtml(html) {
  // Implementation to sanitize HTML content for tooltips
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const sanitized = sanitizeElement(doc.body);
    return sanitized.innerHTML;
  } else {
    // Fallback: basic sanitization
    const div = document.createElement('div');
    div.textContent = html;
    return div.textContent;
  }
}

function sanitizeElement(element) {
  for (let i = element.children.length - 1; i >= 0; i--) {
    const child = element.children[i];
    if (!ALLOWED_TOOLTIP_TAGS.has(child.tagName)) {
      child.remove();
    } else {
      sanitizeElement(child);
    }
  }
  return element;
}
const D3_CHART_KEYS = [
  "heatmap",
  "timeline",
  "platform",
  "sentiment",
  "geo",
  "riskGraph",
  "coordination",
  "sandbox",
  "executive",
  "advertising",
];

document.addEventListener("DOMContentLoaded", () => {
  initNarrativeGlobe();
  window.tippyInstances = [];

  const registerTooltip = (element, html) => {
    if (typeof tippy === "undefined") return;
    const sanitizedContent = sanitizeTooltipHtml(html);
    const instance = tippy(element, {
      content: sanitizedContent,
      allowHTML: true,
      theme: "custom",
      placement: "top",
      animation: "shift-away",
      appendTo: document.body,
    });
    window.tippyInstances.push(instance);
  };

  hydrateCharts(registerTooltip);
});

function cleanupTooltips() {
  if (typeof tippy !== "undefined" && window.tippyInstances) {
    window.tippyInstances.forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    window.tippyInstances = [];
  }
}

function initNarrativeGlobe() {
  const container = document.getElementById("dashboard-globe");
  if (!container) return;

  const renderGlobe = () => drawNarrativeGlobe();
  if (typeof THREE !== "undefined") {
    renderGlobe();
    return;
  }

  loadExternalScript(THREE_SRC).then(renderGlobe).catch(renderGlobe);
}

async function hydrateCharts(registerTooltip) {
  const api = window.MockApiClient;
  const hasElement = (id) => !!document.getElementById(id);
  const needs = {
    heatmap: hasElement("dashboard-heatmap"),
    timeline: hasElement("narrative-timeline"),
    platform: hasElement("narrative-platform"),
    sentiment: hasElement("narrative-sentiment"),
    geo: hasElement("narrative-geo"),
    riskGraph: hasElement("risk-network"),
    coordination: hasElement("risk-coordination"),
    sandbox: hasElement("sandbox-network") || hasElement("sandbox-audience"),
    executive: ["exec-distribution", "exec-threatmap", "exec-categories", "exec-timeline", "exec-impact", "exec-forecast"].some(hasElement),
    advertising: ["ads-spend-performance", "ads-channel", "ads-correlation", "ads-budget"].some(hasElement),
    trends: document.querySelectorAll("[data-sparkline]").length > 0,
  };

  if (!Object.values(needs).some(Boolean)) {
    return;
  }

  const hasD3 = typeof d3 !== "undefined";
  if (!hasD3) {
    const d3DependentNeeds = {};
    D3_CHART_KEYS.forEach((key) => {
      if (needs[key]) {
        d3DependentNeeds[key] = true;
        needs[key] = false;
      }
    });
    if (Object.keys(d3DependentNeeds).length) {
      console.warn("D3 library missing — chart rendering skipped");
      emitErrorStates(d3DependentNeeds, "Visualization library unavailable.");
    }
    if (!needs.trends) {
      return;
    }
  }

  if (!api) {
    console.warn("Mock API client missing — charts skipped");
    emitErrorStates(needs, "Simulation data unavailable.");
    return;
  }

  const dataStore = {};
  const failures = new Set();
  const pending = [];

  const markFailure = (key, error) => {
    failures.add(key);
    console.error(`Failed to load ${key} dataset`, error);
    emitErrorForKey(key, "Unable to load data.");
  };

  const enqueue = (key, promise) => {
    pending.push(
      promise
        .then((resp) => {
          dataStore[key] = resp;
        })
        .catch((error) => markFailure(key, error))
    );
  };

  if (needs.heatmap) {
    enqueue("heatmap", api.getNarrativeMetrics({ id: DATA_NARRATIVE_ID, window: "24h", breakdown: "region_category" }));
  }
  if (needs.timeline) {
    enqueue("timeline", api.getNarrativeMetrics({ id: DATA_NARRATIVE_ID, window: "7d", breakdown: "origin_daily" }));
  }
  if (needs.platform) {
    enqueue("platform", api.getNarrativeMetrics({ id: DATA_NARRATIVE_ID, window: "24h", breakdown: "platform" }));
  }
  if (needs.sentiment) {
    enqueue("sentiment", api.getNarrativeMetrics({ id: DATA_NARRATIVE_ID, window: "24h", breakdown: "sentiment_hour" }));
  }
  if (needs.geo) {
    enqueue("geo", api.getNarrativeMetrics({ id: DATA_NARRATIVE_ID, window: "24h", breakdown: "geo" }));
  }
  if (needs.coordination) {
    enqueue("coordination", api.getMetricsKpis({ kpi: "coordination_index", window: "24h" }));
  }
  if (needs.riskGraph) {
    enqueue("riskGraph", api.getRiskSignals({ narrativeId: DATA_NARRATIVE_ID }));
  }
  if (needs.sandbox) {
    enqueue("sandbox", api.getSandboxSimulation({ narrativeId: DATA_NARRATIVE_ID }));
  }
  if (needs.executive) {
    enqueue("executive", api.getExecutiveOverview({ narrativeId: DATA_NARRATIVE_ID }));
  }
  if (needs.advertising) {
    enqueue("advertising", api.getAdvertisingPerformance({ entityId: DATA_BRAND_ID }));
  }
  if (needs.trends) {
    enqueue("trends", api.getDashboardTrends());
  }

  await Promise.all(pending);

  const drawIfReady = (key, handler) => {
    if (!needs[key]) return;
    if (dataStore[key]) {
      handler(dataStore[key]);
    } else if (!failures.has(key)) {
      emitErrorForKey(key, "No data available.");
    }
  };

  drawIfReady("heatmap", (resp) => drawDashboardHeatmap(registerTooltip, mapHeatmapData(resp)));
  drawIfReady("timeline", (resp) => drawNarrativeTimeline(registerTooltip, mapOriginTimeline(resp)));
  drawIfReady("platform", (resp) => drawNarrativePlatform(registerTooltip, mapPlatformShare(resp)));
  drawIfReady("sentiment", (resp) => drawNarrativeSentiment(registerTooltip, mapSentimentSeries(resp)));
  drawIfReady("geo", (resp) => drawNarrativeGeo(registerTooltip, mapGeoBreakdown(resp)));
  drawIfReady("riskGraph", (resp) => drawRiskNetwork(registerTooltip, resp));
  drawIfReady("coordination", (resp) => drawRiskCoordination(registerTooltip, mapCoordinationSeries(resp)));
  drawIfReady("sandbox", (resp) => drawSandboxNetwork(registerTooltip, resp));
  drawIfReady("executive", (resp) => drawExecutiveCharts(registerTooltip, resp));
  drawIfReady("advertising", (resp) => drawAdvertisingCharts(registerTooltip, resp));
  drawIfReady("trends", (resp) => renderDashboardTrends(resp));
}

function clearChart(container) {
  const el = document.getElementById(container);
  if (!el) return null;
  el.innerHTML = "";
  return el;
}

function drawNarrativeGlobe() {
  const container = document.getElementById("dashboard-globe");
  const fallback = container?.querySelector("[data-globe-fallback]");
  if (!container) return;
  if (typeof THREE === "undefined" || !webglAvailable()) {
    if (fallback) {
      fallback.hidden = false;
      const fallbackId = fallback.id || "dashboard-globe-fallback";
      container.setAttribute("role", "region");
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-describedby", fallbackId);
    }
    return;
  }

  container.innerHTML = "";
  container.setAttribute("role", "img");
  container.setAttribute("aria-live", "off");
  container.setAttribute("aria-labelledby", "dashboard-globe-title");
  container.removeAttribute("aria-describedby");
  const width = container.clientWidth || 420;
  const height = container.clientHeight || 320;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 160;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1.5);
  container.appendChild(renderer.domElement);

  const globeGeometry = new THREE.SphereGeometry(55, 48, 48);
  const globeMaterial = new THREE.MeshBasicMaterial({
    color: 0x1f293b,
    wireframe: true,
    opacity: 0.35,
    transparent: true,
  });
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 750;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color = new THREE.Color();
  for (let i = 0; i < particleCount; i++) {
    const lat = THREE.MathUtils.degToRad(Math.random() * 180 - 90);
    const lon = THREE.MathUtils.degToRad(Math.random() * 360);
    const radius = 60 + Math.random() * 6;

    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const activity = Math.random();
    color.setHSL(0.56 - activity * 0.25, 0.7, 0.5 + activity * 0.2);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    opacity: 0.85,
    transparent: true,
  });

  const points = new THREE.Points(particleGeometry, material);
  scene.add(points);

  const haloGeometry = new THREE.SphereGeometry(62, 32, 32);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x667eea,
    transparent: true,
    opacity: 0.12,
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  scene.add(halo);

  let animationFrameId = null;
  let isPaused = false;

  const renderFrame = () => renderer.render(scene, camera);

  if (!SHOULD_REDUCE_MOTION) {
    const animate = () => {
      if (isPaused) return;
      globe.rotation.y += 0.0009;
      points.rotation.y += 0.0014;
      halo.rotation.y += 0.0006;
      renderFrame();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (isPaused) {
        isPaused = false;
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
  } else {
    renderFrame();
  }

  const handleResize = () => {
    const newWidth = container.clientWidth || width;
    const newHeight = container.clientHeight || height;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  };

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
  } else {
    window.addEventListener("resize", handleResize);
  }
}

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

function drawDashboardHeatmap(registerTooltip, data) {
  const container = clearChart("dashboard-heatmap");
  if (!container || !data?.length) return;

  const categories = [...new Set(data.map((d) => d.category))];
  const regions = [...new Set(data.map((d) => d.region))];
  const width = container.clientWidth || 480;
  const height = container.clientHeight || 320;
  const margin = { top: 30, right: 20, bottom: 45, left: 120 };

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const xScale = d3
    .scaleBand()
    .domain(categories)
    .range([margin.left, width - margin.right])
    .padding(0.12);

  const yScale = d3
    .scaleBand()
    .domain(regions)
    .range([margin.top, height - margin.bottom])
    .padding(0.18);

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) || 100])
    .range(["#38bdf8", "#ef4444"]);

  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => xScale(d.category))
    .attr("y", (d) => yScale(d.region))
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.value))
    .attr("opacity", 0.9)
    .each(function (d) {
      registerTooltip?.(this, `<strong>${d.region}</strong><br>${d.category}<br>Activity Index: ${d.value}`);
    });

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(d3.axisLeft(yScale).tickSize(0))
    .selectAll("text")
    .style("font-size", "12px");

  const topCell = data.reduce((best, cell) => (cell.value > best.value ? cell : best), data[0]);
  setChartSummary(
    "dashboard-heatmap",
    `Highest activity in ${topCell.region} for ${topCell.category} with index ${topCell.value}.`
  );
}

function drawNarrativeTimeline(registerTooltip, data) {
  const container = clearChart("narrative-timeline");
  if (!container || !data?.length) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 220;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const parsed = data.map((d) => ({ ...d, date: new Date(d.date) }));

  const x = d3
    .scaleTime()
    .domain(d3.extent(parsed, (d) => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(parsed, (d) => Math.max(d.synthetic, d.organic)) * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const lineBuilder = (key, color, dashArray = null) =>
    d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d[key]))
      .curve(d3.curveMonotoneX);

  const organicLine = lineBuilder("organic", "#60a5fa");
  const syntheticLine = lineBuilder("synthetic", "#ef4444");

  svg
    .append("path")
    .datum(parsed)
    .attr("fill", "none")
    .attr("stroke", "#60a5fa")
    .attr("stroke-width", 2)
    .attr("d", organicLine);

  svg
    .append("path")
    .datum(parsed)
    .attr("fill", "none")
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "6 3")
    .attr("d", syntheticLine);

  const timelinePoints = svg
    .selectAll(".point")
    .data(
      parsed.flatMap((d) => [
        { ...d, type: "Organic", value: d.organic, color: "#60a5fa" },
        { ...d, type: "Synthetic", value: d.synthetic, color: "#ef4444" },
      ])
    )
    .join("circle")
    .attr("cx", (d) => x(d.date))
    .attr("cy", (d) => y(d.value))
    .attr("r", 4)
    .attr("fill", (d) => d.color);

  timelinePoints.each(function (d) {
    registerTooltip?.(
      this,
      `<strong>${d.date.toISOString().slice(0, 10)}</strong><br>${d.type}: ${d.value}`
    );
  });

  const formatDate = d3.timeFormat("%b %d");

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(d3.axisBottom(x).ticks(6).tickFormat(formatDate).tickSize(0))
    .selectAll("text")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.3)")
    .call(d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right))
    .selectAll("text")
    .style("font-size", "11px");

  const latest = parsed[parsed.length - 1];
  setChartSummary(
    "narrative-timeline",
    `Latest organic mentions ${latest.organic} versus synthetic ${latest.synthetic} on ${formatDate(latest.date)}.`
  );
}

function drawNarrativePlatform(registerTooltip, data) {
  const container = clearChart("narrative-platform");
  if (!container || !data?.length) return;

  const width = container.clientWidth || 220;
  const height = container.clientHeight || 220;
  const radius = Math.min(width, height) / 2 - 10;
  const palette = ["#60a5fa", "#818cf8", "#c084fc", "#22d3ee", "#f97316"];
  const colored = data.map((d, index) => ({ ...d, color: palette[index % palette.length] }));

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true")
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie().value((d) => d.value);
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

  const slices = svg
    .selectAll("path")
    .data(pie(colored))
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => d.data.color)
    .attr("stroke", "rgba(15,23,42,0.9)")
    .attr("stroke-width", 2);

  slices.each(function (d) {
    registerTooltip?.(this, `<strong>${d.data.label}</strong><br>${d.data.value}% share`);
  });

  svg
    .selectAll("text")
    .data(pie(colored))
    .join("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("fill", "#f8fafc")
    .attr("font-size", "11px")
    .text((d) => `${d.data.value}%`);

  const sortedPlatforms = [...data].sort((a, b) => b.value - a.value);
  if (sortedPlatforms.length) {
    setChartSummary(
      "narrative-platform",
      `Top platforms: ${sortedPlatforms[0].label} ${sortedPlatforms[0].value}% and ${
        sortedPlatforms[1]?.label ?? "others"
      }.`
    );
  }
}

function drawNarrativeSentiment(registerTooltip, data) {
  const container = clearChart("narrative-sentiment");
  if (!container || !data?.length) return;

  const width = container.clientWidth || 480;
  const height = container.clientHeight || 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const parsed = data.map((d) => ({ ...d, hour: new Date(d.hour) }));

  const x = d3
    .scaleTime()
    .domain(d3.extent(parsed, (d) => d.hour))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);
  const seriesDefs = [
    { key: "overall", color: "#38bdf8", label: "Overall" },
    { key: "authentic", color: "#10b981", label: "Authentic" },
    { key: "synthetic", color: "#ef4444", label: "Synthetic" },
  ];

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  seriesDefs.forEach((series) => {
    const line = d3
      .line()
      .x((d) => x(d.hour))
      .y((d) => y(d[series.key]))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", series.color)
      .attr("stroke-width", 2)
      .attr("d", line);
  });

  svg
    .selectAll(".sentiment-point")
    .data(parsed)
    .join("circle")
    .attr("class", "sentiment-point")
    .attr("cx", (d) => x(d.hour))
    .attr("cy", (d) => y(d.overall))
    .attr("r", 3)
    .attr("fill", "#38bdf8")
    .attr("opacity", 0.7)
    .each(function (d) {
      registerTooltip?.(
        this,
        `<strong>${d.hour.toISOString()}</strong><br>Overall: ${d.overall.toFixed(1)}<br>Authentic: ${d.authentic.toFixed(1)}<br>Synthetic: ${d.synthetic.toFixed(1)}`
      );
    });

  const formatHour = d3.timeFormat("%H:%M");

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(d3.axisBottom(x).ticks(6).tickFormat(formatHour).tickSize(0))
    .selectAll("text")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.3)")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right))
    .selectAll("text")
    .style("font-size", "11px");

  const latest = parsed[parsed.length - 1];
  setChartSummary(
    "narrative-sentiment",
    `Overall sentiment at ${formatHour(latest.hour)} is ${latest.overall.toFixed(
      1
    )}; authentic ${latest.authentic.toFixed(1)}, synthetic ${latest.synthetic.toFixed(1)}.`
  );
}

function drawNarrativeGeo(registerTooltip, regions) {
  const container = clearChart("narrative-geo");
  if (!container || !regions?.length) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 120 };

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const y = d3
    .scaleBand()
    .domain(regions.map((d) => d.name))
    .range([margin.top, height - margin.bottom])
    .padding(0.35);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(regions, (d) => d.intensity) * 1.1])
    .range([margin.left, width - margin.right]);

  const color = d3.scaleLinear().domain([0, 80]).range(["rgba(96,165,250,0.25)", "rgba(239,68,68,0.65)"]);

  const bars = svg
    .selectAll("rect")
    .data(regions)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.name))
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("width", (d) => x(d.intensity) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => color(d.intensity));

  svg
    .selectAll(".geo-label")
    .data(regions)
    .join("text")
    .attr("class", "geo-label")
    .attr("x", x(0) - 16)
    .attr("y", (d) => y(d.name) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", "end")
    .attr("fill", "rgba(226,232,240,0.85)")
    .attr("font-size", "13px")
    .text((d) => d.name);

  svg
    .selectAll(".geo-value")
    .data(regions)
    .join("text")
    .attr("class", "geo-value")
    .attr("x", (d) => x(d.intensity) + 8)
    .attr("y", (d) => y(d.name) + y.bandwidth() / 2 + 4)
    .attr("fill", "rgba(148,163,184,0.9)")
    .attr("font-size", "12px")
    .text((d) => `${d.intensity} idx`);

  bars.each(function (d) {
    registerTooltip?.(
      this,
      `<strong>${d.name}</strong><br>Intensity Index: ${d.intensity}<br>Trend: ${d.trendPct}%<br>Sentiment shift: ${d.sentimentShift}`
    );
  });

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(d3.axisBottom(x).ticks(5).tickSize(0))
    .selectAll("text")
    .style("font-size", "11px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.3)")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .remove();

  const leader = regions.reduce((best, region) => (region.intensity > best.intensity ? region : best), regions[0]);
  setChartSummary(
    "narrative-geo",
    `Strongest regional intensity in ${leader.name} (${leader.intensity} index).`
  );
}

function drawRiskNetwork(registerTooltip, graphData) {
  const container = clearChart("risk-network");
  if (!container || !graphData?.nodes?.length) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 220;
  const { nodes, links } = graphData;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const simulation = d3
    .forceSimulation(nodes.map((node) => ({ ...node })))
    .force(
      "link",
      d3.forceLink(links.map((link) => ({ ...link })))
        .id((d) => d.id)
        .distance(80)
    )
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .attr("stroke", "rgba(148,163,184,0.25)")
    .attr("stroke-width", 1.2)
    .selectAll("line")
    .data(simulation.force("link").links())
    .join("line");

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(simulation.nodes())
    .join("circle")
    .attr("r", (d) => (d.role === "Commander" ? 8 : 5))
    .attr("fill", (d) => (d.role === "Commander" ? "#ef4444" : "#60a5fa"))
    .attr("stroke", "rgba(15,23,42,0.8)")
    .attr("stroke-width", 1.5)
    .each(function (d) {
      registerTooltip?.(
        this,
        `<strong>${d.id}</strong><br>Role: ${d.role}<br>${d.critical ? "Critical" : "Peripheral"}`
      );
    })
    .call(
      d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

  const updatePositions = () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  };

  if (SHOULD_REDUCE_MOTION) {
    for (let i = 0; i < 40; i++) {
      simulation.tick();
    }
    updatePositions();
    simulation.stop();
  } else {
    simulation.on("tick", updatePositions);
  }
}

function drawRiskCoordination(registerTooltip, series) {
  const container = clearChart("risk-coordination");
  if (!container || !series?.length) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 220;
  const margin = { top: 25, right: 20, bottom: 40, left: 45 };

  const x = d3
    .scaleBand()
    .domain(series.map((d) => d.hour))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d.value) || 100])
    .range([height - margin.bottom, margin.top]);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  svg
    .selectAll("rect")
    .data(series)
    .join("rect")
    .attr("x", (d) => x(d.hour))
    .attr("y", (d) => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(d.value))
    .attr("fill", "#f97316")
    .attr("opacity", 0.85)
    .each(function (d) {
      registerTooltip?.(this, `<strong>${d.hour}:00</strong><br>Coordination index: ${d.value}`);
    });

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(d3.axisBottom(x).tickValues([0, 6, 12, 18, 23]).tickFormat((d) => `${d}h`).tickSize(0))
    .selectAll("text")
    .style("font-size", "11px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.3)")
    .call(d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right))
    .selectAll("text")
    .style("font-size", "11px");

  const peak = series.reduce((best, row) => (row.value > best.value ? row : best), series[0]);
  setChartSummary("risk-coordination", `Peak coordination index ${peak.value} at hour ${peak.hour}.`);
}

function drawSandboxNetwork(registerTooltip, sandboxData) {
  const container = clearChart("sandbox-network");
  if (!container || !sandboxData?.network?.nodes?.length) return;

  const width = container.clientWidth || 520;
  const height = container.clientHeight || 360;
  const { nodes, links } = sandboxData.network;

  const color = d3
    .scaleOrdinal()
    .domain(["Our", "Opposition", "Neutral"])
    .range(["#3b82f6", "#ef4444", "#94a3b8"]);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const simulation = d3
    .forceSimulation(nodes.map((node) => ({ ...node })))
    .force(
      "link",
      d3.forceLink(links.map((link) => ({ ...link })))
        .id((d) => d.id)
        .distance(80)
        .strength((d) => (d.strength || 0.5) * 0.6)
    )
    .force("charge", d3.forceManyBody().strength(-180))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .attr("stroke", "rgba(148,163,184,0.25)")
    .attr("stroke-width", 1)
    .selectAll("line")
    .data(simulation.force("link").links())
    .join("line");

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(simulation.nodes())
    .join("circle")
    .attr("r", (d) => d.influence || 6)
    .attr("fill", (d) => color(d.camp))
    .attr("stroke", "rgba(15,23,42,0.8)")
    .attr("stroke-width", 1.4)
    .each(function (d) {
      registerTooltip?.(
        this,
        `<strong>${d.id}</strong><br>Segment: ${d.camp}<br>Influence: ${d.influence?.toFixed(1) ?? "n/a"}`
      );
    });

  const updateSandboxPositions = () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  };

  if (SHOULD_REDUCE_MOTION) {
    for (let i = 0; i < 40; i++) {
      simulation.tick();
    }
    updateSandboxPositions();
    simulation.stop();
  } else {
    simulation.on("tick", updateSandboxPositions);
  }

  const audienceContainer = clearChart("sandbox-audience");
  if (audienceContainer && sandboxData.segments?.length) {
    const width = audienceContainer.clientWidth || 280;
    const height = audienceContainer.clientHeight || 220;
    const margin = { top: 20, right: 20, bottom: 30, left: 60 };

    const segments = sandboxData.segments;
    const y = d3
      .scaleBand()
      .domain(segments.map((d) => d.segment))
      .range([margin.top, height - margin.bottom])
      .padding(0.25);
    const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    const colorScale = d3.scaleSequential().domain([-0.3, 0.7]).interpolator(d3.interpolateRdYlGn);

    const svg = d3
      .select(audienceContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .selectAll("rect")
      .data(segments)
      .join("rect")
      .attr("x", margin.left + 2)
      .attr("y", (d) => y(d.segment))
      .attr("width", (d) => Math.max(4, x(d.engagement) - margin.left))
      .attr("height", y.bandwidth())
      .attr("rx", 8)
      .attr("fill", (d) => colorScale(d.sentiment))
      .each(function (d) {
        registerTooltip?.(
          this,
          `<strong>${d.segment}</strong><br>Engagement: ${d.engagement}%<br>Sentiment: ${(d.sentiment * 100).toFixed(0)}%`
        );
      });

    svg
      .selectAll("circle")
      .data(segments)
      .join("circle")
      .attr("cx", (d) => x(d.engagement))
      .attr("cy", (d) => y(d.segment) + y.bandwidth() / 2)
      .attr("r", 6)
      .attr("fill", "#0ea5e9")
      .attr("stroke", "rgba(15,23,42,0.85)")
      .attr("stroke-width", 1.2);

    svg
      .selectAll("text")
      .data(segments)
      .join("text")
      .attr("x", margin.left - 8)
      .attr("y", (d) => y(d.segment) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .attr("fill", "rgba(148,163,184,0.9)")
      .attr("font-size", "12px")
      .text((d) => d.segment);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(d3.axisBottom(x).tickValues([0, 25, 50, 75, 100]).tickFormat((d) => `${d}%`).tickSize(0))
      .selectAll("text")
      .style("font-size", "11px");
  }
}

function drawExecutiveCharts(registerTooltip, data) {
  if (!data) return;
  const { executiveDistribution, threatRegions, categoryBreakdown, incidents, impactScores, forecastBands } = data;

  const distributionContainer = clearChart("exec-distribution");
  if (distributionContainer && executiveDistribution?.length) {
    const width = distributionContainer.clientWidth || 320;
    const height = distributionContainer.clientHeight || 200;
    const radius = Math.min(width, height) / 2 - 12;

    const svg = d3
      .select(distributionContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.recipients);
    const arc = d3.arc().innerRadius(radius * 0.45).outerRadius(radius);

    svg
      .selectAll("path")
      .data(pie(executiveDistribution))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d.data.color || ["#3b82f6", "#22d3ee", "#f97316", "#a855f7", "#10b981", "#ef4444"][i % 6])
      .attr("stroke", "rgba(15,23,42,0.85)")
      .attr("stroke-width", 1.2)
      .each(function (d) {
        registerTooltip?.(
          this,
          `<strong>${d.data.role}</strong><br>Recipients: ${d.data.recipients}`
        );
      });

    svg
      .selectAll("text")
      .data(pie(executiveDistribution))
      .join("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#f1f5f9")
      .attr("font-size", "11px")
      .text((d) => d.data.recipients);

    const distributionLeader = executiveDistribution.reduce((best, entry) =>
      entry.recipients > best.recipients ? entry : best
    );
    setChartSummary(
      "exec-distribution",
      `${distributionLeader.role} received the most briefings (${distributionLeader.recipients}).`
    );
  }

  const threatContainer = clearChart("exec-threatmap");
  if (threatContainer && threatRegions?.length) {
    const width = threatContainer.clientWidth || 320;
    const height = threatContainer.clientHeight || 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const x = d3
      .scaleBand()
      .domain(threatRegions.map((d) => d.region))
      .range([margin.left, width - margin.right])
      .padding(0.35);
    const y = d3.scaleLinear().domain([0, d3.max(threatRegions, (d) => d.score)]).range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(threatContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .selectAll("rect")
      .data(threatRegions)
      .join("rect")
      .attr("x", (d) => x(d.region))
      .attr("y", (d) => y(d.score))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.score))
      .attr("rx", 10)
      .attr("fill", (d) => d.color || "#3b82f6")
      .each(function (d) {
        registerTooltip?.(this, `<strong>${d.region}</strong><br>Threat score: ${d.score}`);
      });

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .style("font-size", "11px");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("color", "rgba(148,163,184,0.3)")
      .call(d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right))
      .selectAll("text")
      .style("font-size", "11px");

    const criticalRegion = threatRegions.reduce((best, region) => (region.score > best.score ? region : best), threatRegions[0]);
    setChartSummary("exec-threatmap", `${criticalRegion.region} has the highest threat score (${criticalRegion.score}).`);
  }

  const categoryContainer = clearChart("exec-categories");
  if (categoryContainer && categoryBreakdown?.length) {
    const width = categoryContainer.clientWidth || 320;
    const height = categoryContainer.clientHeight || 220;
    const radius = Math.min(width, height) / 2 - 12;

    const svg = d3
      .select(categoryContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(radius * 0.45).outerRadius(radius);
    const fallbackColors = ["#ef4444", "#f97316", "#6366f1", "#22d3ee", "#94a3b8", "#10b981"];
    const slices = svg
      .selectAll("path")
      .data(pie(categoryBreakdown))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d.data.color || fallbackColors[i % fallbackColors.length])
      .attr("stroke", "rgba(15,23,42,0.85)")
      .attr("stroke-width", 1.5);

    slices.each(function (d) {
      registerTooltip?.(this, `<strong>${d.data.label}</strong><br>${d.data.value}% of threats`);
    });

    const leadCategory = categoryBreakdown.reduce((best, cat) => (cat.value > best.value ? cat : best), categoryBreakdown[0]);
    setChartSummary("exec-categories", `${leadCategory.label} accounts for ${leadCategory.value}% of tracked threats.`);
  }

  const timelineContainer = clearChart("exec-timeline");
  if (timelineContainer && incidents?.length) {
    const width = timelineContainer.clientWidth || 320;
    const height = timelineContainer.clientHeight || 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const x = d3.scaleLinear().domain([0, d3.max(incidents, (d) => d.day)]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(incidents, (d) => d.impact)]).range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(timelineContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    const line = d3
      .line()
      .x((d) => x(d.day))
      .y((d) => y(d.impact))
      .curve(d3.curveStepAfter);

    svg
      .append("path")
      .datum(incidents)
      .attr("fill", "none")
      .attr("stroke", "#f97316")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .selectAll("circle")
      .data(incidents)
      .join("circle")
      .attr("cx", (d) => x(d.day))
      .attr("cy", (d) => y(d.impact))
      .attr("r", 5)
      .attr("fill", "#f97316")
      .each(function (d) {
        registerTooltip?.(this, `<strong>Day ${d.day}</strong><br>${d.label}<br>Impact score: ${d.impact}`);
      });

    const largestIncident = incidents.reduce((best, entry) => (entry.impact > best.impact ? entry : best), incidents[0]);
    setChartSummary(
      "exec-timeline",
      `${largestIncident.label} on day ${largestIncident.day} recorded highest impact (${largestIncident.impact}).`
    );
  }

  const impactContainer = clearChart("exec-impact");
  if (impactContainer && impactScores?.length) {
    const width = impactContainer.clientWidth || 320;
    const height = impactContainer.clientHeight || 220;
    const margin = { top: 25, right: 20, bottom: 40, left: 55 };

    const x = d3
      .scaleBand()
      .domain(impactScores.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.35);
    const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(impactContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .selectAll("rect")
      .data(impactScores)
      .join("rect")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.value))
      .attr("rx", 10)
      .attr("fill", (d) => d.color)
      .each(function (d) {
        registerTooltip?.(this, `<strong>${d.label}</strong><br>Score: ${d.value}`);
      });

    const axisX = d3.axisBottom(x).tickSize(0);
    const axisY = d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(axisX)
      .selectAll("text")
      .style("font-size", "11px");
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("color", "rgba(148,163,184,0.3)")
      .call(axisY)
      .selectAll("text")
      .style("font-size", "11px");

    const topImpact = impactScores.reduce((best, metric) => (metric.value > best.value ? metric : best), impactScores[0]);
    setChartSummary("exec-impact", `${topImpact.label} leads impact measures at ${topImpact.value}.`);
  }

  const forecastContainer = clearChart("exec-forecast");
  if (forecastContainer && forecastBands?.length) {
    const width = forecastContainer.clientWidth || 320;
    const height = forecastContainer.clientHeight || 220;
    const margin = { top: 25, right: 20, bottom: 35, left: 55 };

    const x = d3
      .scalePoint()
      .domain(forecastBands.map((d) => d.horizon))
      .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(forecastContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .append("path")
      .datum(forecastBands)
      .attr("fill", "rgba(96,165,250,0.18)")
      .attr("stroke", "none")
      .attr(
        "d",
        d3
          .area()
          .x((d) => x(d.horizon))
          .y0((d) => y(d.lower))
          .y1((d) => y(d.upper))
      );

    svg
      .append("path")
      .datum(forecastBands)
      .attr("fill", "none")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.horizon))
          .y((d) => y(d.risk))
          .curve(d3.curveMonotoneX)
      );

    svg
      .selectAll("circle")
      .data(forecastBands)
      .join("circle")
      .attr("cx", (d) => x(d.horizon))
      .attr("cy", (d) => y(d.risk))
      .attr("r", 5)
      .attr("fill", "#60a5fa")
      .each(function (d) {
        registerTooltip?.(this, `<strong>${d.horizon}</strong><br>Risk: ${d.risk}<br>Range: ${d.lower} – ${d.upper}`);
      });

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .style("font-size", "11px");
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("color", "rgba(148,163,184,0.3)")
      .call(d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right))
      .selectAll("text")
      .style("font-size", "11px");

    const riskiest = forecastBands.reduce((best, entry) => (entry.risk > best.risk ? entry : best), forecastBands[0]);
    setChartSummary("exec-forecast", `${riskiest.horizon} horizon has the highest risk score (${riskiest.risk}).`);
  }
}

function drawAdvertisingCharts(registerTooltip, data) {
  if (!data) return;
  const { spendOverTime, channelMix, narrativeCorrelation, budgetMix } = data;

  const spendPerformance = clearChart("ads-spend-performance");
  if (spendPerformance && spendOverTime?.length) {
    const width = spendPerformance.clientWidth || 520;
    const height = spendPerformance.clientHeight || 320;
    const margin = { top: 30, right: 30, bottom: 45, left: 55 };

    const x = d3
      .scaleLinear()
      .domain([1, spendOverTime.length])
      .range([margin.left, width - margin.right]);
    const yLeft = d3.scaleLinear().domain([0, d3.max(spendOverTime, (d) => Math.max(d.spend, d.conversions)) * 1.2]).range([height - margin.bottom, margin.top]);
    const yRight = d3.scaleLinear().domain([0, d3.max(spendOverTime, (d) => d.sentiment) * 1.2]).range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(spendPerformance)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .append("path")
      .datum(spendOverTime)
      .attr("fill", "rgba(96,165,250,0.15)")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .area()
          .x((d) => x(d.week))
          .y0(yLeft(0))
          .y1((d) => yLeft(d.spend))
          .curve(d3.curveMonotoneX)
      );

    const lineConversions = d3
      .line()
      .x((d) => x(d.week))
      .y((d) => yLeft(d.conversions))
      .curve(d3.curveMonotoneX);

    const lineSentiment = d3
      .line()
      .x((d) => x(d.week))
      .y((d) => yRight(d.sentiment))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(spendOverTime)
      .attr("fill", "none")
      .attr("stroke", "#f97316")
      .attr("stroke-width", 2)
      .attr("d", lineConversions);

    svg
      .append("path")
      .datum(spendOverTime)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6 3")
      .attr("d", lineSentiment);

    svg
      .selectAll(".point-spend")
      .data(spendOverTime)
      .join("circle")
      .attr("class", "point-spend")
      .attr("cx", (d) => x(d.week))
      .attr("cy", (d) => yLeft(d.conversions))
      .attr("r", 4)
      .attr("fill", "#f97316")
      .each(function (d) {
        registerTooltip?.(
          this,
          `<strong>Week ${d.week}</strong><br>Spend: ${d.spend.toFixed(1)}k<br>Conversions: ${d.conversions.toFixed(1)}k<br>Sentiment: ${d.sentiment.toFixed(1)} pts`
        );
      });

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(d3.axisBottom(x).ticks(spendOverTime.length).tickFormat((d) => `W${d}`))
      .selectAll("text")
      .style("font-size", "11px");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(d3.axisLeft(yLeft).ticks(5).tickFormat((d) => `${d}k`))
      .selectAll("text")
      .style("font-size", "11px");

    svg
      .append("g")
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(d3.axisRight(yRight).ticks(5))
      .selectAll("text")
      .style("font-size", "11px");

    const latestWeek = spendOverTime[spendOverTime.length - 1];
    setChartSummary(
      "ads-spend-performance",
      `Week ${latestWeek.week} spend ${latestWeek.spend.toFixed(1)}k with conversions ${latestWeek.conversions.toFixed(
        1
      )}k and sentiment ${latestWeek.sentiment.toFixed(1)}.`
    );
  }

  const channelContainer = clearChart("ads-channel");
  if (channelContainer && channelMix?.length) {
    const width = channelContainer.clientWidth || 260;
    const height = channelContainer.clientHeight || 200;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = d3
      .select(channelContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    const slices = svg
      .selectAll("path")
      .data(pie(channelMix))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d3.schemeTableau10[i % 10])
      .attr("stroke", "rgba(15,23,42,0.85)")
      .attr("stroke-width", 1.5);

    slices.each(function (d) {
      registerTooltip?.(this, `<strong>${d.data.label}</strong><br>${d.data.value}% of spend`);
    });
  }

  const corrContainer = clearChart("ads-correlation");
  if (corrContainer && narrativeCorrelation?.length) {
    const width = corrContainer.clientWidth || 260;
    const height = corrContainer.clientHeight || 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 45 };

    const x = d3.scaleLinear().domain([0, d3.max(narrativeCorrelation, (d) => d.spend) * 1.2]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([d3.min(narrativeCorrelation, (d) => d.sentiment) - 5, d3.max(narrativeCorrelation, (d) => d.sentiment) + 5]).range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(corrContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .selectAll("circle")
      .data(narrativeCorrelation)
      .join("circle")
      .attr("cx", (d) => x(d.spend))
      .attr("cy", (d) => y(d.sentiment))
      .attr("r", 8)
      .attr("fill", (d) => (d.sentiment >= 0 ? "#22c55e" : "#ef4444"))
      .attr("opacity", 0.85)
      .each(function (d) {
        registerTooltip?.(this, `<strong>${d.narrative}</strong><br>Spend: ${d.spend}k<br>Sentiment shift: ${d.sentiment}`);
      });

    const strongest = narrativeCorrelation.reduce((best, entry) =>
      entry.sentiment > best.sentiment ? entry : best
    );
    setChartSummary(
      "ads-correlation",
      `${strongest.narrative} shows the largest positive sentiment shift (${strongest.sentiment}) at spend ${strongest.spend}k.`
    );
  }

  const budgetContainer = clearChart("ads-budget");
  if (budgetContainer && budgetMix?.length) {
    const width = budgetContainer.clientWidth || 260;
    const height = budgetContainer.clientHeight || 200;
    const margin = { top: 30, right: 20, bottom: 35, left: 60 };

    const y = d3
      .scaleBand()
      .domain(budgetMix.map((d) => d.label))
      .range([margin.top, height - margin.bottom])
      .padding(0.3);
    const x = d3.scaleLinear().domain([0, d3.max(budgetMix, (d) => d.value)]).range([margin.left, width - margin.right]);

    const svg = d3
      .select(budgetContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .selectAll("rect")
      .data(budgetMix)
      .join("rect")
      .attr("x", x(0))
      .attr("y", (d) => y(d.label))
      .attr("width", (d) => x(d.value) - x(0))
      .attr("height", y.bandwidth())
      .attr("rx", 12)
      .attr("fill", "#60a5fa")
      .attr("opacity", 0.85)
      .each(function (d) {
        registerTooltip?.(this, `<strong>${d.label}</strong><br>${d.value}% of budget`);
      });

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("color", "rgba(148,163,184,0.7)")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .style("font-size", "11px");

    const topAllocation = budgetMix.reduce((best, segment) => (segment.value > best.value ? segment : best), budgetMix[0]);
    setChartSummary("ads-budget", `${topAllocation.label} receives the highest allocation (${topAllocation.value}%).`);
  }
}

const externalScriptCache = {};
function loadExternalScript(src) {
  if (externalScriptCache[src]) return externalScriptCache[src];
  externalScriptCache[src] = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  }).catch((error) => {
    delete externalScriptCache[src];
    throw error;
  });
  return externalScriptCache[src];
}

function parseBreakdownKey(key) {
  return key.split("|").reduce((acc, segment) => {
    const [field, value] = segment.split("=");
    acc[field] = value;
    return acc;
  }, {});
}

function mapHeatmapData(response) {
  const breakdown = response?.metrics?.find((metric) => metric.kpi === "activity_index")?.breakdown || {};
  return Object.entries(breakdown).map(([key, value]) => {
    const parts = parseBreakdownKey(key);
    return {
      region: parts.region,
      category: parts.category,
      value,
    };
  });
}

function mapOriginTimeline(response) {
  const organic = response?.metrics?.find((metric) => metric.kpi === "origin_volume_organic")?.breakdown || {};
  const synthetic = response?.metrics?.find((metric) => metric.kpi === "origin_volume_synthetic")?.breakdown || {};
  const uniqueKeys = new Set([...Object.keys(organic), ...Object.keys(synthetic)]);
  return Array.from(uniqueKeys)
    .map((key) => {
      const parts = parseBreakdownKey(key);
      const date = parts.date || key;
      return {
        date,
        organic: organic[key] ?? 0,
        synthetic: synthetic[key] ?? 0,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function mapPlatformShare(response) {
  const breakdown = response?.metrics?.find((metric) => metric.kpi === "platform_share")?.breakdown || {};
  return Object.entries(breakdown).map(([key, value]) => {
    const parts = parseBreakdownKey(key);
    return {
      label: parts.platform || key,
      value,
    };
  });
}

function mapSentimentSeries(response) {
  const seriesNames = [
    { key: "sentiment_overall", prop: "overall" },
    { key: "sentiment_authentic", prop: "authentic" },
    { key: "sentiment_synthetic", prop: "synthetic" },
  ];
  const merged = {};

  seriesNames.forEach(({ key, prop }) => {
    const breakdown = response?.metrics?.find((metric) => metric.kpi === key)?.breakdown || {};
    Object.entries(breakdown).forEach(([hour, value]) => {
      const parts = parseBreakdownKey(hour);
      const slot = parts.hour || hour;
      if (!merged[slot]) merged[slot] = { hour: slot };
      merged[slot][prop] = value;
    });
  });

  return Object.values(merged)
    .map((entry) => ({
      hour: entry.hour,
      overall: entry.overall ?? 0,
      authentic: entry.authentic ?? 0,
      synthetic: entry.synthetic ?? 0,
    }))
    .sort((a, b) => new Date(a.hour) - new Date(b.hour));
}

function mapGeoBreakdown(response) {
  const intensity = response?.metrics?.find((metric) => metric.kpi === "geo_intensity")?.breakdown || {};
  const trend = response?.metrics?.find((metric) => metric.kpi === "geo_trend_pct")?.breakdown || {};
  const sentiment = response?.metrics?.find((metric) => metric.kpi === "geo_sentiment_shift")?.breakdown || {};

  const regions = new Set([...Object.keys(intensity), ...Object.keys(trend), ...Object.keys(sentiment)]);
  return Array.from(regions).map((key) => {
    const parts = parseBreakdownKey(key);
    const regionName = parts.region || key;
    return {
      name: regionName,
      intensity: intensity[key] ?? 0,
      trendPct: trend[key] ?? 0,
      sentimentShift: sentiment[key] ?? 0,
    };
  });
}

function mapCoordinationSeries(metricsResponse) {
  const metric = metricsResponse?.find((entry) => entry.kpi === "coordination_index");
  const breakdown = metric?.breakdown || {};
  return Object.entries(breakdown)
    .map(([key, value]) => {
      const parts = parseBreakdownKey(key);
      return {
        hour: Number(parts.hour ?? key),
        value,
      };
    })
    .sort((a, b) => a.hour - b.hour);
}

function emitErrorStates(needs, message) {
  Object.entries(needs).forEach(([key, required]) => {
    if (required) {
      emitErrorForKey(key, message);
    }
  });
}

function emitErrorForKey(key, message) {
  if (key === "trends") {
    renderTrendError(message);
    return;
  }
  const containers = ERROR_CONTAINER_MAP[key] || [];
  containers.forEach((id) => renderChartError(id, message));
}

function renderChartError(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="chart-error" role="status">${message}</div>`;
}

function sanitizeTooltipHtml(content) {
  if (content == null) return "";
  const template = document.createElement("template");
  template.innerHTML = String(content);
  const scrubNode = (root) => {
    Array.from(root.childNodes).forEach((node) => {
      if (node.nodeType === NODE_TYPES.ELEMENT) {
        if (!ALLOWED_TOOLTIP_TAGS.has(node.nodeName)) {
          const textValue = node.textContent || "";
          root.replaceChild(document.createTextNode(textValue), node);
        } else {
          while (node.attributes.length) {
            node.removeAttribute(node.attributes[0].name);
          }
          scrubNode(node);
        }
      } else if (node.nodeType === NODE_TYPES.COMMENT) {
        root.removeChild(node);
      }
    });
  };

  scrubNode(template.content);
  const container = document.createElement("div");
  container.appendChild(template.content.cloneNode(true));
  const sanitized = container.innerHTML.trim();
  return sanitized || container.textContent || "";
}

function renderDashboardTrends(trends) {
  document.querySelectorAll("[data-sparkline]").forEach((node) => {
    const key = node.getAttribute("data-sparkline");
    const series = trends?.[key];
    if (!Array.isArray(series) || !series.length) {
      node.textContent = "Trend unavailable";
      return;
    }
    node.innerHTML = "";
    const max = Math.max(...series);
    const min = Math.min(...series);
    series.forEach((value) => {
      const bar = document.createElement("span");
      bar.className = "sparkline__bar";
      const normalized = max === min ? 0.5 : (value - min) / (max - min);
      bar.style.height = `${Math.max(20, normalized * 100)}%`;
      node.appendChild(bar);
    });
    node.setAttribute(
      "aria-label",
      `${key.replace(/_/g, " ")} trend: ${series.join(", ")}`
    );
  });
}

function renderTrendError(message) {
  const fallback = message || "Trend data unavailable.";
  document.querySelectorAll("[data-sparkline]").forEach((node) => {
    node.textContent = fallback;
    node.removeAttribute("aria-label");
  });
}

function setChartSummary(containerId, summary) {
  if (!summary) return;
  const container = document.getElementById(containerId);
  if (!container) return;
  let summaryNode = container.querySelector(".chart-summary");
  const summaryId = `${containerId}-summary`;
  if (!summaryNode) {
    summaryNode = document.createElement("p");
    summaryNode.className = "sr-only chart-summary";
    summaryNode.id = summaryId;
    container.appendChild(summaryNode);
  }
  summaryNode.textContent = summary;
  if (!summaryNode.id) {
    summaryNode.id = summaryId;
  }
  const describedBy = new Set(
    (container.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter(Boolean)
  );
  describedBy.add(summaryNode.id);
  container.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
}
