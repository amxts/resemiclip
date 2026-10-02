/**
 * ReSemiclip for amxts plugins: who walks through whom, as a rule over two
 * players. The ReSemiclip module keeps, for each player, the players he is not
 * solid to; this module asks the rule and tells it, again whenever what the
 * rule reads may have changed. How to use it: README.md.
 */
import { ClientPutinserverEvent, Player, TeamInfoMessage, game, server } from "@amxts/core";
import { LibType_Library } from "@amxts/core/constants";
import { LibraryExists, resemiclip_get_user_mask, resemiclip_set_user_mask, resemiclip_take_control } from "@amxts/core/natives";

export default defineModule({
	meta: { name: "resemiclip" },
	imports: [{ from: "@amxts/resemiclip", name: "semiclip" }],
	setup() {
		server.addEventListener("init", start);
		server.addEventListener("putinserver", joined);
		server.addEventListener("disconnected", event => left(event.player));
		server.addMessageListener("team", teamChanged);
		server.addEventListener("playerchange", event => changed(event.player));
		game.addEventListener("spawn", event => changed(event.player), true);
		game.addEventListener("killed", event => changed(event.player), true);
	},
});

/**
 * Whether `player` walks through `target`. ReSemiclip lets two players
 * through each other only when the rule says so both ways.
 */
export type SemiclipRule = (player: Player, target: Player) => boolean;

let current: SemiclipRule | null = null;

/** The server is up. A rule set while the plugins are still loading waits for it. */
let started = false;

/** What ReSemiclip was told, by player: bit `N` - player `N + 1` is walked through. */
const masks = new Map<number, number>();

// Asked once: the ReSemiclip module is either on the server for the map or not.
let answered = false;
let present = false;

/** Whether the ReSemiclip module is loaded; the first time it is not, the console says so. */
function loaded() {
	if (answered) return present;
	answered = true;
	present = LibraryExists("resemiclip", LibType_Library) != 0;
	if (!present) console.error("[ReSemiclip] the resemiclip module is not on the server: semiclip does nothing");
	return present;
}

/**
 * Who walks through whom, set as a rule over two players - `semiclip`, which
 * plugins use without an import:
 *
 * ```ts
 * semiclip.rule = (player, target) => player.isAlive && target.isAlive && player.team == target.team;
 * ```
 */
export class Semiclip {
	/**
	 * Whether `player` walks through `target`. Setting it takes the rules over
	 * from ReSemiclip and works every pair out; `null` gives them back. The
	 * pairs are worked out again when a player comes or leaves, spawns, dies or
	 * changes sides, and when a field plugins added to `Player` changes.
	 *
	 * Pawn: `resemiclip_take_control`, `resemiclip_set_user_mask`
	 */
	get rule() {
		return current;
	}

	set rule(rule: SemiclipRule | null) {
		if (rule != null && current != null && rule != current) console.warn("[ReSemiclip] a rule was set over another one: the last one set is used");
		current = rule;
		if (started) apply();
	}

	/**
	 * Works the pairs out again - `player`'s, or everyone's - after something
	 * the rule reads changed that the module does not hear: a round's mode, a
	 * plugin's own record.
	 */
	update(player?: Player) {
		const rule = activeRule();
		if (rule == null) return;
		if (player) updatePlayer(player, rule);
		else updateAll(rule);
	}

	/**
	 * The players `player` walks through: those he is not solid to.
	 *
	 * Pawn: `resemiclip_get_user_mask`
	 */
	passesThrough(player: Player) {
		const mask = loaded() ? resemiclip_get_user_mask(player.id) : 0;
		return server.players.filter(other => other.id != player.id && (mask & bitOf(other)) != 0);
	}
}

/** Who walks through whom: the rule, the pairs worked out again, and what ReSemiclip has. */
export const semiclip = new Semiclip();

function start() {
	started = true;
	apply();
}

/** Takes the rules from ReSemiclip for the rule, or gives them back, and works every pair out. */
function apply() {
	if (!loaded()) return;
	masks.clear();
	const rule = current;
	resemiclip_take_control(rule != null);
	if (rule != null) updateAll(rule);
}

/** The rule, while the module sets the pairs: the server is up, ReSemiclip is there and a rule is set. */
function activeRule() {
	return started && present ? current : null;
}

function joined(event: ClientPutinserverEvent) {
	const player = new Player(event.player.id);
	changed(player);
}

/** A team change is sent to everyone; a TeamInfo to one player only brings him up to date. */
function teamChanged(event: TeamInfoMessage) {
	const target = event.target;
	if (event.player == null && target != null) changed(target);
}

/** Something the rule may read changed on `player`: his pairs, both ways. */
function changed(player: Player) {
	const rule = activeRule();
	if (rule != null) updatePlayer(player, rule);
}

/** `player` left: nobody walks through his slot, and it is forgotten for the next to take it. */
function left(player: Player) {
	masks.delete(player.id);
	if (activeRule() == null) return;
	for (const other of server.players) {
		if (other.id != player.id) tell(other, withBit(maskOf(other), player, false));
	}
}

function updateAll(rule: SemiclipRule) {
	const players = server.players;
	for (const player of players) tell(player, maskFor(players.filter(other => other.id != player.id && rule(player, other))));
}

function updatePlayer(player: Player, rule: SemiclipRule) {
	const others = server.players.filter(other => other.id != player.id);
	tell(player, maskFor(others.filter(other => rule(player, other))));
	for (const other of others) tell(other, withBit(maskOf(other), player, rule(other, player)));
}

/** Tells ReSemiclip whom `player` walks through, when that changed. */
function tell(player: Player, mask: number) {
	if (masks.has(player.id) && masks.get(player.id) == mask) return;
	masks.set(player.id, mask);
	resemiclip_set_user_mask(player.id, mask);
}

/** What ReSemiclip was told for `player`. */
function maskOf(player: Player) {
	return masks.has(player.id) ? masks.get(player.id) : 0;
}

/** The module's mask for these players: a bit each. */
function maskFor(players: Player[]) {
	let mask = 0;
	for (const one of players) mask = mask | bitOf(one);
	return mask;
}

/** `mask` with `player`'s bit on or off. */
function withBit(mask: number, player: Player, on: boolean) {
	return on ? mask | bitOf(player) : mask & ~bitOf(player);
}

/** The module's bit for a player: one per slot, 1 << (id - 1). */
function bitOf(player: Player) {
	return 1 << (player.id - 1);
}
