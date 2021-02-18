import * as rpi from "@akashic-extension/resolve-player-info";

/**
 * プレイヤー情報
 */
export interface PlayerInfo {
	/** プレイヤーID */
	id: string;
	/** プレイヤー名 */
	name: string;
	/** 
	 * プレミアム会員かどうか
	 * @default false
	*/
	isPremium?: boolean;
}

export interface EntryInfo {
	message: "ENTRY";
	playerInfo: PlayerInfo;
}

export interface CancelInfo {
	message: "CANCEL";
	playerId: string;
}

export interface PlayableLimitInfo {
	message: "PLAYABLE_LIMIT";
	playableLimit: number;
}

export interface PlayableMembersInfo {
	message: "PLAYABLE_MEMBERS";
	playableMembers: PlayerInfo[];
}

/**
 * `AkashicEntry`のコンストラクタに渡すことができるパラメータ
 */
export interface AkashicEntryParameterObject {
	/**
	 * 参加者募集を行うScene
	 */
	scene: g.Scene;

	/**
	 * ゲームに参加できる最大人数
	 * @default 2
	 */
	playableLimit?: number;

	/**
	 * ゲームが開始できる最小人数
	 * @default 1
	 */
	startableCount?: number;

	/**
	 * プレミアム会員の当選しやすさ
	 * デフォルトは3倍
	 */
	premiumuRate?: number;

	/**
	 * 参加者決定後に実行する処理
	 * 第1引数は参加者リスト、第2引数はsetOptionDataメソッドで指定されたオプションデータを表している
	 * @default undefined
	 */
	callbackAfterDicision?: (members: PlayerInfo[], optionMap?: {[key: string]: any}) => void;
}

const DEFAULT_PLAYABLE_LIMIT = 2;
const DEFAULT_STARTABLE_COUNT = 1;
const DEFAULT_PREMIUM_RATE = 3;

/**
 * Akashicマルチゲームの募集に関するクラス
 * ここでは主に以下のことが可能
 * * 参加希望者の管理(追加/削除)
 * * 参加者の抽選処理
 * * 参加者のユーザー名取得
 */
export class AkashicEntry {
	private enteredMembers: PlayerInfo[] = [];
	private playableMembers: PlayerInfo[];
	private optionMap: {[key: string]: any} = {};
	private playableLimit: number = DEFAULT_PLAYABLE_LIMIT;
	private startableCount: number = DEFAULT_STARTABLE_COUNT;
	private premiumuRate: number = DEFAULT_PREMIUM_RATE;

	constructor(param: AkashicEntryParameterObject) {
		if (param.playableLimit && param.playableLimit >= DEFAULT_PLAYABLE_LIMIT) {
			this.playableLimit = param.playableLimit;
		}
		if (param.startableCount && param.startableCount >= DEFAULT_STARTABLE_COUNT) {
			this.startableCount = param.startableCount;
		}
		// プレミアムメリットなのに1未満になるのは流石におかしいので止める
		if (param.premiumuRate && param.premiumuRate >= 1) {
			this.premiumuRate = param.premiumuRate;
		}
		param.scene.onMessage.add((ev: g.MessageEvent) => {
			if (!ev.data || !ev.data.message) {
				return;
			}
			if (ev.data.message === "ENTRY") {
				if (!this.enteredMembers.some(player => player.id === ev.data.playerInfo.id)) {
					this.enteredMembers.push(ev.data.playerInfo);
				}
			} else if (ev.data.message === "CANCEL") {
				this.enteredMembers = this.enteredMembers.filter(player => player.id !== ev.data.playerId);
			} else if (ev.data.message === "PLAYABLE_LIMIT") {
				this.playableLimit = ev.data.playableLimit;
			} else if (ev.data.message === "PLAYABLE_MEMBERS") {
				this.playableMembers = ev.data.playableMembers;
				if (param.callbackAfterDicision) {
					param.callbackAfterDicision(ev.data.playableMembers, this.optionMap);
				}
			} else if (ev.data.message === "OPTION_DATA") {
				this.optionMap[ev.data.key] = ev.data.value;
			} else if (ev.data.message === "PLAYER_NAME") {
				const target = this.enteredMembers.filter(player => player.id === ev.data.playerId);
				if (target.length > 0) {
					target[0].name = ev.data.playerName;
				}
			}
		});
	}

	/**
	 * ゲームに参加できる最大人数を変更する
	 * @param limit ゲームに参加できる最大人数
	 */
	setPlayableLimit(limit: number): void {
		g.game.raiseEvent(new g.MessageEvent({ message: "PLAYABLE_LIMIT", playableLimit: limit }));
	}

	/**
	 * 指定したプレイヤーをゲームに参加希望状態にする
	 * @param playerInfo ゲームへの参加を希望するプレイヤーの情報
	 * @param useResolvePlayerInfo trueならユーザー名取得ライブラリを使う(ニコ生ならユーザー名を使うかどうかのダイアログが表示される)。デフォルトはfalse
	 */
	enter(playerInfo: PlayerInfo, useResolvePlayerInfo: boolean = false): void {
		g.game.raiseEvent(new g.MessageEvent({ message: "ENTRY", playerInfo }));
		if (useResolvePlayerInfo) {
			this.decideName(playerInfo.id);
		}
	}

	/**
	 * 指定したIDのプレイヤーのゲーム参加希望状態を解除する
	 * @param playerId プレイヤーID
	 */
	cancel(playerId: string): void {
		g.game.raiseEvent(new g.MessageEvent({ message: "CANCEL", playerId }));
	}

	/**
	 * ゲームの募集に関係ないオプション情報(例：ゲーム時間、ゲームの内容等)をセットする
	 * @param key 
	 * @param value 
	 */
	setOptionData(key: string, value: any): void {
		g.game.raiseEvent(new g.MessageEvent({ message: "OPTION_DATA", key, value }));
	}

	/**
	 * 指定したIDのプレイヤーに対してユーザー名取得ライブラリを使う(ニコ生ならユーザー名を使うかどうかのダイアログが表示される)
	 * @param playerId プレイヤーID
	 */
	decideName(playerId: string): void {
		rpi.resolvePlayerInfo({limitSeconds: 20}, (error, playerInfo) => {
			if (error) {
				console.error(error);
			} else if (playerInfo.name) {
				g.game.raiseEvent(new g.MessageEvent({ message: "PLAYER_NAME", playerId, playerName: playerInfo.name }));
			}
		});
	}

	/**
	 * ゲームへの参加希望者が最大参加可能人数を超えたかどうか
	 */
	// 多分ほとんどのコンテンツは抽選式で参加者が決まりそうだが、先着で決めるものもありそうなので用意
	isMoreThanLimit(): boolean {
		return this.enteredMembers.length > this.playableLimit;
	}

	/**
	 * ゲーム開始できる人数になったかどうか
	 */
	isAbleToStart(): boolean {
		return this.enteredMembers.length >= this.startableCount;
	}

	/**
	 * ゲームへの参加希望者数を返す
	 */
	getEnteredMenmberCount(): number {
		return this.enteredMembers.length;
	}

	/**
	 * ゲームへの参加者リストを返す
	 */
	getPlayableMembers(): PlayerInfo[] | null {
		if (!this.playableMembers || this.playableMembers.length === 0) {
			return null;
		}
		return this.playableMembers.slice(0, this.playableMembers.length);
	}

	/**
	 * 指定したキーのオプション情報を返す
	 * @param key 
	 */
	getOptionValue(key: string): any {
		return this.optionMap[key];
	}

	/**
	 * 参加希望者の中から実際に参加するプレイヤーを決める
	 * 人数がplayableLimit以下の時は全員、playableLimit超えている時は抽選にする
	 * ただし、配信者は必ず追加+プレミアム当選確率をpremiumuRate倍にする
	 */
	decidePlayableMembers(): void {
		let enteredMembers: PlayerInfo[] = this.enteredMembers.slice(0, this.enteredMembers.length);
		if (enteredMembers.length <= this.playableLimit) {
			g.game.raiseEvent(new g.MessageEvent({ message: "PLAYABLE_MEMBERS", playableMembers: enteredMembers }));
			return;
		}
		let playableMemberIds: string[] = [];
		// 配信者検索。見つけたら抽選候補から消しておく
		enteredMembers = enteredMembers.filter(player => {
			if (g.game.joinedPlayerIds.indexOf(player.id) === -1) {
				return true;
			}
			playableMemberIds.push(player.id);
			return false;
		});
		// 配信者だけでいっぱいになる場合は多分ないと思うが一応用意しておく
		if (playableMemberIds.length >= this.playableLimit) {
			playableMemberIds = playableMemberIds.slice(0, this.playableLimit);
		} else {
			const rest = this.playableLimit - playableMemberIds.length;
			for (let i = 0; i < rest; i++) {
				const player = this.selectPlayerInfo(enteredMembers);
				enteredMembers = enteredMembers.filter(p => p !== player);
				playableMemberIds.push(player.id);
			}
		}
		g.game.raiseEvent(new g.MessageEvent({
			message: "PLAYABLE_MEMBERS",
			playableMembers: this.enteredMembers.filter(player => playableMemberIds.indexOf(player.id) !== -1)
		}));
	}

	private selectPlayerInfo(enteredMembers: PlayerInfo[]): PlayerInfo | null {
		if (enteredMembers.length === 0) {
			return null;
		}
		let totalScore = 0;
		enteredMembers.forEach(player => {
			totalScore += player.isPremium ? this.premiumuRate : 1;
		});
		const random = Math.floor(totalScore * g.game.localRandom.generate());
		let current = 0;
		for (let i = 0; i < enteredMembers.length; i++) {
			const player = enteredMembers[i];
			const rate = player.isPremium ? this.premiumuRate : 1;
			if (current <= random && random < current + rate) {
				return player;
			}
			current = current + rate;
		}
		return null;
	}
}
