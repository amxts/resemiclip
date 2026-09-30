plugin({ name: "Ghosts", version: "0.1.0", author: "kukson777", description: "Tries ReSemiclip out: teammates walk through each other, and a ghost through everyone alive" });

declare module "~/facade" {
	interface Player {
		ghost: boolean;
	}
}

semiclip.rule = (player, target) => player.isAlive && target.isAlive && (player.ghost || target.ghost || player.team == target.team);

server.addCommand("/ghost", (player) => {
	player.ghost = !player.ghost;
	print(player, player.ghost ? "!gGhost mode on" : "!rGhost mode off");
});

server.addCommand("/through", list);

function list(player: Player) {
	const names = semiclip.passesThrough(player).map(other => other.name);
	console.log(`${player.name} walks through: ${names.join(", ")}`);
}
