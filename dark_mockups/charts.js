
document.addEventListener("DOMContentLoaded", () => {
  drawNarrativeGlobe();
  const tippyInstances = [];

  const registerTooltip = (element, html) => {
    if (typeof tippy === "undefined") return;
    const instance = tippy(element, {
      content: html,
      allowHTML: true,
      theme: "custom",
      placement: "top",
      animation: "shift-away",
      appendTo: document.body,
    });
    tippyInstances.push(instance);
  };

  drawDashboardHeatmap(registerTooltip);
  drawNarrativeTimeline(registerTooltip);
  drawNarrativePlatform(registerTooltip);
  drawNarrativeSentiment(registerTooltip);
  drawNarrativeGeo(registerTooltip);
  drawRiskNetwork(registerTooltip);
  drawRiskCoordination(registerTooltip);
  drawSandboxNetwork(registerTooltip);
  drawExecutiveCharts(registerTooltip);
  drawAdvertisingCharts(registerTooltip);
});

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

  const animate = () => {
    if (isPaused) return;
    globe.rotation.y += 0.0009;
    points.rotation.y += 0.0014;
    halo.rotation.y += 0.0006;
    renderer.render(scene, camera);
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

function drawDashboardHeatmap(registerTooltip) {
  const container = clearChart("dashboard-heatmap");
  if (!container) return;

  const categories = ["Finance", "Healthcare", "Energy", "Politics", "Consumer"];
  const regions = ["North America", "Europe", "APAC", "LATAM"];
  const data = [];

  regions.forEach((region, row) => {
    categories.forEach((cat, col) => {
      data.push({
        region: region,
        category: cat,
        value: Math.round(Math.random() * 80 + 20),
        row,
        col,
      });
    });
  });

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
    .domain([0, 100])
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

  const axisX = d3.axisBottom(xScale).tickSize(0);
  const axisY = d3.axisLeft(yScale).tickSize(0);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(axisX)
    .selectAll("text")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(axisY)
    .selectAll("text")
    .style("font-size", "12px");
}

function drawNarrativeTimeline(registerTooltip) {
  const container = clearChart("narrative-timeline");
  if (!container) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 220;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  const days = d3.range(7).map((d) => ({
    day: `Day ${d + 1}`,
    organic: Math.round(Math.random() * 40 + 20),
    synthetic: Math.round(Math.random() * 50 + 40),
  }));

  const x = d3
    .scalePoint()
    .domain(days.map((d) => d.day))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(days, (d) => d.synthetic) * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const lineOrganic = d3
    .line()
    .x((d) => x(d.day))
    .y((d) => y(d.organic))
    .curve(d3.curveMonotoneX);

  const lineSynthetic = d3
    .line()
    .x((d) => x(d.day))
    .y((d) => y(d.synthetic))
    .curve(d3.curveMonotoneX);

  svg
    .append("path")
    .datum(days)
    .attr("fill", "none")
    .attr("stroke", "#60a5fa")
    .attr("stroke-width", 2)
    .attr("d", lineOrganic);

  svg
    .append("path")
    .datum(days)
    .attr("fill", "none")
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "6 3")
    .attr("d", lineSynthetic);

  const timelinePoints = svg
    .selectAll(".point")
    .data(days.flatMap((d) => [
      { ...d, type: "Organic", value: d.organic, color: "#60a5fa" },
      { ...d, type: "Synthetic", value: d.synthetic, color: "#ef4444" },
    ]))
    .join("circle")
    .attr("cx", (d) => x(d.day))
    .attr("cy", (d) => y(d.value))
    .attr("r", 4)
    .attr("fill", (d) => d.color);

  if (typeof registerTooltip === "function") {
    timelinePoints.each(function (d) {
      registerTooltip(
        this,
        `<strong>${d.day}</strong><br>${d.type}: ${d.value}`
      );
    });
  }

  const axisX = d3.axisBottom(x).tickSize(0);
  const axisY = d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(axisX)
    .selectAll("text")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.3)")
    .call(axisY)
    .selectAll("text")
    .style("font-size", "11px");
}

function drawNarrativePlatform(registerTooltip) {
  const container = clearChart("narrative-platform");
  if (!container) return;

  const width = container.clientWidth || 220;
  const height = container.clientHeight || 220;
  const radius = Math.min(width, height) / 2 - 10;

  const platforms = [
    { label: "Twitter", value: 34, color: "#60a5fa" },
    { label: "Facebook", value: 28, color: "#818cf8" },
    { label: "TikTok", value: 19, color: "#c084fc" },
    { label: "Reddit", value: 12, color: "#22d3ee" },
    { label: "Others", value: 7, color: "#f97316" },
  ];

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
    .data(pie(platforms))
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => d.data.color)
    .attr("stroke", "rgba(15,23,42,0.9)")
    .attr("stroke-width", 2);

  if (typeof registerTooltip === "function") {
    slices.each(function (d) {
      registerTooltip(
        this,
        `<strong>${d.data.label}</strong><br>${d.data.value}% share`
      );
    });
  }

  svg
    .selectAll("text")
    .data(pie(platforms))
    .join("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("fill", "#f8fafc")
    .attr("font-size", "11px")
    .text((d) => `${d.data.value}%`);
}

function drawNarrativeSentiment(registerTooltip) {
  const container = clearChart("narrative-sentiment");
  if (!container) return;

  const width = container.clientWidth || 480;
  const height = container.clientHeight || 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const points = d3.range(24).map((i) => ({
    hour: i,
    authentic: Math.sin(i / 3) * 20 + 30 + Math.random() * 5,
    synthetic: Math.cos(i / 4) * 25 + 40 + Math.random() * 5,
    overall: Math.sin(i / 5) * 15 + 35 + Math.random() * 5,
  }));

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(points, (d) => d.hour)])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const lines = [
    { key: "overall", color: "#38bdf8", label: "Overall" },
    { key: "authentic", color: "#10b981", label: "Authentic" },
    { key: "synthetic", color: "#ef4444", label: "Synthetic" },
  ];

  lines.forEach((lineDef) => {
    const line = d3
      .line()
      .x((d) => x(d.hour))
      .y((d) => y(d[lineDef.key]))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", lineDef.color)
      .attr("stroke-width", 2)
      .attr("d", line);
  });

  svg
    .selectAll(".sentiment-point")
    .data(points)
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
        `<strong>Hour ${d.hour}</strong><br>Overall: ${d.overall.toFixed(
          1
        )}<br>Authentic: ${d.authentic.toFixed(
          1
        )}<br>Synthetic: ${d.synthetic.toFixed(1)}`
      );
    });

  const axisX = d3
    .axisBottom(x)
    .ticks(6)
    .tickFormat((d) => `${d}h`)
    .tickSize(0);
  const axisY = d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("color", "rgba(148,163,184,0.6)")
    .call(axisX)
    .selectAll("text")
    .style("font-size", "12px");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "rgba(148,163,184,0.3)")
    .call(axisY)
    .selectAll("text")
    .style("font-size", "11px");
}

function drawNarrativeGeo(registerTooltip) {
  const container = clearChart("narrative-geo");
  if (!container) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 120 };

  const regions = [
    { name: "USA", intensity: 78, trend: "+12%", sentiment: "+18" },
    { name: "UK", intensity: 62, trend: "+7%", sentiment: "+9" },
    { name: "Germany", intensity: 54, trend: "+5%", sentiment: "+6" },
    { name: "LATAM", intensity: 47, trend: "+9%", sentiment: "-4" },
    { name: "APAC", intensity: 39, trend: "+4%", sentiment: "-2" },
  ];

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

  const color = d3
    .scaleLinear()
    .domain([0, 80])
    .range(["rgba(96,165,250,0.25)", "rgba(239,68,68,0.65)"]);

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

  if (typeof registerTooltip === "function") {
    bars.each(function (d) {
      registerTooltip(
        this,
        `<strong>${d.name}</strong><br>Intensity Index: ${d.intensity}<br>Trend: ${d.trend}<br>Sentiment shift: ${d.sentiment}`
      );
    });
  }

  const axisX = d3
    .axisBottom(x)
    .ticks(5)
    .tickFormat((d) => `${d}`)
    .tickSize(0);

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
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .remove();
}

function drawRiskNetwork(registerTooltip) {
  const container = clearChart("risk-network");
  if (!container) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 220;

  const nodes = d3.range(25).map((i) => ({
    id: i,
    group: i < 5 ? "Commander" : "Bot",
    critical: Math.random() > 0.8,
  }));
  const links = d3.range(40).map(() => ({
    source: Math.floor(Math.random() * nodes.length),
    target: Math.floor(Math.random() * nodes.length),
    value: Math.random() * 2 + 0.5,
  }));

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-hidden", "true");

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .distance(60)
        .strength((d) => d.value * 0.2)
    )
    .force("charge", d3.forceManyBody().strength(-120))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .attr("stroke", "rgba(148,163,184,0.3)")
    .attr("stroke-width", 1.2)
    .selectAll("line")
    .data(links)
    .join("line");

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => (d.group === "Commander" ? 8 : 5))
    .attr("fill", (d) => (d.group === "Commander" ? "#ef4444" : "#60a5fa"))
    .attr("stroke", "rgba(15,23,42,0.8)")
    .attr("stroke-width", 1.5)
    .each(function (d) {
      registerTooltip?.(
        this,
        `<strong>Node ${d.id}</strong><br>Type: ${d.group}<br>${d.critical ? "Critical" : "Peripheral"}`
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

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });
}

function drawRiskCoordination(registerTooltip) {
  const container = clearChart("risk-coordination");
  if (!container) return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 220;
  const margin = { top: 25, right: 20, bottom: 40, left: 45 };

  const hours = d3.range(24).map((h) => ({
    hour: h,
    value: Math.round(Math.random() * 80 + 20),
  }));

  const x = d3.scaleBand().domain(hours.map((d) => d.hour)).range([margin.left, width - margin.right]).padding(0.2);
  const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");

  svg.selectAll("rect")
    .data(hours)
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

  const axisX = d3.axisBottom(x).tickValues([0, 6, 12, 18, 23]).tickFormat((d) => `${d}h`).tickSize(0);
  const axisY = d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right);

  svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).attr("color", "rgba(148,163,184,0.6)").call(axisX).selectAll("text").style("font-size", "11px");
  svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.3)").call(axisY).selectAll("text").style("font-size", "11px");
}

function drawSandboxNetwork(registerTooltip) {
  const container = clearChart("sandbox-network");
  if (!container) return;

  const width = container.clientWidth || 520;
  const height = container.clientHeight || 360;

  const nodes = d3.range(30).map((i) => ({
    id: i,
    camp: i % 3 === 0 ? "Our" : i % 3 === 1 ? "Opposition" : "Neutral",
    size: Math.random() * 6 + 4,
  }));
  const links = d3.range(60).map(() => ({
    source: Math.floor(Math.random() * nodes.length),
    target: Math.floor(Math.random() * nodes.length),
    strength: Math.random(),
  }));

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
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).distance(80).strength((d) => d.strength * 0.6)
    )
    .force("charge", d3.forceManyBody().strength(-180))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .attr("stroke", "rgba(148,163,184,0.25)")
    .attr("stroke-width", 1)
    .selectAll("line")
    .data(links)
    .join("line");

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => d.size)
    .attr("fill", (d) => color(d.camp))
    .attr("stroke", "rgba(15,23,42,0.8)")
    .attr("stroke-width", 1.4)
    .each(function (d) {
      registerTooltip?.(
        this,
        `<strong>Node ${d.id}</strong><br>Segment: ${d.camp}<br>Influence: ${d.size.toFixed(1)}`
      );
    });

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  const audienceContainer = clearChart("sandbox-audience");
  if (audienceContainer) {
    const width = audienceContainer.clientWidth || 280;
    const height = audienceContainer.clientHeight || 220;
    const margin = { top: 20, right: 20, bottom: 30, left: 60 };

    const segments = [
      { segment: "Analysts", engagement: 82, sentiment: 0.34 },
      { segment: "Investors", engagement: 68, sentiment: 0.48 },
      { segment: "Advocates", engagement: 91, sentiment: 0.62 },
      { segment: "Skeptics", engagement: 47, sentiment: -0.21 },
      { segment: "Regulators", engagement: 55, sentiment: 0.12 },
    ];

    const y = d3
      .scaleBand()
      .domain(segments.map((d) => d.segment))
      .range([margin.top, height - margin.bottom])
      .padding(0.25);
    const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    const color = d3.scaleSequential().domain([-0.3, 0.7]).interpolator(d3.interpolateRdYlGn);

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
      .attr("fill", (d) => color(d.sentiment))
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

    const axisX = d3
      .axisBottom(x)
      .tickValues([0, 25, 50, 75, 100])
      .tickFormat((d) => `${d}%`)
      .tickSize(0);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("color", "rgba(148,163,184,0.6)")
      .call(axisX)
      .selectAll("text")
      .style("font-size", "11px");
  }
}

function drawExecutiveCharts(registerTooltip) {
  const threatContainer = clearChart("exec-threatmap");
  if (threatContainer) {
    const width = threatContainer.clientWidth || 320;
    const height = threatContainer.clientHeight || 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const regions = [
      { region: "USA", score: 82 },
      { region: "UK", score: 68 },
      { region: "Germany", score: 55 },
      { region: "Brazil", score: 47 },
      { region: "Singapore", score: 42 },
    ];

    const x = d3
      .scaleBand()
      .domain(regions.map((d) => d.region))
      .range([margin.left, width - margin.right])
      .padding(0.2);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(regions, (d) => d.score) * 1.1])
      .range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(threatContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    svg
      .selectAll("rect")
      .data(regions)
      .join("rect")
      .attr("x", (d) => x(d.region))
      .attr("y", (d) => y(d.score))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.score))
      .attr("rx", 8)
      .attr("fill", (d) => d3.interpolateRdYlBu(1 - d.score / 100))
      .each(function (d) {
        registerTooltip?.(this, `<strong>${d.region}</strong><br>Threat score: ${d.score}`);
      });

    const axisX = d3.axisBottom(x).tickSize(0);
    const axisY = d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right);

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).attr("color", "rgba(148,163,184,0.6)").call(axisX).selectAll("text").style("font-size", "12px");
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.3)").call(axisY).selectAll("text").style("font-size", "11px");
  }

  const distributionContainer = clearChart("exec-distribution");
  if (distributionContainer) {
    const width = distributionContainer.clientWidth || 320;
    const height = distributionContainer.clientHeight || 200;
    const gridSpacing = 40;

    const hubs = [
      { region: "North America", recipients: 6, share: 0.36, coords: [0.25, 0.35] },
      { region: "Europe", recipients: 4, share: 0.24, coords: [0.55, 0.30] },
      { region: "APAC", recipients: 3, share: 0.18, coords: [0.78, 0.42] },
      { region: "LATAM", recipients: 2, share: 0.12, coords: [0.38, 0.65] },
      { region: "Middle East & Africa", recipients: 2, share: 0.10, coords: [0.62, 0.58] },
    ];

    const maxRecipients = d3.max(hubs, (d) => d.recipients) || 1;
    const color = d3
      .scaleSequential()
      .domain([0, maxRecipients])
      .interpolator(d3.interpolatePuBuGn);
    const radius = d3.scaleSqrt().domain([0, maxRecipients]).range([8, 26]);

    const svg = d3
      .select(distributionContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true");

    const grid = svg.append("g").attr("stroke", "rgba(148,163,184,0.15)").attr("stroke-width", 1);
    for (let x = gridSpacing; x < width; x += gridSpacing) {
      grid.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", height);
    }
    for (let y = gridSpacing; y < height; y += gridSpacing) {
      grid.append("line").attr("x1", 0).attr("y1", y).attr("x2", width).attr("y2", y);
    }

    const linkGroup = svg.append("g").attr("stroke", "rgba(96,165,250,0.5)").attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
    linkGroup
      .selectAll("path")
      .data(hubs)
      .join("path")
      .attr("d", (d) => {
        const [cx, cy] = [width / 2, height / 2];
        const [tx, ty] = [d.coords[0] * width, d.coords[1] * height];
        return `M${cx},${cy} Q${(cx + tx) / 2},${(cy + ty) / 2 - 40} ${tx},${ty}`;
      })
      .attr("fill", "none");

    const nodes = svg.append("g");
    nodes
      .selectAll("circle")
      .data(hubs)
      .join("circle")
      .attr("cx", (d) => d.coords[0] * width)
      .attr("cy", (d) => d.coords[1] * height)
      .attr("r", (d) => radius(d.recipients))
      .attr("fill", (d) => color(d.recipients))
      .attr("stroke", "rgba(15,23,42,0.85)")
      .attr("stroke-width", 1.5)
      .each(function (d) {
        registerTooltip?.(
          this,
          `<strong>${d.region}</strong><br>Recipients: ${d.recipients}<br>Share: ${(d.share * 100).toFixed(0)}%`
        );
      });

    nodes
      .selectAll("text")
      .data(hubs)
      .join("text")
      .attr("x", (d) => d.coords[0] * width)
      .attr("y", (d) => d.coords[1] * height + radius(d.recipients) + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(148,163,184,0.9)")
      .attr("font-size", "12px")
      .attr("font-weight", 500)
      .text((d) => `${d.region} · ${(d.share * 100).toFixed(0)}%`);
  }

  const categoriesContainer = clearChart("exec-categories");
  if (categoriesContainer) {
    const width = categoriesContainer.clientWidth || 300;
    const height = categoriesContainer.clientHeight || 220;
    const radius = Math.min(width, height) / 2 - 12;

    const segments = [
      { label: "Coordinated Campaigns", value: 34, color: "#60a5fa" },
      { label: "Bot Networks", value: 28, color: "#f97316" },
      { label: "Deepfakes", value: 19, color: "#ef4444" },
      { label: "Organic Threats", value: 12, color: "#10b981" },
      { label: "Unknown", value: 7, color: "#a855f7" },
    ];

    const svg = d3
      .select(categoriesContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-hidden", "true")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

    svg
      .selectAll("path")
      .data(pie(segments))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "rgba(15,23,42,0.85)")
      .attr("stroke-width", 1.5)
      .each(function (d) {
        registerTooltip?.(this, `<strong>${d.data.label}</strong><br>${d.data.value}% of threats`);
      });
  }

  const timelineContainer = clearChart("exec-timeline");
  if (timelineContainer) {
    const width = timelineContainer.clientWidth || 320;
    const height = timelineContainer.clientHeight || 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const incidents = [
      { day: 2, impact: 40, label: "Bot surge" },
      { day: 5, impact: 65, label: "Deepfake attempt" },
      { day: 9, impact: 33, label: "Media rumor" },
      { day: 12, impact: 72, label: "Campaign escalation" },
      { day: 16, impact: 55, label: "Investor panic" },
    ];

    const x = d3.scaleLinear().domain([0, 21]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 80]).range([height - margin.bottom, margin.top]);

    const svg = d3.select(timelineContainer).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");

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

    const axisX = d3.axisBottom(x).ticks(6).tickFormat((d) => `Day ${d}`);
    const axisY = d3.axisLeft(y).ticks(4);

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).attr("color", "rgba(148,163,184,0.6)").call(axisX).selectAll("text").style("font-size", "11px");
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.3)").call(axisY).selectAll("text").style("font-size", "11px");
  }

  const impactContainer = clearChart("exec-impact");
  if (impactContainer) {
    const width = impactContainer.clientWidth || 320;
    const height = impactContainer.clientHeight || 220;
    const margin = { top: 25, right: 20, bottom: 40, left: 55 };

    const metrics = [
      { label: "Brand Sentiment", value: 82, color: "#60a5fa" },
      { label: "Financial ROI", value: 68, color: "#22c55e" },
      { label: "Stakeholder Confidence", value: 74, color: "#f97316" },
    ];

    const x = d3.scaleBand().domain(metrics.map((d) => d.label)).range([margin.left, width - margin.right]).padding(0.35);
    const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    const svg = d3.select(impactContainer).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");

    svg
      .selectAll("rect")
      .data(metrics)
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

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).attr("color", "rgba(148,163,184,0.6)").call(axisX).selectAll("text").style("font-size", "11px");
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.3)").call(axisY).selectAll("text").style("font-size", "11px");
  }

  const forecastContainer = clearChart("exec-forecast");
  if (forecastContainer) {
    const width = forecastContainer.clientWidth || 320;
    const height = forecastContainer.clientHeight || 220;
    const margin = { top: 25, right: 20, bottom: 35, left: 55 };

    const projections = [
      { horizon: "30d", risk: 55, lower: 45, upper: 64 },
      { horizon: "60d", risk: 60, lower: 48, upper: 72 },
      { horizon: "90d", risk: 68, lower: 54, upper: 81 },
    ];

    const x = d3.scalePoint().domain(projections.map((d) => d.horizon)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    const svg = d3.select(forecastContainer).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");

    svg
      .append("path")
      .datum(projections)
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
      .datum(projections)
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
      .data(projections)
      .join("circle")
      .attr("cx", (d) => x(d.horizon))
      .attr("cy", (d) => y(d.risk))
      .attr("r", 5)
      .attr("fill", "#60a5fa")
      .each(function (d) {
        registerTooltip?.(
          this,
          `<strong>${d.horizon}</strong><br>Risk: ${d.risk}<br>Range: ${d.lower} – ${d.upper}`
        );
      });

    const axisX = d3.axisBottom(x).tickSize(0);
    const axisY = d3.axisLeft(y).ticks(4).tickSize(-width + margin.left + margin.right);

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).attr("color", "rgba(148,163,184,0.6)").call(axisX).selectAll("text").style("font-size", "11px");
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.3)").call(axisY).selectAll("text").style("font-size", "11px");
  }
}

function drawAdvertisingCharts(registerTooltip) {
  const spendPerformance = clearChart("ads-spend-performance");
  if (spendPerformance) {
    const width = spendPerformance.clientWidth || 520;
    const height = spendPerformance.clientHeight || 320;
    const margin = { top: 30, right: 30, bottom: 45, left: 55 };

    const points = d3.range(12).map((i) => ({
      period: i + 1,
      spend: Math.random() * 40 + 60,
      conversions: Math.random() * 35 + 40,
      sentiment: Math.random() * 20 + 50,
    }));

    const x = d3
      .scaleLinear()
      .domain([1, points.length])
      .range([margin.left, width - margin.right]);
    const yLeft = d3.scaleLinear().domain([0, 110]).range([height - margin.bottom, margin.top]);
    const yRight = d3.scaleLinear().domain([0, 80]).range([height - margin.bottom, margin.top]);

    const svg = d3.select(spendPerformance).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");

    svg
      .append("path")
      .datum(points)
      .attr("fill", "rgba(96,165,250,0.15)")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .area()
          .x((d) => x(d.period))
          .y0(yLeft(0))
          .y1((d) => yLeft(d.spend))
          .curve(d3.curveMonotoneX)
      );

    const lineConversions = d3
      .line()
      .x((d) => x(d.period))
      .y((d) => yLeft(d.conversions))
      .curve(d3.curveMonotoneX);

    const lineSentiment = d3
      .line()
      .x((d) => x(d.period))
      .y((d) => yRight(d.sentiment))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "#f97316")
      .attr("stroke-width", 2)
      .attr("d", lineConversions);

    svg
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6 3")
      .attr("d", lineSentiment);

    svg
      .selectAll(".point-spend")
      .data(points)
      .join("circle")
      .attr("class", "point-spend")
      .attr("cx", (d) => x(d.period))
      .attr("cy", (d) => yLeft(d.conversions))
      .attr("r", 4)
      .attr("fill", "#f97316")
      .each(function (d) {
        registerTooltip?.(
          this,
          `<strong>Week ${d.period}</strong><br>Spend: ${d.spend.toFixed(
            1
          )}k<br>Conversions: ${d.conversions.toFixed(
            1
          )}k<br>Sentiment: ${d.sentiment.toFixed(1)} pts`
        );
      });

    const axisX = d3.axisBottom(x).ticks(points.length).tickFormat((d) => `W${d}`);
    const axisLeft = d3.axisLeft(yLeft).ticks(5).tickFormat((d) => `${d}k`);
    const axisRight = d3.axisRight(yRight).ticks(5).tickFormat((d) => `${d}pts`);

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).attr("color", "rgba(148,163,184,0.6)").call(axisX).selectAll("text").style("font-size", "11px");
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.6)").call(axisLeft).selectAll("text").style("font-size", "11px");
    svg.append("g").attr("transform", `translate(${width - margin.right}, 0)`).attr("color", "rgba(148,163,184,0.6)").call(axisRight).selectAll("text").style("font-size", "11px");
  }

  const channelContainer = clearChart("ads-channel");
  if (channelContainer) {
    const width = channelContainer.clientWidth || 260;
    const height = channelContainer.clientHeight || 200;
    const radius = Math.min(width, height) / 2 - 10;

    const channels = [
      { label: "Twitter", value: 34, color: "#3b82f6" },
      { label: "Facebook", value: 28, color: "#6366f1" },
      { label: "TikTok", value: 19, color: "#a855f7" },
      { label: "LinkedIn", value: 12, color: "#22d3ee" },
      { label: "Other", value: 7, color: "#f97316" },
    ];

    const svg = d3.select(channelContainer).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true").append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    const channelSlices = svg
      .selectAll("path")
      .data(pie(channels))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "rgba(15,23,42,0.85)")
      .attr("stroke-width", 1.5);

    if (typeof registerTooltip === "function") {
      channelSlices.each(function (d) {
        registerTooltip(
          this,
          `<strong>${d.data.label}</strong><br>${d.data.value}% of spend`
        );
      });
    }
  }

  const corrContainer = clearChart("ads-correlation");
  if (corrContainer) {
    const width = corrContainer.clientWidth || 260;
    const height = corrContainer.clientHeight || 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 45 };

    const metrics = [
      { narrative: "Sustainability", spend: 25, sentiment: 18 },
      { narrative: "Innovation", spend: 32, sentiment: 20 },
      { narrative: "Trust", spend: 18, sentiment: 11 },
      { narrative: "Crisis", spend: 15, sentiment: -9 },
    ];

    const x = d3.scaleLinear().domain([0, 40]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([-20, 25]).range([height - margin.bottom, margin.top]);

    const svg = d3.select(corrContainer).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");

    svg
      .selectAll("circle")
      .data(metrics)
      .join("circle")
      .attr("cx", (d) => x(d.spend))
      .attr("cy", (d) => y(d.sentiment))
      .attr("r", 8)
      .attr("fill", (d) => (d.sentiment >= 0 ? "#22c55e" : "#ef4444"))
      .attr("opacity", 0.85)
      .each(function (d) {
        registerTooltip?.(
          this,
          `<strong>${d.narrative}</strong><br>Spend: ${d.spend}k<br>Sentiment shift: ${d.sentiment}`
        );
      });

    svg
      .append("line")
      .attr("x1", x(0))
      .attr("x2", x(40))
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "rgba(148,163,184,0.3)")
      .attr("stroke-width", 1);

    const axisX = d3.axisBottom(x).ticks(4).tickFormat((d) => `${d}k`);
    const axisY = d3.axisLeft(y).ticks(5);

    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).attr("color", "rgba(148,163,184,0.6)").call(axisX).selectAll("text").style("font-size", "11px");
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.6)").call(axisY).selectAll("text").style("font-size", "11px");
  }

  const budgetContainer = clearChart("ads-budget");
  if (budgetContainer) {
    const width = budgetContainer.clientWidth || 260;
    const height = budgetContainer.clientHeight || 200;
    const margin = { top: 30, right: 20, bottom: 35, left: 60 };

    const segments = [
      { label: "Paid Media", value: 54 },
      { label: "Influencers", value: 21 },
      { label: "Owned", value: 15 },
      { label: "Earned", value: 10 },
    ];

    const y = d3.scaleBand().domain(segments.map((d) => d.label)).range([margin.top, height - margin.bottom]).padding(0.3);
    const x = d3.scaleLinear().domain([0, 60]).range([margin.left, width - margin.right]);

    const svg = d3.select(budgetContainer).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");

    svg
      .selectAll("rect")
      .data(segments)
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

    const axisY = d3.axisLeft(y).tickSize(0);
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).attr("color", "rgba(148,163,184,0.7)").call(axisY).selectAll("text").style("font-size", "11px");
  }
}
