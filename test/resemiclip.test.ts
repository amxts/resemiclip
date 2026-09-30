// ReSemiclip on the fake server: the playground's spawn protection plugin sets
// a rule - teammates walk through each other, a player just spawned through
// everyone alive for 3 seconds - and the module works the pairs out, again
// whenever something the rule reads changes. Its masks are what the ReSemiclip
// module is told.
import { describe, expect, setDefaultTimeout, test } from "bun:test";
import { setup } from "@amxts/core/test-utils";

setDefaultTimeout(120_000);

/** The mask of the players with these ids. */
const bits = (...ids: number[]) => ids.reduce((mask, id) => mask | (1 << (id - 1)), 0);

describe("resemiclip", () => {
	test("the rule takes the rules over and sets every pair as players come", async () => {
		const server = await setup({ rootDir: "playground" });
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		const carl = server.join("Carl", { team: "TERRORIST" });

		expect(server.semiclipControlled).toBe(true);
		expect(server.semiclipMasks.get(alice.id)).toBe(bits(bob.id));
		expect(server.semiclipMasks.get(bob.id)).toBe(bits(alice.id));
		expect(server.semiclipMasks.get(carl.id)).toBe(0);

		bob.say("/through");
		expect(server.log).toContain("Bob walks through: Alice");
	});

	test("a field written, a team changed, a death, a spawn and a player leaving are heard without update()", async () => {
		const server = await setup({ rootDir: "playground" });
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		const carl = server.join("Carl", { team: "TERRORIST" });

		// A field: a player just spawned walks through everyone alive, and
		// everyone through him, until the timer takes his protection off.
		server.fireHook("spawn", [carl.id]);
		expect(server.semiclipMasks.get(carl.id)).toBe(bits(alice.id, bob.id));
		expect(server.semiclipMasks.get(alice.id)).toBe(bits(bob.id, carl.id));

		server.advance(3000);
		expect(server.semiclipMasks.get(carl.id)).toBe(0);
		expect(server.semiclipMasks.get(alice.id)).toBe(bits(bob.id));

		// A team: the game tells everyone with TeamInfo.
		bob.team = "TERRORIST";
		server.sendMessage("TeamInfo", [bob.id, "TERRORIST"]);
		expect(server.semiclipMasks.get(bob.id)).toBe(bits(carl.id));
		expect(server.semiclipMasks.get(alice.id)).toBe(0);

		// A death and a spawn, which protects him again.
		carl.alive = false;
		server.fireHook("killed", [carl.id, 0, 0]);
		expect(server.semiclipMasks.get(bob.id)).toBe(0);
		carl.alive = true;
		server.fireHook("spawn", [carl.id]);
		expect(server.semiclipMasks.get(bob.id)).toBe(bits(carl.id));
		expect(server.semiclipMasks.get(alice.id)).toBe(bits(carl.id));
		server.advance(3000);
		expect(server.semiclipMasks.get(alice.id)).toBe(0);

		// Leaving: nobody walks through the slot the next player takes.
		carl.disconnect();
		expect(server.semiclipMasks.get(bob.id)).toBe(0);
		const dave = server.join("Dave", { team: "CT" });
		expect(dave.id).toBe(carl.id);
		expect(server.semiclipMasks.get(dave.id)).toBe(bits(alice.id));
		expect(server.semiclipMasks.get(bob.id)).toBe(0);
	});

	test("the last rule set wins, with a warning; update() works it out again; null gives the rules back", async () => {
		const server = await setup({ rootDir: "playground" });
		await server.load("test/rules.ts");
		const alice = server.join("Alice");
		const bob = server.join("Bob");
		expect(server.semiclipMasks.get(alice.id)).toBe(bits(bob.id));

		alice.say("/rules");
		expect(server.log).toContain("a rule was set over another one: the last one set is used");
		expect(server.semiclipMasks.get(alice.id)).toBe(0);

		alice.say("/open");
		expect(server.semiclipMasks.get(alice.id)).toBe(bits(bob.id));
		expect(server.semiclipMasks.get(bob.id)).toBe(bits(alice.id));

		alice.say("/release");
		expect(server.semiclipControlled).toBe(false);
	});

	test("without the ReSemiclip module, one line in the console and nothing else", async () => {
		const server = await setup({ rootDir: "playground", modules: ["reapi"] });
		const alice = server.join("Alice");

		server.fireHook("spawn", [alice.id]);
		server.advance(3000);
		alice.say("/through");

		expect(server.semiclipControlled).toBe(false);
		expect(server.semiclipMasks.size).toBe(0);
		expect(server.log.split("\n").filter(line => line.includes("resemiclip module is not on the server"))).toHaveLength(1);
		expect(server.log).toContain("Alice walks through: ");
	});
});
