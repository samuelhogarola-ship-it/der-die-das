# Workflow rules

NEVER commit directly to main.
NEVER push directly to main.

Always:
1. Create a feature branch
2. Commit changes there
3. Push branch
4. Open a Pull Request

If currently on main:
- create a new branch before editing anything

Mandatory workflow:
git checkout -b feature/<task-name>
git push origin <branch>
gh pr create
