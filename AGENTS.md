# AGENTS.md

Guidance for coding agents working in this repository.

## Scope

- This file applies to the entire repository.
- Follow the most specific instruction source first: direct user request, then system/developer constraints, then this file.

## Repository status

- This repository is currently minimal and does not define a stack-specific build or test workflow yet.
- Prefer safe, incremental changes and avoid introducing unnecessary complexity.

## Working agreements

1. Keep changes focused on the requested task.
2. Do not revert or rewrite unrelated work.
3. Prefer small, readable diffs over large refactors.
4. Add brief comments only when logic is not obvious.
5. Keep files ASCII unless a file already requires Unicode.

## File and code conventions

- Place new files at the repository root unless the task specifies a structure.
- Use descriptive names and keep documentation concise.
- When creating scripts, include a short usage note in comments or nearby docs.

## Validation

- Run the narrowest relevant validation available for the change.
- If no tests or tooling exist yet, state what was manually verified.
- Do not claim checks were run if they were not run.

## Git expectations

- Stage only intended files.
- Use clear, task-scoped commit messages.
- Avoid force-push and history rewriting unless explicitly requested.

## When requirements are unclear

- Make the smallest reasonable assumption.
- Document assumptions in the final handoff message.
- Ask for clarification only when blocked or when options materially affect outcomes.
