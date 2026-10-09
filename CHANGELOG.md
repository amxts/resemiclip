# Changelog

## v0.1.3

[compare changes](https://github.com/amxts/resemiclip/compare/v0.1.2...v0.1.3)

### Summary

Runs on amxts 0.2 and 0.3: `@amxts/core` `^0.2.2 || ^0.3.0`. Nothing else changed; its prebuilt plugin is 0.3's, and a 0.2 project compiles it once.

### 📖 Documentation


### ❤️ Contributors

- Ernest Manukyan ([@kukson777](https://github.com/kukson777))

## v0.1.2

[compare changes](https://github.com/amxts/resemiclip/compare/v0.1.1...v0.1.2)

### Summary

Built for `@amxts/core` 0.2.2: the package's prebuilt plugin is compiled with that core, so a project on 0.2.2 takes it as it is instead of compiling the module on its first build. The module's API does not change.

### ⬆️ Upgrade guide

`npx amxts upgrade` in the project takes it with the core.

### 📦 Dependencies

| Package | Range |
| --- | --- |
| `@amxts/core` | `^0.2.0`, prebuilt for 0.2.2 |

### ❤️ Contributors

- Ernest Manukyan ([@kukson777](https://github.com/kukson777))

## v0.1.1

[compare changes](https://github.com/amxts/resemiclip/compare/v0.1.0...v0.1.1)

### Summary

resemiclip for amxts 0.2.0. Its API is unchanged; the rule a plugin sets goes when that plugin stops, so ReSemiclip gets its own rules back.

### ⚠️ Breaking changes

None in resemiclip itself; it needs `@amxts/core` 0.2.

### ⬆️ Upgrade guide

`npx amxts upgrade` in the project updates it with the core.

### 📦 Dependencies

| Package | From | To |
| --- | --- | --- |
| `@amxts/core` | `^0.1.0` | `^0.2.0` |

### 🩹 Fixes

- Give the rules back when the plugin that set the rule stops ([62e06a8](https://github.com/amxts/resemiclip/commit/62e06a8))

### 💅 Refactors

- Import the core's API by its package name ([4024ec5](https://github.com/amxts/resemiclip/commit/4024ec5))
- Command handlers take one object ([16b55d1](https://github.com/amxts/resemiclip/commit/16b55d1))
- `server.players` over `Player.all` ([ab12133](https://github.com/amxts/resemiclip/commit/ab12133))
- Listen to the team message by its new name ([c8a31d9](https://github.com/amxts/resemiclip/commit/c8a31d9))
- Hear `putInServer` and `playerChange` by their new names ([9b407b7](https://github.com/amxts/resemiclip/commit/9b407b7))

### 📖 Documentation

- The rule goes with the plugin that set it ([7a4ce5b](https://github.com/amxts/resemiclip/commit/7a4ce5b))

### ❤️ Contributors

- Ernest Manukyan ([@kukson777](https://github.com/kukson777))
