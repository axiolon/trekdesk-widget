/* eslint-env browser */
(function () {
  "use strict";

  // Production API origin — single source of truth
  var PRODUCTION_API = "https://api.trekdeskai.axiolon.com";

  // Input sanitizers
  var VALID_HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  var ALLOWED_POSITIONS = ["left", "right"];

  function sanitizeColor(value, fallback) {
    return typeof value === "string" && VALID_HEX_COLOR.test(value.trim())
      ? value.trim()
      : fallback;
  }

  function sanitizePosition(value) {
    return ALLOWED_POSITIONS.indexOf(value) !== -1 ? value : "right";
  }

  window.TrekDeskAI = {
    _initialized: false,

    init: async function (config = {}) {
      // Guard against duplicate initialization
      if (this._initialized) {
        console.warn("TrekDesk AI: Already initialized.");
        return;
      }
      this._initialized = true;

      // 1. Resolve API Base URL — strict production origin only
      var apiBaseUrl = PRODUCTION_API;

      var agentId = config.agentId || "00000000-0000-0000-0000-000000000001";

      // 2. Fetch Branding Config
      var branding = {
        primary_color: "#10b981",
        position: "right",
        agent_name: "TrekDesk AI",
      };

      try {
        var response = await fetch(
          apiBaseUrl +
            "/api/v1/widget/config?agentId=" +
            encodeURIComponent(agentId),
        );
        var result = await response.json();
        if (result.status === "success") {
          // Priority: init() config > Dashboard settings > Default
          branding.primary_color =
            config.color || result.data.primary_color || branding.primary_color;
          branding.position =
            config.position || result.data.position || branding.position;
          branding.agent_name =
            config.name || result.data.agent_name || branding.agent_name;
        }
      } catch (e) {
        console.warn(
          "TrekDesk AI: Failed to fetch remote config, using defaults.",
        );
      }

      // Sanitize values before injecting into DOM
      var primaryColor = sanitizeColor(branding.primary_color, "#10b981");
      var position = sanitizePosition(branding.position);
      var assistantName = branding.agent_name;

      var embedUrl = new URL(apiBaseUrl + "/api/v1/widget/embed/chat");
      embedUrl.searchParams.set("agentId", agentId);
      embedUrl.searchParams.set("apiUrl", apiBaseUrl);
      if (config.color)
        embedUrl.searchParams.set("color", sanitizeColor(config.color, ""));
      if (config.msg) embedUrl.searchParams.set("msg", config.msg);
      if (config.name) embedUrl.searchParams.set("name", config.name);

      // 3. Create Styles
      var style = document.createElement("style");
      style.textContent =
        "#trekdesk-widget-launcher {" +
        "  position: fixed;" +
        "  bottom: 20px;" +
        "  " +
        position +
        ": 20px;" +
        "  padding: 0 24px;" +
        "  height: 54px;" +
        "  border-radius: 27px;" +
        "  background-color: " +
        primaryColor +
        ";" +
        "  box-shadow: 0 4px 16px rgba(0,0,0,0.2);" +
        "  cursor: pointer;" +
        "  display: flex;" +
        "  align-items: center;" +
        "  justify-content: center;" +
        "  gap: 10px;" +
        "  z-index: 999999;" +
        "  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" +
        "  color: white;" +
        '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        "  font-weight: 600;" +
        "  font-size: 15px;" +
        "  border: none;" +
        "  user-select: none;" +
        "}" +
        "#trekdesk-widget-launcher:hover {" +
        "  transform: translateY(-2px) scale(1.02);" +
        "  box-shadow: 0 6px 20px rgba(0,0,0,0.25);" +
        "}" +
        "#trekdesk-widget-launcher.open {" +
        "  width: 54px;" +
        "  padding: 0;" +
        "  border-radius: 50%;" +
        "}" +
        "#trekdesk-widget-container {" +
        "  position: fixed;" +
        "  bottom: 85px;" +
        "  " +
        position +
        ": 20px;" +
        "  width: 400px;" +
        "  height: 600px;" +
        "  max-height: calc(100vh - 110px);" +
        "  background: white;" +
        "  border-radius: 16px;" +
        "  box-shadow: 0 12px 32px rgba(0,0,0,0.18);" +
        "  z-index: 999998;" +
        "  overflow: hidden;" +
        "  display: none;" +
        "  border: 1px solid rgba(0,0,0,0.08);" +
        "}" +
        "#trekdesk-widget-container.open {" +
        "  display: block;" +
        "  animation: trekdesk-fade-in 0.3s cubic-bezier(0.23, 1, 0.32, 1);" +
        "}" +
        "@keyframes trekdesk-fade-in {" +
        "  from { opacity: 0; transform: translateY(20px) scale(0.95); }" +
        "  to { opacity: 1; transform: translateY(0) scale(1); }" +
        "}" +
        "@media (max-width: 480px) {" +
        "  #trekdesk-widget-container {" +
        "    width: calc(100% - 40px);" +
        "    height: calc(100% - 110px);" +
        "    bottom: 80px;" +
        "  }" +
        "}";
      document.head.appendChild(style);

      // 4. Create Elements
      var launcher = document.createElement("div");
      launcher.id = "trekdesk-widget-launcher";

      var sparkleIcon =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M7 5H3"/><path d="M22 17v4"/><path d="M24 19h-4"/></svg>';
      var closeIcon =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

      var setLauncherContent = function (isOpen) {
        if (isOpen) {
          launcher.innerHTML = closeIcon;
          launcher.classList.add("open");
        } else {
          launcher.innerHTML = sparkleIcon + " <span>Talk to AI</span>";
          launcher.classList.remove("open");
        }
      };

      setLauncherContent(false);

      var container = document.createElement("div");
      container.id = "trekdesk-widget-container";

      var iframe = document.createElement("iframe");
      iframe.src = embedUrl.toString();
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.allow = "microphone; autoplay";
      iframe.sandbox = "allow-scripts allow-same-origin";

      container.appendChild(iframe);
      document.body.appendChild(launcher);
      document.body.appendChild(container);

      // 5. Toggle Interaction
      var isOpen = false;
      launcher.onclick = function () {
        isOpen = !isOpen;
        container.classList.toggle("open", isOpen);
        setLauncherContent(isOpen);
      };
    },
  };
})();
