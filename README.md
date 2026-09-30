<div align="center">

<img src="assets/logo.svg" width="96" alt="ReSemiclip">

# ReSemiclip

*Who walks through whom, as a rule over two players*

[![amxts module](https://img.shields.io/badge/amxts-module-3178c6?style=flat-square)](https://amxts.github.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API](#api)

**English** | [Русский](README.ru.md)

</div>

Semiclip lets players walk through each other. The [ReSemiclip](https://github.com/Next21Team/resemiclip-amxx) module does it on the server; this module lets an amxts plugin say who walks through whom as a rule over two players, `(player, target) => boolean`, and keeps ReSemiclip up to date with it.

## Features

- **A rule, not bit masks.** One function says whether one player walks through another; the module works every pair out and tells ReSemiclip.
- **Kept up to date by itself.** A spawn, a death, a team change, a player coming or leaving, and a change of any field plugins add to `Player` work the pairs out again - only the pairs of the player it happened to.
- **Missing module said once.** Without ReSemiclip on the server nothing is set, and the console says why, once.
- **One instance per server.** Every plugin that uses it sets the same rule.

## Installation

The server needs the ReSemiclip AMX Mod X module (`resemiclip_amxx`).

```bash
npx amxts module add resemiclip
```

It installs the package and adds it to your project's `amxts.config.ts`:

```ts
export default defineConfig({
	modules: ["@amxts/resemiclip"],
});
```

## Usage

A plugin uses the module as `semiclip`, without an import line: the build adds the import to the plugins that use it, and builds the module only when some plugin does.

Teammates walk through each other:

```ts
semiclip.rule = (player, target) => player.team == target.team;
```

Setting the rule is all it takes: the module works every pair out, and works a player's pairs out again when he spawns, dies, changes sides, comes or leaves. Setting `rule` takes the rules over from ReSemiclip's config; `semiclip.rule = null` gives them back, and so does the plugins' reload or a map change until a rule is set again.

### A rule that changes in play

`spawnProtected` below is the plugin's own [field on `Player`](https://amxts.github.io/docs/game/players#shared-player-fields), declared with `declare module`: it starts `false`, every plugin on the server reads and writes it, and it is cleared when the player leaves. A player who has just spawned walks through everyone alive for 3 seconds, and teammates walk through each other:

```ts
declare module "~/facade" {
	interface Player {
		spawnProtected: boolean;
	}
}

semiclip.rule = (player, target) =>
	player.isAlive && target.isAlive && (player.spawnProtected || target.spawnProtected || player.team == target.team);

game.addEventListener("spawn", ({ player }) => {
	player.spawnProtected = true;                        // walks through everyone for 3 seconds
	setTimeout(() => (player.spawnProtected = false), 3000);
});
```

The module works the pairs out again by itself when the field changes - on the spawn, and when the timer clears it - with no `update()` call.

### When the pairs are worked out

| When | Which pairs |
| --- | --- |
| `rule` is set | every pair |
| a player comes into the game | his |
| a player spawns, dies or changes sides | his |
| a field plugins add to `Player` changes on a player - any plugin's, or Pawn's | his |
| a player leaves | nobody walks through his slot any more |
| `semiclip.update(player)` | `player`'s |
| `semiclip.update()` | every pair |

`update()` is for what the rule reads that the module does not hear - a round's mode kept in a variable, a plugin's own record of a player:

```ts
let everyone = false;

semiclip.rule = (player, target) => everyone || player.team == target.team;

server.addCommand("/party", () => {
	everyone = !everyone;
	semiclip.update();
});
```

### Both ways

`rule(player, target)` says whether `player` walks through `target`. ReSemiclip lets two players through each other only when both ways say so, so a rule that says yes one way and no the other keeps that pair solid. A rule that reads the same both ways - `player.team == target.team`, `player.spawnProtected || target.spawnProtected` - is what makes a pair pass.

### One rule

The rule is one for the server. A plugin that sets it over another plugin's replaces it, and the console warns: the last one set is used. Plugins that each have a say write it into fields (`player.spawnProtected`) that one rule reads.

### Without ReSemiclip on the server

Nothing is set: the module does not take the rules, `passesThrough` gives no one, and the console says once that the resemiclip module is not on the server.

## API

| Member | What it is |
| --- | --- |
| `semiclip.rule` | `(player, target) => boolean` - whether `player` walks through `target`. Setting it takes the rules over and works every pair out; `null` gives them back. |
| `semiclip.update(player?)` | Works `player`'s pairs out again, or everyone's, after something the rule reads changed that the module does not hear. |
| `semiclip.passesThrough(player)` | The players `player` walks through, as ReSemiclip has it. |

For Pawn plugins, ReSemiclip's own natives (`resemiclip_set_user_mask` and the rest) work as they are.
