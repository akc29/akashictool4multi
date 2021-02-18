import * as tool from "@akc29/akashictool4multi";

export = (): void => {
	const scene: g.Scene = new g.Scene({
		game: g.game
	});
	const entry = new tool.AkashicEntry({
		scene,
		playableLimit: 2,
		callbackAfterDicision: (members: tool.PlayerInfo[]) => {
			g.game.pushScene(createGameScene(members));
		}
	});
	scene.onLoad.add(() => {
		const contributerPane = createContributerPane(scene, entry);
		const audiencePane = createAudiencePane(scene, entry);
		let isJoined: boolean = false;
		scene.append(audiencePane);
		scene.onUpdate.add(() => {
			const members = entry.getPlayableMembers();
			if (members) {
				g.game.pushScene(createGameScene(members));
			}
			if (g.game.joinedPlayerIds.indexOf(g.game.selfId) !== -1) {
				if (!isJoined) {
					isJoined = true;
					scene.remove(audiencePane);
					scene.append(contributerPane);
					entry.enter({
						id: g.game.selfId,
						name: "player" + g.game.selfId
					}, true);
				}
			} else {
				if (isJoined) {
					isJoined = false;
					scene.remove(contributerPane);
					scene.append(audiencePane);
					entry.cancel(g.game.selfId);
				}
			}
		})
	});
	g.game.pushScene(scene);
};

const createContributerPane = (scene: g.Scene, entry: tool.AkashicEntry): g.Pane => {
	const pane = new g.Pane({
		scene,
		width: g.game.width,
		height: g.game.height,
		local: true
	});
	const font = new g.DynamicFont({
		game: g.game,
		fontFamily: "serif",
		size: 48
	});
	const entryCountLabel = createEntryCountLabel(scene, entry, font);
	pane.append(entryCountLabel);
	const limitLabel = new g.Label({
		scene,
		text: "参加可能人数：",
		font,
		fontSize: 20,
		textColor: "black",
		textAlign: "left",
		width: 0.05 * g.game.width,
		y: 0.5 * g.game.height,
		local: true
	});
	pane.append(limitLabel);
	const limitButtons = [0, 1, 2].map(num => {
		const button = new g.FilledRect({
			scene,
			cssColor: num === 0 ? "yellow" : "gray",
			x: (0.2 + 0.15 * num) * g.game.width,
			y: 0.5 * g.game.height,
			width: 0.1 * g.game.width,
			height: 0.05 * g.game.height,
			opacity: 0.5,
			local: true,
			touchable: true
		});
		const label = new g.Label({
			scene,
			text: (num + 2) + "人",
			font,
			fontSize: 20,
			textColor: num === 0 ? "red" : "white",
			textAlign: "center",
			width: 0.1 * g.game.width,
			y: 0.05 * button.height,
			local: true
		});
		button.append(label);
		return button;
	});
	for (let i = 0; i < limitButtons.length; i++) {
		const button = limitButtons[i];
		button.onPointUp.add(() => {
			limitButtons.forEach(b => {
				b.cssColor = "gray";
				b.modified();
				(b.children[0] as g.Label).textColor = "white";
				(b.children[0] as g.Label).invalidate();
			});
			button.cssColor = "yellow";
			button.modified();
			(button.children[0] as g.Label).textColor = "red";
			(button.children[0] as g.Label).invalidate();
			entry.setPlayableLimit(2 + i);
		});
		pane.append(button);
	}
	const startButton = new g.FilledRect({
		scene,
		cssColor: "gray",
		x: 0.4 * g.game.width,
		y: 0.8 * g.game.height,
		width: 0.2 * g.game.width,
		height: 0.1 * g.game.height,
		opacity: 0.5,
		local: true,
		touchable: true
	});
	const startLabel = new g.Label({
		scene,
		text: "ゲーム開始",
		font,
		fontSize: 24,
		textColor: "black",
		textAlign: "center",
		width: 0.2 * g.game.width,
		y: 0.05 * startButton.height,
		local: true
	});
	startButton.onPointUp.add(() => {
		entry.decidePlayableMembers();
	});
	startButton.append(startLabel);
	pane.append(startButton);

	return pane;
};

const createAudiencePane = (scene: g.Scene, entry: tool.AkashicEntry): g.Pane => {
	const pane = new g.Pane({
		scene,
		width: g.game.width,
		height: g.game.height,
		local: true
	});
	const font = new g.DynamicFont({
		game: g.game,
		fontFamily: "serif",
		size: 48
	});
	const entryCountLabel = createEntryCountLabel(scene, entry, font);
	pane.append(entryCountLabel);
	const entryButton = new g.FilledRect({
		scene,
		cssColor: "gray",
		x: 0.25 * g.game.width,
		y: 0.6 * g.game.height,
		width: 0.2 * g.game.width,
		height: 0.1 * g.game.height,
		opacity: 0.5,
		local: true,
		touchable: true
	});
	const entryLabel = new g.Label({
		scene,
		text: "ゲームに参加",
		font,
		fontSize: 20,
		textColor: "white",
		textAlign: "center",
		width: 0.2 * g.game.width,
		y: 0.05 * entryButton.height,
		local: true
	});
	entryButton.onPointUp.add(() => {
		entryButton.cssColor = "yellow";
		entryButton.modified();
		entryLabel.textColor = "red";
		entryLabel.invalidate();
		entry.enter({
			id: g.game.selfId,
			name: "player" + g.game.selfId
		}, true);
	});
	entryButton.append(entryLabel);
	pane.append(entryButton);
	const cancelButton = new g.FilledRect({
		scene,
		cssColor: "gray",
		x: 0.55 * g.game.width,
		y: 0.6 * g.game.height,
		width: 0.2 * g.game.width,
		height: 0.1 * g.game.height,
		opacity: 0.5,
		local: true,
		touchable: true
	});
	const cancelLabel = new g.Label({
		scene,
		text: "参加キャンセル",
		font,
		fontSize: 20,
		textColor: "white",
		textAlign: "center",
		width: 0.2 * g.game.width,
		y: 0.05 * cancelButton.height,
		local: true
	});
	cancelButton.onPointUp.add(() => {
		entryButton.cssColor = "gray";
		entryButton.modified();
		entryLabel.textColor = "white";
		entryLabel.invalidate();
		entry.cancel(g.game.selfId);
	});
	cancelButton.append(cancelLabel);
	pane.append(cancelButton);

	return pane;
};

const createEntryCountLabel = (scene: g.Scene, entry: tool.AkashicEntry, font: g.Font): g.Label => {
	let entryCount = entry.getEnteredMenmberCount();
	const entryCountLabel = new g.Label({
		scene,
		text: "参加人数: " + entryCount,
		font,
		fontSize: 28,
		textColor: "black",
		textAlign: "center",
		width: g.game.width,
		y: 0.25 * g.game.height,
		local: true
	});
	entryCountLabel.onUpdate.add(() => {
		if (entryCount !== entry.getEnteredMenmberCount()) {
			entryCount = entry.getEnteredMenmberCount();
			entryCountLabel.text = "参加人数: " + entryCount;
			entryCountLabel.invalidate();
		}
	});
	return entryCountLabel;
};

const createGameScene = (players: tool.PlayerInfo[]): g.Scene => {
	const scene = new g.Scene({
		game: g.game
	});
	scene.onLoad.add(() => {
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "serif",
			size: 48
		});
		const titleLabel = new g.Label({
			scene,
			text: "参加プレイヤー一覧",
			font,
			fontSize: 28,
			textColor: "black",
			textAlign: "center",
			x: 0.05 * g.game.width,
			y: 0.25 * g.game.height
		});
		scene.append(titleLabel);
		for (let i = 0; i < players.length; i++) {
			const label = new g.Label({
				scene,
				text: players[i].name,
				font,
				fontSize: 20,
				textColor: "black",
				textAlign: "left",
				x: 0.05 * g.game.width,
				y: (0.4 + 0.075 * i) * g.game.height
			});
			scene.append(label);
		}
	});
	return scene;
};
