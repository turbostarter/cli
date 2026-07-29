---
"@turbostarter/cli": minor
---

Add feature flags provider configuration (In Memory, PostHog, GrowthBook) to the `new` project bootstrap flow, including env setup and removing unused flags packages when mobile or extension apps are not selected. Also remove the unused `react-native-ios-utilities` pnpm patch when mobile is not selected so install succeeds.
