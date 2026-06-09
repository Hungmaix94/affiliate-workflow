---
description: Figma Implement Design Workflow
---

# Figma Implement Design Workflow

This workflow translates Figma designs into production-ready code with pixel-perfect accuracy using the Figma MCP server.

## Prerequisites
- Figma MCP server must be connected and accessible.
- User must provide a Figma URL in the format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`

## Step 1: Get Node ID
Extract the file key and node ID from the Figma URL. (e.g., file key: `:fileKey`, Node ID: `1-2`).

## Step 2: Fetch Design Context
Run `get_design_context(fileKey=":fileKey", nodeId="1-2")` using the Figma MCP server. If the payload is too large, use `get_metadata` and then fetch child contexts individually.

## Step 3: Capture Visual Reference
Run `get_screenshot(fileKey=":fileKey", nodeId="1-2")` to retain a visual reference.

## Step 4: Download Required Assets
Download any assets (images, icons, SVGs) provided by the Figma MCP server (e.g., using `download_figma_images` if applicable). DO NOT import placeholder images or new icon packages; use the assets directly from Figma.

## Step 5: Translate to Project Conventions
Translate the Figma output into this project's framework, style (Tailwind), and UI components (ShadCN). Map Figma tokens to project tokens.

## Step 6: Achieve 1:1 Visual Parity
Strive for pixel-perfect visual parity with the Figma design. Avoid hardcoded values. Adjust styling as necessary to match the design accurately.

## Step 7: Validate Against Figma
Before marking complete, validate the final UI against the layout, typography, colors, interactive states, and responsiveness.