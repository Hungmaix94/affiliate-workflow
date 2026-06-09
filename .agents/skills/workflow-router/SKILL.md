---
name: workflow-router
description: "IMPORTANT: This skill MUST be activated on EVERY user message. Analyzes user intent and auto-selects the correct workflow or skill to execute."
---

# Workflow & Skill Router

You are an intelligent router. On **every user message**, you MUST classify the user's intent and determine whether to activate a workflow, a skill, or both.

## How it works

- **Workflow** = A step-by-step procedure in `.agents/workflows/`. Read the file and follow it.
- **Skill** = Reference knowledge/rules in `.agents/skills/`. Read the SKILL.md and apply its guidelines while working.
- You can combine: e.g. use `agent-routine` workflow + `react-best-practices` skill when building a new React feature.

## Routing Table

| User Intent | Target | Type |
|---|---|---|
| Build a new feature, page, component, or complex task | `.agents/workflows/agent-routine.md` | workflow |
| Commit code, push changes, or user says "1" | `.agents/workflows/git-commit.md` | workflow |
| Review code, check for issues, audit a PR | `.agents/workflows/code-review.md` | workflow |
| Generate standup report, daily update | `.agents/workflows/daily-standup.md` | workflow |
| Test in browser, record session, verify UI visually | `.agents/workflows/browser-testing.md` | workflow |
| Implement a Figma design, build UI from Figma URL | `.agents/workflows/figma-implement-design.md` | workflow |
| Design UI/UX, create design system, style guide | `.agents/workflows/ui-ux-pro-max.md` | workflow |
| Manage knowledge base, ingest source, query wiki, lint wiki, build personal wiki | `.agents/workflows/llm-wiki.md` | workflow |
| Write React/Next.js code, need React best practices | `.agents/skills/vercel-react-best-practices/` | skill |
| Audit UI for accessibility/UX, review web design quality | `.agents/skills/web-design-guidelines/` | skill |
| Automate browser interactions, fill forms, click buttons, take screenshots | `.agents/skills/agent-browser/` | skill |

## Execution Steps

1. **Classify intent**: Read the user's message and match against the routing table above.
2. **Check availability**: Verify the target file/folder exists before activating.
3. **Activate**:
   - For **workflow**: Read the full `.md` file and follow it step-by-step.
   - For **skill**: Read the `SKILL.md` inside the skill folder and apply its rules/guidelines throughout your work.
   - For **both**: Activate the workflow as primary, and layer the skill rules on top.
4. **No match**: Proceed normally without a workflow or skill.
5. **Ambiguous**: Ask the user to clarify.

## Shortcuts
- User says **"1"** → Immediately trigger `git-commit` workflow, no questions asked.

## Combination Examples
- "Build a login page" → `agent-routine` workflow + `react-best-practices` skill (if React project)
- "Build login page from this Figma" → `figma-implement-design` workflow + `web-design-guidelines` skill
- "Test the signup flow in browser" → `browser-testing` workflow + `agent-browser` skill
- "Design a dashboard" → `ui-ux-pro-max` workflow + `web-design-guidelines` skill

## Important
- This router activates **automatically** — the user does NOT need slash commands.
- Always prefer combining a workflow + relevant skills for the best result.
- When multiple workflows could match, pick the most specific one.