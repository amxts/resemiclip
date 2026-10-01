plugin({ name: "Spawn protection", version: "0.1.0", author: "kukson777", description: "Tries ReSemiclip out: teammates walk through each other, and a player just spawned through everyone alive for 3 seconds" });

declare module "@amxts/core" {
	interface Player {
		spawnProtected: boolean;
	}
}

semiclip.rule = (player, target) => player.isAlive && target.isAlive && (player.spawnProtected || target.spawnProtected || player.team == target.team);

game.addEventListener("spawn", ({ player }) => {
	player.spawnProtected = true;
	setTimeout(() => (player.spawnProtected = false), 3000);
});

server.addCommand("/through", ({ player }) => list(player));

function list(player: Player) {
	const names = semiclip.passesThrough(player).map(other => other.name);
	console.log(`${player.name} walks through: ${names.join(", ")}`);
}
