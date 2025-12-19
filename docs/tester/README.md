# Tester Documentation

This folder contains documents created by the Tester Agent.

## Handoffs TO Tester

Handoffs from Developer to Tester are located in feature folders:
- `docs/features/[feature-name]/[feature-name]-handoff-tester.md`

## Test Reports

Test reports are located here:
- **[Fantasy vs Team Test Report](FANTASY_VS_TEAM_DIFFERENTIATION_TEST_REPORT.md)** - Fantasy vs Team differentiation test results
- **[Fantasy vs Team Test Files](FANTASY_VS_TEAM_TEST_FILES.md)** - Test files
- **[Personalized Alerts Test Report](PERSONALIZED_ALERTS_TEST_REPORT.md)** - Personalized alerts test results
- **[Personalized Alerts Test Files](PERSONALIZED_ALERTS_TEST_FILES.md)** - Test files
- **[UI/UX Overhaul Test Report](UI_UX_OVERHAUL_TEST_REPORT.md)** - UI/UX overhaul test results
- **[Navigation Routes Fix Handoff](navigation-routes-fix-handoff-tester.md)** - Navigation testing

## Workflow

1. **Receive Handoff**: Check `docs/features/[feature-name]/*handoff-tester*.md`
2. **Test**: Follow test plan and acceptance criteria
3. **Create Test Report**: Create `docs/tester/[feature-name]-test-report.md`
4. **Handoff Back**: 
   - If bugs found → Create `docs/features/[feature-name]/[feature-name]-bugs-[date].md` for Developer
   - If design issues → Create `docs/features/[feature-name]/[feature-name]-design-issues-[date].md` for UI Designer
   - If complete → Create `docs/features/[feature-name]/[feature-name]-test-report-[date].md` for PPM


