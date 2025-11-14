document.addEventListener("DOMContentLoaded", () => {
    const timestampNodes = document.querySelectorAll("[data-current-timestamp]");
    if (timestampNodes.length > 0) {
        const now = new Date();
        const formatted = now.toISOString().slice(0, 19).replace("T", " ");
        timestampNodes.forEach((node) => {
            node.textContent = formatted + " UTC";
        });
    }

    const currentPage = document.body.dataset.page;
    if (currentPage) {
        document.querySelectorAll(".mock-nav a").forEach((link) => {
            const isActive = link.dataset.nav === currentPage;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    document.querySelectorAll("[data-quick-link]").forEach((button) => {
        button.addEventListener("mouseenter", () => button.classList.add("btn-primary"));
        button.addEventListener("mouseleave", () => button.classList.remove("btn-primary"));
    });

    const tooltip = document.createElement("div");
    tooltip.className = "tooltip-pill";
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tooltip);

    const showTooltip = (event, content) => {
        tooltip.textContent = content;
        tooltip.dataset.visible = "true";
        tooltip.dataset.position = "above";
        tooltip.setAttribute("aria-hidden", "false");

        // Reset positioning to measure size accurately
        tooltip.style.left = "0px";
        tooltip.style.top = "0px";

        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const halfWidth = tooltipRect.width / 2;
        let x = event.clientX;

        if (x - halfWidth < 8) {
            x = halfWidth + 8;
        } else if (x + halfWidth > viewportWidth - 8) {
            x = viewportWidth - halfWidth - 8;
        }

        const cursorBuffer = 16;
        let y = event.clientY - cursorBuffer - tooltipRect.height;
        let position = "above";

        if (y < 8) {
            y = event.clientY + cursorBuffer;
            position = "below";
        }

        tooltip.dataset.position = position;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.dataset.visible = "true";
    };

    const hideTooltip = () => {
        tooltip.dataset.visible = "false";
        tooltip.setAttribute("aria-hidden", "true");
    };

    document.querySelectorAll("[data-tooltip]").forEach((node) => {
        node.addEventListener("mouseenter", (event) => showTooltip(event, node.dataset.tooltip));
        node.addEventListener("mousemove", (event) => showTooltip(event, node.dataset.tooltip));
        node.addEventListener("mouseleave", hideTooltip);
        node.addEventListener("focus", (event) => showTooltip(event, node.dataset.tooltip));
        node.addEventListener("blur", hideTooltip);
    });
});
