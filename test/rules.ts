// A second plugin for test/resemiclip.test.ts, beside the playground's: a rule
// over state of its own, which it tells the module about with update(), set
// over the playground's. A file of the package is not a plugin's, so it
// imports what it uses.
import { server } from "@amxts/core";
import { semiclip } from "@amxts/resemiclip";

let open = false;

server.addCommand("/rules", () => {
	semiclip.rule = () => open;
});

server.addCommand("/open", () => {
	open = true;
	semiclip.update();
});

server.addCommand("/release", () => {
	semiclip.rule = null;
});
