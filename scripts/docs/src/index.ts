// The tooltips of src/index.ts, in both languages: scripts/apply-docs.ts writes the
// one AMXTS_DOCS_LANG picks into the JSDoc above each element.
export default {
	'SemiclipRule': {
		en: `
			Whether \`player\` walks through \`target\`. ReSemiclip lets two players
			through each other only when the rule says so both ways.
		`,
		ru: `
			Проходит ли \`player\` сквозь \`target\`. ReSemiclip пропускает двух игроков
			друг сквозь друга, только когда правило разрешает это в обе стороны.
		`,
	},
	'Semiclip': {
		en: `
			Who walks through whom, set as a rule over two players - \`semiclip\`, which
			plugins use without an import:

			\`\`\`ts
			semiclip.rule = (player, target) => player.isAlive && target.isAlive && player.team == target.team;
			\`\`\`
		`,
		ru: `
			Кто сквозь кого проходит, заданное правилом над двумя игроками, — \`semiclip\`,
			которым плагины пользуются без импорта:

			\`\`\`ts
			semiclip.rule = (player, target) => player.isAlive && target.isAlive && player.team == target.team;
			\`\`\`
		`,
	},
	'Semiclip.rule': {
		en: `
			Whether \`player\` walks through \`target\`. Setting it takes the rules over
			from ReSemiclip and works every pair out; \`null\` gives them back. The
			pairs are worked out again when a player comes or leaves, spawns, dies or
			changes sides, and when a field plugins added to \`Player\` changes.

			Pawn: \`resemiclip_take_control\`, \`resemiclip_set_user_mask\`
		`,
		ru: `
			Проходит ли \`player\` сквозь \`target\`. Присваивание забирает правила у
			ReSemiclip и рассчитывает каждую пару; \`null\` возвращает их. Пары
			рассчитываются заново, когда игрок заходит или уходит, появляется, умирает
			или меняет команду и когда меняется поле, которое плагины добавили в \`Player\`.

			Pawn: \`resemiclip_take_control\`, \`resemiclip_set_user_mask\`
		`,
	},
	'Semiclip.update': {
		en: `
			Works the pairs out again - \`player\`'s, or everyone's - after something
			the rule reads changed that the module does not hear: a round's mode, a
			plugin's own record.
		`,
		ru: `
			Рассчитывает пары заново — пары \`player\` или всех — после того, как
			изменилось то, что читает правило и чего модуль не слышит: режим раунда,
			собственная запись плагина.
		`,
	},
	'Semiclip.passesThrough': {
		en: `
			The players \`player\` walks through: those he is not solid to.

			Pawn: \`resemiclip_get_user_mask\`
		`,
		ru: `
			Игроки, сквозь которых проходит \`player\`: те, для кого он не твёрдый.

			Pawn: \`resemiclip_get_user_mask\`
		`,
	},
	'semiclip': {
		en: `Who walks through whom: the rule, the pairs worked out again, and what ReSemiclip has.`,
		ru: `Кто сквозь кого проходит: правило, повторный расчёт пар и то, что сейчас у ReSemiclip.`,
	},
};
