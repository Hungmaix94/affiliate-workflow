---
description: Auto Git Commit Workflow
---

# Auto Git Commit Workflow
1. Run `git diff --cached` to review staged changes. If nothing is staged, run `git diff`.
2. Analyze the changes and categorize them.
3. Generate a commit message following the Conventional Commits format:
   `<type>[optional scope]: <description>`
4. Propose the commit message to the user.