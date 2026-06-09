---
description: UI/UX Pro Max - Design Intelligence Workflow
---

# UI/UX Pro Max - Design Intelligence Workflow

When asked to design, build, or review UI/UX, follow these steps using the `ui-ux-pro-max` skill:

## Step 1: Analyze Requirements
Determine the product type, style keywords, industry, and tech stack from the user's request.

## Step 2: Generate Design System (REQUIRED)
Generate a comprehensive design system for the project using the CLI script.
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system --persist -p "<Project Name>"
```
This creates a `design-system/MASTER.md` acting as the global source of truth.

## Step 3: Page-Specific Overrides (If applicable)
If building a specific page, append `--page "<page-name>"` to the command above to generate a page-specific `design-system/pages/<page-name>.md`.
Prioritize page-specific rules over the MASTER rules when they exist.

## Step 4: Supplement with Detailed Searches (As needed)
If you need more specific details about a domain (e.g., typography, chart, ux), run a targeted search:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain>
```

## Step 5: Stack Guidelines
Ensure the implementation aligns with the requested stack (e.g., react, nextjs, html-tailwind, shadcn). Adhere to the design system rules regarding layout, colors, accessibility, and interactions before presenting the final result.