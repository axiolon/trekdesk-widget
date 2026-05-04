# TrekDesk AI Widget Loader

Official loader script for the TrekDesk AI Voice Agent. This repository is maintained for transparency, auditability, and developer trust.

## Overview

The TrekDesk AI widget allows tour and trek operators to embed a high-fidelity voice AI agent directly on their websites. This script (`widget.v1.js`) is the entry point that initializes the widget environment.

## Security Architecture

We prioritize the security of the host website. The widget is designed with a "zero-trust" approach:

- **Strict Isolation**: The widget logic runs entirely inside a sandboxed `<iframe>` with `allow-scripts allow-same-origin`.
- **Zero DOM Access**: The loader script has no permission to read or modify your page content, localStorage, or cookies.
- **Hardware Isolation**: Audio processing (VAD) and WebRTC streams are scoped only to the iframe context.
- **Origin Guard**: Network requests are locked to `api.trekdeskai.axiolon.com`.

## Integration

To embed the widget, add the following to your HTML:

```html
<script src="https://api.trekdeskai.axiolon.com/static/widget.v1.js"></script>
<script>
  window.onload = function() {
    TrekDeskAI.init({
      agentId: "YOUR_AGENT_ID",
      color: "#10b981", // Optional theme color
      position: "right" // 'left' or 'right'
    });
  };
</script>
```

## Transparency & Auditing

We encourage security researchers and enterprise customers to audit this code. If you find a potential security issue, please refer to our [Security Policy](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
