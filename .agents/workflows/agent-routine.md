---
description: Core Agent Routine Workflow
---

# Core Agent Routine Workflow

> **Scope**: Use this workflow for NEW features, large refactors, or any task requiring
> full specification, design, and implementation planning. For small fixes or quick tasks,
> apply the Karpathy behavioral rules directly without this ceremony.
>
> **Mindset**: The Karpathy behavioral rules (Think Before Coding, Simplicity First,
> Surgical Changes, Goal-Driven Execution) apply WITHIN each step of this workflow.

When you receive a new task/feature from the user, ALWAYS follow this strict sequence:

### 1. Plan & Design Task
- **Goal Confirmation**:
  - Engage in thorough dialogue to understand the development goal.
  - Ask clarifying questions about the problem, users, outcomes, and technical constraints.
  - Summarize the goal and wait for explicit user confirmation before proceeding.
  - Generate a suitable `feature_name` (e.g., 'user-authentication').
  - Use the exact phrase "Goal confirmation complete" when ready to move to requirements.
- **Requirement Gathering**:
  - Generate initial requirements in EARS format (Easy Approach to Requirements Syntax).
  - Format: "As a [role], I want [feature], so that [benefit]" with matching acceptance criteria.
  - **E2E Scenarios**: Define high-level End-to-End (E2E) test scenarios for the feature.
  - Iterate with the user until the requirements are explicitly approved.
- **Feature Design**:
  - Conduct research and build context in the conversation thread.
  - Summarize key findings that inform the design.
  - Include sections: Overview, Architecture, Components and Interfaces, Data Models, Error Handling, and **Testing Strategy (including E2E plan)**.
  - Use Mermaid for diagrams where appropriate.
- **Implementation Planning**:
  - Create a detailed todo list inside the `docs/todo/` folder (e.g., `docs/todo/login-page.md`).
  - Format as a numbered checkbox list with two levels (e.g., 1.1, 1.2).
  - **E2E Task**: ALWAYS include a dedicated task for E2E testing in the todo list (e.g., "1.5 Implement E2E tests"). This is mandatory for new features or business logic updates.
  - Ensure each task is discrete, manageable, and builds incrementally on previous steps.

### 2. Implement Task
- **Context Awareness**: Read the requirements, design, and todo list before starting any task.
- **Execution**: Execute ONLY ONE task at a time. Stop and let the user review after each task.
- **Verification**:
  - Verify implementation against specific requirements and acceptance criteria.
  - **Testing**: Run relevant unit tests before marking a task as implemented. (E2E testing is handled as its own dedicated task).
- **Tooling**: Recheck TypeScript, ESLint, and other tooling regularly for errors during implementation.

### 3. Document Result & Mark Done
- **Summary**: Create a result document summarizing the changes inside the `docs/result/` folder (e.g., `docs/result/login-page.md`).
- **E2E Report**: Include a section on E2E test results, ensuring that any business logic changes are covered by updated or new E2E tests.
- **Progress**: Mark the tasks as done on the corresponding list inside `docs/todo/`.