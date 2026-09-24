# @turbostarter/cli

## 1.9.0

### Minor Changes

- [#18](https://github.com/turbostarter/cli/pull/18) [`675e5b0`](https://github.com/turbostarter/cli/commit/675e5b096f4565ef71a56b9fa8a48a2d9a01f19b) Thanks [@Bartek532](https://github.com/Bartek532)! - Add AI Kit and Edge Kit project creation to the `new` command, with kit-specific local setup and upstream updates.

## 1.8.0

### Minor Changes

- [`b91365c`](https://github.com/turbostarter/cli/commit/b91365c8e28d93211054e083e5932b5d1c46f4d1) Thanks [@Bartek532](https://github.com/Bartek532)! - Add feature flags provider configuration (In Memory, PostHog, GrowthBook) to the `new` project bootstrap flow, including env setup and removing unused flags packages when mobile or extension apps are not selected. Also remove the unused `react-native-ios-utilities` pnpm patch when mobile is not selected so install succeeds.

## 1.7.0

### Minor Changes

- [`47588f0`](https://github.com/turbostarter/cli/commit/47588f07c4a21305cd0aa5d5b82645c5529c9c6f) Thanks [@Bartek532](https://github.com/Bartek532)! - Add product upsell prompts for Core, AI, and OpenClaw kits, restructure product config, and update dependencies (pnpm 11 with minimum release age).

## 1.6.0

### Minor Changes

- [`ad4d330`](https://github.com/turbostarter/cli/commit/ad4d330eac25dcee2be075757e0457087598689f) Thanks [@Bartek532](https://github.com/Bartek532)! - Add Mailgun as an email provider option and remove app-specific CI workflows when mobile or extension is not selected during project setup.

## 1.5.0

### Minor Changes

- [`97fc656`](https://github.com/turbostarter/cli/commit/97fc6566770c631f90b6390a75ae5a6640c79a78) Thanks [@Bartek532](https://github.com/Bartek532)! - Improve `new` command setup with product name configuration, shared environment prefill across provider prompts, and Dodo Payments as a web billing provider option.

## 1.4.0

### Minor Changes

- [`2e8dd67`](https://github.com/turbostarter/cli/commit/2e8dd67e4bc7ebebc8d01ebead966150d96885a3) Thanks [@Bartek532](https://github.com/Bartek532)! - feat: add project management commands

## 1.3.2

### Patch Changes

- [`99814e0`](https://github.com/turbostarter/cli/commit/99814e07bf5192878bef8e389edbc002bdbf0ca8) Thanks [@Bartek532](https://github.com/Bartek532)! - feat: enhance file modification logic for configured apps

## 1.3.1

### Patch Changes

- [`fc62183`](https://github.com/turbostarter/cli/commit/fc62183d3382332434867a43fdddbfe9e211b2d4) Thanks [@Bartek532](https://github.com/Bartek532)! - fix: make removing files available cross-platform

## 1.3.0

### Minor Changes

- [`dce95ae`](https://github.com/turbostarter/cli/commit/dce95ae4ae55f6e037aeba60199ca76edd8c07c9) Thanks [@Bartek532](https://github.com/Bartek532)! - introduce support for mobile billing setup

## 1.2.1

### Patch Changes

- [#7](https://github.com/turbostarter/cli/pull/7) [`49e5510`](https://github.com/turbostarter/cli/commit/49e551002c5b4abd14931670c612cd5b5e6e82ae) Thanks [@Bartek532](https://github.com/Bartek532)! - fix services packages names

## 1.2.0

### Minor Changes

- [#5](https://github.com/turbostarter/cli/pull/5) [`f29a802`](https://github.com/turbostarter/cli/commit/f29a802f5c8c8fcba99001d18a325c71c74d9f5e) Thanks [@Bartek532](https://github.com/Bartek532)! - monitoring configuration in `new` command

## 1.1.0

### Minor Changes

- [`43388f5`](https://github.com/turbostarter/cli/commit/43388f5a9a5fdec53bef96d0c5d8baafdc112266) Thanks [@Bartek532](https://github.com/Bartek532)! - feat: add analytics configuration to new command

## 1.0.7

### Patch Changes

- [#2](https://github.com/turbostarter/cli/pull/2) [`e09f243`](https://github.com/turbostarter/cli/commit/e09f243cb6038a811cb7470ea17af8031c8759c7) Thanks [@Bartek532](https://github.com/Bartek532)! - fix "new" command for new starter structure

## 1.0.6

### Patch Changes

- [`c395b41`](https://github.com/turbostarter/cli/commit/c395b4133251b4cea09e300740c1d0537531c1b8) Thanks [@Bartek532](https://github.com/Bartek532)! - add polar as billing provider for new project bootstrap
