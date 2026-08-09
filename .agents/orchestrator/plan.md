# Orchestrator Execution Plan — M3 & M4

## Objective
Implement M3 (Frontend UI Presets & MAANG Enhancements) and M4 (Pytest & Playwright Automated Test Suites) for ATSlens, ensuring 100% verification and clean test pass.

## Milestones & Tasks

### M3: Frontend UI Presets & MAANG Enhancements
1. Selectable Demo Resume Presets: "Google Senior Frontend Engineer", "Meta Backend Engineer", "AI Research Intern" in `Hero.tsx` / `frontend/src/`.
2. Sub-score progress bars (`Experience`, `Skills`, `Education`, `Impact`) and Missing Tech Stack badges rendered seamlessly in the UI.
3. PDF Evaluation Summary download button triggering `POST /api/export-pdf`.

### M4: Pytest & Playwright Automated Test Suites
1. Backend integration test suite with `pytest` & `httpx` verifying security validations (rate limiting, payload caps, magic bytes), sub-scores, and PDF export.
2. Frontend E2E & component test suite with `playwright` verifying preset selection, score display, and PDF export trigger.

## Workflow & Verification Strategy
1. **Survey / Investigation**: Spawn 3 parallel Explorers to analyze frontend components, backend endpoints, and test environment setup.
2. **Implementation (M3)**: Dispatch Worker to implement M3 frontend features.
3. **Review & Integrity (M3)**: Dispatch Reviewers and Auditor.
4. **Implementation (M4)**: Dispatch Worker to build pytest and playwright test suites and verify execution.
5. **Review & Integrity (M4)**: Dispatch Reviewers and Auditor.
6. **Final Gate & Reporting**: Verify test passes, summarize results, and report completion.
