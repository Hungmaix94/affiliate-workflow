---
description: Browser Testing & Recording Workflow
---

# Browser Testing & Recording Workflow with agent-browser

1. Navigate to the target URL:
   `agent-browser open <url>`
2. Take an interactive snapshot to discover element references (@e1, @e2, etc.):
   `agent-browser snapshot -i`
3. Chain commands using `&&` to interact with elements based on the parsed references. For example:
   `agent-browser fill @e1 "user@example.com" && agent-browser fill @e2 "password123" && agent-browser click @e3`
4. Use `agent-browser wait --load networkidle` after navigation or submissions before the next snapshot.
5. Capture the final state:
   `agent-browser screenshot page.png`
6. Review the test results and output a Test Result Summary detailing what was tested, what passed, and any observed issues.