//----------------------------------------
//----------------------------------------
// AI(調整用)
//----------------------------------------
//----------------------------------------

let othello_AI = new Array();

othello_AI.original = function (board, turn) {
	let return_arr;
	eval(editor.getValue());
	return return_arr;
}
othello_AI.AI1 = function (board, turn) {
	//調整する項目
	let Factor_NumOfDiscs = 1; //返す石の数をどれぐらい重要視するか（0以上の場合は多く返したがる。0以下だと少なく返したがる。）
	let eval_board = [ //盤面のそれぞれの位置の価値を設定（大きい数字なほど優先して打つようになる）
		[1, 1, 1, 1, 1, 1, ],
		[1, 1, 1, 1, 1, 1, ],
		[1, 1, 1, 1, 1, 1, ],
		[1, 1, 1, 1, 1, 1, ],
		[1, 1, 1, 1, 1, 1, ],
		[1, 1, 1, 1, 1, 1, ],
	];


	// 発展的なヒント（空きマスが8個未満の時にFactor_NumOfDiscsを3にする場合は以下のようにします）
	//		[numBlack, numWhite, numSpace] = CountStone(board.copy()); //石の数を数える。numBlackが黒石の数、numWhiteが白石の数、numSpaceが空きマスの数
	//		if (numSpace < 8){  //もし空きマスが８個未満だったら
	//      Factor_NumOfDiscs = 3;
	//    }

	//評価値の計算
	let movelist = MovelistFunc(board.copy(), turn);
	let eval_list = []
	let eval_high = 0
	for (let i = 0; i < movelist.length; i++) {
		eval_list.push(eval_board[movelist[i][0]][movelist[i][1]] + Factor_NumOfDiscs * movelist[i][2] + Math.random() * 0.1);
	}
	best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list))
	best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]]
	return [best_move_array, eval_list];
}


//----------------------------------------
//----------------------------------------
// パラメータの設定
//----------------------------------------
//----------------------------------------
//定数
let BOARDSIZE = 6;
let BLOCKSIZE = 80; // １マスのサイズ
let CANVASSIZE = BLOCKSIZE * BOARDSIZE; // ボードのサイズ
let NUMSIZE = 20; // ボード横の番号幅
let ANALYSISSIZE = 20; //解析結果の数字の大きさ
let DELAYDURATION = 700 // 打ってから反映するまでの時間
let ENDDURATION = 1000 // AI同士でげーむ終了してから次のゲーム開始までの時間

//変数
let mouseX = 0; // マウスの横方向座標
let mouseY = 0; // マウスの縦方向座標
let mouseBlockX = ~~(mouseX / BLOCKSIZE); // マウスのマス上での横方向座標
let mouseBlockY = ~~(mouseY / BLOCKSIZE); // マウスのマス上での縦方向座標
gameEndFlag = 0; // ゲーム進行フラグ
AIthinkFlag = 0; // ゲーム進行フラグ
restartFlag = 0;
let blackStoneNum = 0; // 黒石の数
let whiteStoneNum = 0; // 白石の数
let Role = [0, 0, 1]; // 思考（Role[0]が白番、Role[1]が黒番,Role[2]が解析用AI、0:人間、1:CPU1、2:CPU2）
// ボード脇の文字表示
let boardWordVer = new Array('A', 'B', 'C', 'D', 'E', 'F');
let boardWordHor = new Array('1', '2', '3', '4', '5', '6');

let black_wins = 0;
let white_wins = 0;
let draws = 0;

//----------------------------------------
//----------------------------------------
// オセロゲームを制御するクラス
//----------------------------------------
//----------------------------------------
class Game {
	constructor(AI1, AI2) {
		this.init(AI1, AI2);
	} //コンストラクタ（	クラスのインスタンス生成時に呼ばれる）
	init(AI1, AI2) {
		//AIの初期化

		this.num_moves= 0;
		this.Role = [];
		this.Role[0] = AI1;
		this.Role[1] = AI2;

		//パラメータの初期化
		this.turn = 1; // ターン(1が黒、-1が白)
		this.pass = 0; //パス（直前がパスの時は1、それ以外は0）
		// ボードの初期化
		this.board = new Array(); // ボード配列
		for (let i = 0; i < BOARDSIZE*BOARDSIZE; i++) {
			this.board[i] = new Array();
		for (let j = 0; j < BOARDSIZE; j++) {
			this.board[i][j] = new Array();
			for (let k = 0; k < BOARDSIZE; k++) {
				this.board[i][j][k] = 0;
			}
		}
	}
		this.board[0][2][3] = this.board[0][3][2] = 1;
		this.board[0][2][2] = this.board[0][3][3] = -1;


		this.nextmove = []; //次の一手の配列
		this.eval_list = []; //評価値リストの配列


	}

	AIturn() { //AIの思考
		draw(ctx, canvas); //再描画
		let movelist = MovelistFunc(this.board[this.num_moves], this.turn); //着手可能な箇所を探索
		if (movelist.length == 0) { //打てるところがない時はパスするか、終了するかを判定する
			let result_Diff;
			[result_Diff, this.turn, this.pass] = isEnd(this.board[this.num_moves], this.turn, this.pass); //終了判定
			if (result_Diff != 100) { //既に一度パスをしていたら終了
				gameOver(result_Diff); //gameoverに石差を渡す
				return;
			} else if (this.Role[0.5 + this.turn * 0.5] != 0) { //パスする場合、相手がAIならAIturn()を呼ぶ
				return this.AIturn();
			} else { //パスする場合、相手が人なら待機する。
				draw(ctx, canvas); //再描画
				AIthinkFlag = 0; //AI思考中のロックを解除
				return;
			}
		}
		this.pass = 0; //打てるところがある場合passのフラグを0にする
		let AI_name = Role[0.5 + this.turn * 0.5]; //AIの名前を定義
		[this.nextmove, this.eval_list] = othello_AI[AI_name](this.board[this.num_moves], this.turn); //AIの呼び出し、盤面から最善手及びそれぞれの評価値を返す
		[this.board[this.num_moves + 1], this.turn] = putStone(this.board[this.num_moves].copy(), this.turn, this.nextmove[0], this.nextmove[1]);
		this.num_moves += 1;		draw(ctx, canvas); //再描画
		AIthinkFlag = 0; //AI思考中のロックを解除
		if (this.Role[0.5 + this.turn * 0.5] != 0) { //相手がAIの時はAIturn()を呼ぶ
			AIthinkFlag = 1; //AI思考中のロック
			setTimeout("game.AIturn()", DELAYDURATION);
		}
	}
	humanTurn(x, y) {
		draw(ctx, canvas);
		let movelist = MovelistFunc(this.board[this.num_moves], this.turn);
		if (movelist.length == 0) {
			//終了判定
			let result_Diff;
			[result_Diff, this.turn, this.pass] = isEnd(this.board[this.num_moves], this.turn, this.pass);
			if (result_Diff != 100) {
				gameOver(result_Diff);
			} else if (this.Role[0.5 + this.turn * 0.5] != 0) {
				return this.AIturn();
			} else {
				return;
			}
		}
		this.pass = 0;

		[this.board[this.num_moves+1], this.turn] = putStone(this.board[this.num_moves].copy(), this.turn, x, y);
		this.num_moves +=1;
		draw(ctx, canvas);

		if (this.Role[0.5 + this.turn * 0.5] != 0) {
			AIthinkFlag = 1;
			setTimeout("game.AIturn()", DELAYDURATION);
		}
	}


}



//----------------------------------------
//----------------------------------------
// オセロの動作・盤面描画に関する関数
//----------------------------------------
//----------------------------------------

//----------------------------------------
// 初期化
//----------------------------------------
function init() {



	//イベントリスナの設定
	// マウスが動くとmoveMouseを呼び出す
	canvas.onmousemove = function (event) {
		if (gameEndFlag == 0 && AIthinkFlag == 0) {
			moveMouse(event);
			draw(ctx, canvas);
		}
	}
	//マウスがクリックするとhumanTurnを呼び出す。既にゲーム終了後の場合はinitを呼び出す。
	canvas.onclick = function () {
		if (gameEndFlag == 1) {

			rematch(Role[0], Role[1]);
		} else if (AIthinkFlag == 0) {
			game.humanTurn(mouseBlockX, mouseBlockY) == 1;
		}

	}
	//パラメータの初期化
	gameEndFlag = 0;
	game = new Game(Role[0], Role[1]);
	// キャンバスの設定
	window.addEventListener('resize', canvas_resize, false);
	canvas_resize();
	// 初期描画
	draw(ctx, canvas);

	//初手がAIの場合はAIの思考を開始
	if (Role[1] != 0) {
		AIthinkFlag = 1;
		reuslt = game.AIturn();
	}
}
//----------------------------------------
// canvasサイズが変更されたときの調整
//----------------------------------------
function canvas_resize() {

	
	boardarea = document.getElementsByClassName('boardarea');
	canvas = document.getElementById('canvas');
	canvas.setAttribute('width', boardarea[0].clientWidth * 0.8);
	canvas.setAttribute('height', boardarea[0].clientWidth * 0.8);
	if (!canvas || !canvas.getContext) {
		return false;
	}
	ctx = canvas.getContext('2d'); // contextを取得する
	CANVASSIZE = canvas.clientWidth - NUMSIZE - 1;
	BLOCKSIZE = CANVASSIZE / (BOARDSIZE);
	ANALYSISSIZE = 0.5 * BLOCKSIZE;
	draw(ctx, canvas);

}

//----------------------------------------
// 設定ボタンをおした時の動作
//----------------------------------------
function restart() {
	//戦歴をリセットする
	document.getElementById('black_win_num').innerHTML = 0;
	document.getElementById('white_win_num').innerHTML = 0;
	document.getElementById('draw_win_num').innerHTML = 0;

	//	黒番と白番の思考を読み込む
	Role[2] = document.Preference.ana_role.value;
	Role[1] = document.Preference.black_role.value;
	Role[0] = document.Preference.white_role.value;

	game.Role[0] = Role[0];
	game.Role[1] = Role[1];
	//	ゲームスピードを設定する
	game_speed = document.Preference.game_speed.value;
	if (game_speed == 0) { //低速
		DELAYDURATION = 1000;
		ENDDURATION = 1000;
	} else if (game_speed == 1) { //高速
		DELAYDURATION = 100;
		ENDDURATION = 200;
	} else { //超高速
		DELAYDURATION = 0;
		ENDDURATION = 0;
	}


	//	手番がAI

	if (Role[0.5 + game.turn * 0.5] != 0 && restartFlag == 0) {
		AIthinkFlag = 1;

		game.AIturn();
	}

	//	１つ前が全自動の時は新たにAIturn()を呼ばないようにフラグを立てる
	if ((Role[0] != 0 && Role[1] != 0)) {
		restartFlag = 1;
	} else {
		restartFlag = 0;
	}
}

function moves_back(){
	game.turn *= -1;
	game.num_moves -=1;
	draw(ctx, canvas); //再描画
}

//----------------------------------------
// ゲーム終了時に呼び出す関数
//----------------------------------------
function gameOver(result_Diff) {
	gameEndFlag = 1; //ゲーム終了フラグをtrueにする。

	if (result_Diff > 0) { //黒勝ち
		black_wins += 1;
	} else if (result_Diff < 0) { //白勝ち
		white_wins += 1;
	} else { //引き分け勝ち
		draws += 1;
	}
	//勝敗の判定
	total_games = black_wins + white_wins + draws;
	console.log(document.getElementById('black_wins').style.width, black_wins / total_games * 100 + ' %');

	document.getElementById('black_wins').setAttribute("style", "width: " + black_wins / total_games *100 + "%");
	document.getElementById('white_wins').setAttribute("style", "width: " + white_wins / total_games *100 + "%");
	document.getElementById('draws').setAttribute("style", "width: " + draws / total_games *100 + "%");
	document.getElementById('black_wins').innerHTML = black_wins;
	document.getElementById('white_wins').innerHTML = white_wins;
	document.getElementById('draws').innerHTML = draws;
	document.getElementById('black_wins').style.width = '100 %';

	//CPU同士の対決の場合は自動的に次の対局を開始
	if (game.Role[0] != 0 && game.Role[1] != 0) {
		setTimeout("rematch(Role[0],Role[1])", ENDDURATION);
	}
}

//----------------------------------------
// ゲーム終了時に呼び出す関数
//----------------------------------------
function rematch(AI0, AI1) {
	gameEndFlag = 0; //ゲーム終了フラグをtrueにする。

	game.init(AI0, AI1);

	draw(ctx, canvas); //再描画\
	if (game.Role[1] != 0) {

		AIthinkFlag = 1;
		setTimeout("game.AIturn()", DELAYDURATION);
	}
}


//----------------------------------------
// 石を返す
//----------------------------------------
function turnStone(board_temp, x, y, i, j, turn) {

	if (i == 0 && j == 0) {
		return [0, board_temp];
	} //　i = 0　かつ j = 0のときはスキップ
	x += i;
	y += j;

	// 盤面からはみ出したらスキップ
	if (x < 0 || x > BOARDSIZE - 1 || y < 0 || y > BOARDSIZE - 1) {
		return [0, board_temp];
	}

	//	石を返すかを判定する
	if (board_temp[x][y] == 0) { // 何もないとき
		return [0, board_temp]; //0を返す
	} else if (board_temp[x][y] == turn) { // 自分の石があるとき
		return [3, board_temp]; //3を返す
	} else { // 相手の石があるとき
		[turn_flag, board_temp] = turnStone(board_temp, x, y, i, j, turn); //さらに次の石をチェック
		if (turn_flag >= 2) { // 最後に自分の石があればひっくり返す
			board_temp[x][y] = turn; // 石を返す
			return [2, board_temp]; //返せたときは2を返す
		}
		return [1, board_temp]; //自分の石がその先にないときは1を返す
	}
}

//----------------------------------------
// 石を返す数を返す
//----------------------------------------
function turnNum(board, x, y, i, j, turn, turn_num) {

	if (i == 0 && j == 0) {
		return 0;
	}

	x += i;
	y += j;

	// 例外処理
	if (x < 0 || x > BOARDSIZE - 1 || y < 0 || y > BOARDSIZE - 1) {
		return 0;
	}

	// 何もないとき
	if (board[x][y] == 0) {
		return 0;
		// 自分の石があるとき
	} else if (board[x][y] == turn) {
		return turn_num;

		// 相手の石があるとき
	} else {
		// 最後に自分の石があればひっくり返す
		return turnNum(board, x, y, i, j, turn, turn_num + 1);
	}
}



function putStone(board, turn, x, y) {
	// 可否確認

	if (board[x][y] != 0) {
		return [board, turn];
	}


	// 石を返す
	let turnCheck = 0;
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			[turn_flag, temp_board] = turnStone(board, x, y, i, j, turn);
			if (turn_flag == 2) {
				turnCheck = 1;
				board = temp_board;
			}
		}
	}
	// 石を置けるかの可否確認
	if (turnCheck == 0) {
		return [board, turn];
	}

	// 石を置く
	board[x][y] = turn;

	// 順番を入れ替える
	turn *= -1;

	return [board, turn];

}

function MovelistFunc(board, turn) {
	movelist = [];
	turn_num_all = 0;
	openess_all = 0;

	//----------置けるかどうかの確認----------
	move_num = 0;
	turnCheck = 0;
	for (let x = 0; x < BOARDSIZE; x++) {
		for (let y = 0; y < BOARDSIZE; y++) {
			turn_num_all = 0;
			if (board[x][y] == 0) {
				for (let i = -1; i <= 1; i++) {
					for (let j = -1; j <= 1; j++) {
						[turn_num, openess] = countOpeness(board, x, y, i, j, turn, 0, 0);
						turn_num_all += turn_num;
						openess_all += openess;
					}
				}
			}
			if (turn_num_all > 0) {
				movelist[move_num] = [x, y, turn_num_all, openess_all];
				move_num++;

			}
		}
	}
	return movelist;
}

function MovelistFuncLite(board, turn) {
	let movelist = new Array();
	let turn_num_all = 0;
	let turn_num = 0;
	//----------置けるかどうかの確認----------
	move_num = 0;
	for (let x = 0; x < BOARDSIZE; x++) {
		for (let y = 0; y < BOARDSIZE; y++) {
			turn_num_all = 0;
			if (board[x][y] == 0) {
				for (let i = -1; i <= 1; i++) {
					for (let j = -1; j <= 1; j++) {
						turn_num = turnNum(board, x, y, i, j, turn, 0);
						turn_num_all += turn_num;
					}
				}
				if (turn_num_all > 0) {
					movelist[move_num] = [x, y, turn_num_all];
					move_num++;
				}
			}
		}
	}
	return movelist;
}


//----------------------------------------
// マウスの移動
//----------------------------------------
function moveMouse(event) {
	console.log(canvas.offsetLeft, canvas.offsetTop);
	// マウス座標の取得
	if (event) {
		mouseX = event.pageX - canvas.offsetLeft;
		mouseY = event.pageY - canvas.offsetTop - 80;
	} else {
		mouseX = event.offsetX;
		mouseY = event.offsetY;
	}

	// 実座標
	mouseX = ~~(mouseX / canvas.offsetWidth * (CANVASSIZE + NUMSIZE));
	mouseY = ~~(mouseY / canvas.offsetHeight * (CANVASSIZE + NUMSIZE));

	// マス座標
	mouseBlockX = ~~((mouseX - NUMSIZE - 0.5) / BLOCKSIZE);
	mouseBlockY = ~~((mouseY - NUMSIZE - 0.5) / BLOCKSIZE);
}



//----------------------------------------
// すべての描画
//----------------------------------------
function draw(ctx, canvas) {
	// マウス位置の取得
	let mouseBlockXr = mouseBlockX * BLOCKSIZE + NUMSIZE;
	let mouseBlockYr = mouseBlockY * BLOCKSIZE + NUMSIZE;

	// 描画の削除
	ctx.clearRect(0, 0, CANVASSIZE + NUMSIZE, CANVASSIZE + NUMSIZE);

	// 罫線の描画
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.strokeStyle = '#000000';
	for (let i = 0; i <= BOARDSIZE - 1; i++) {
		ctx.moveTo(~~(i * BLOCKSIZE) + NUMSIZE + 0.5, 0.5);
		ctx.lineTo(~~(i * BLOCKSIZE) + NUMSIZE + 0.5, CANVASSIZE + NUMSIZE + 0.5);

		ctx.moveTo(0.5, ~~(i * BLOCKSIZE) + NUMSIZE + 0.5);
		ctx.lineTo(CANVASSIZE + NUMSIZE + 0.5, ~~(i * BLOCKSIZE) + NUMSIZE + 0.5);
	}
	ctx.stroke();

	// 石の表示
	canvas.style.cursor = 'default';
	for (let x = 0; x < BOARDSIZE; x++) {
		for (let y = 0; y < BOARDSIZE; y++) {
			// 石がある場所

			if (game.board[game.num_moves][x][y] == 1 || game.board[game.num_moves][x][y] == -1) {
				ctx.beginPath();
				if (game.board[game.num_moves][x][y] == 1) {
					ctx.fillStyle = '#000000';
				} else if (game.board[game.num_moves][x][y] == -1) {
					ctx.fillStyle = '#ffffff';
				}

				ctx.strokeStyle = '#000000';
				ctx.arc(x * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5, y * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5, BLOCKSIZE / 2 * 0.8, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.stroke();

				// 石がない場所（置けるかどうかの確認）
			} else if (game.board[game.num_moves][x][y] == 0) {
				let turnCheck = 0;
				for (let i = -1; i <= 1; i++) {
					for (let j = -1; j <= 1; j++) {
						[turn_flag, temp_board] = turnStone(game.board[game.num_moves].copy(), x, y, i, j, game.turn);
						if (turn_flag == 2) {

							// 濃度調節
							let alpha = 0;
							if (x == mouseBlockX && y == mouseBlockY) {
								canvas.style.cursor = 'pointer';
								alpha = 0.5;
							} else {
								alpha = 0.2;
							}

							// 石の表示
							ctx.beginPath();
							ctx.globalAlpha = alpha;
							if (game.turn == 1) {
								ctx.fillStyle = '#000000';
							} else if (game.turn == -1) {
								ctx.fillStyle = '#ffffff';
							}
							ctx.strokeStyle = '#000000';
							ctx.arc(x * BLOCKSIZE + NUMSIZE + ~~(BLOCKSIZE * 0.5) + 0.5, y * BLOCKSIZE + NUMSIZE + ~~(BLOCKSIZE * 0.5) + 0.5, BLOCKSIZE / 2 * 0.8, 0, 2 * Math.PI, false);
							ctx.fill();
							ctx.stroke();
							ctx.globalAlpha = 1;

							turnCheck = 1;
							break;
						}
					}
					if (turnCheck != 0) {
						break;
					}
				}
			}
		}
	}

	// ボード脇の色を設定
	ctx.beginPath();
	ctx.fillStyle = '#343A40';
	ctx.rect(0, 0, CANVASSIZE + NUMSIZE, NUMSIZE);
	ctx.rect(0, 0, NUMSIZE, CANVASSIZE + NUMSIZE);
	ctx.fill();

	for (let i = 0; i < BOARDSIZE; i++) {
		// 文字の表示
		ctx.beginPath();
		ctx.font = NUMSIZE + "px 'Osaka'";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillStyle = '#ffffff';
		ctx.fillText(boardWordVer[i], (i + 0.5) * BLOCKSIZE + NUMSIZE + 0.5, NUMSIZE * 0.5);
		ctx.fillText(boardWordHor[i], NUMSIZE * 0.5, (i + 0.5) * BLOCKSIZE + NUMSIZE + 0.5);
	}

}

function DrawAIthink(x, y) {
	ctx.beginPath();
	ctx.globalAlpha = 0.5;
	ctx.fillStyle = '#B3677A';
	ctx.arc(x * BLOCKSIZE + NUMSIZE + ~~(BLOCKSIZE * 0.5) + 0.5, y * BLOCKSIZE + NUMSIZE + ~~(BLOCKSIZE * 0.5) + 0.5, BLOCKSIZE / 2 * 0.8, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.stroke();
	document.getElementById('black_win_num').innerHTML = x + " " + y;
}

//----------------------------------------
// 評価値を返す
//----------------------------------------
function analysis() {
	ctx.clearRect(0, 0, CANVASSIZE + NUMSIZE, CANVASSIZE + NUMSIZE);
	draw(ctx, canvas);
	ctx.beginPath();
	ctx.font = ANALYSISSIZE + "px 'Osaka'";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = '#ffffff';
	let movelist = MovelistFunc(game.board[game.num_moves].copy(), game.turn);
	if (movelist.length == 0) {
		return;
	}
	Role[2] = document.Preference.ana_role.value;
	AI_name = Role[2];
	console.time('処理時間：');
	console.log(AI_name, othello_AI[AI_name](game.board[game.num_moves].copy(), game.turn))
	let nextmove =[];
	let eval_list = [];
	[nextmove, eval_list] = othello_AI[AI_name](game.board[game.num_moves].copy(), game.turn);
	console.timeEnd('処理時間：');
	for (let i = 0; i < movelist.length; i++) {
		ctx.fillText(Math.floor(eval_list[i]), movelist[i][0] * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5, movelist[i][1] * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5);
	}
}

//----------------------------------------
// AIを登録する
//----------------------------------------
function uploadAI() {
	console.log("upload...")
	let filename = document.Preference.AIname.value;
	let code = othello_AI.original.toString();
	execPost(upload.php, filename, "othello_AI." + filename + " =" + code);
}

function execPost(action, name, data) {
	// フォームの生成col
	let form = document.createElement("form");
	form.setAttribute("action", "https://kaduo.jp/reversi/upload.php");
	form.setAttribute("method", "post");
	form.style.display = "none";
	document.body.appendChild(form);
	// パラメタの設定
	if (data !== undefined) {
		let input = document.createElement('input');
		input.setAttribute('type', 'hidden');
		input.setAttribute('name', "AIcode");
		input.setAttribute('value', data);
		let filename = document.createElement('input');
		filename.setAttribute('type', 'hidden');
		filename.setAttribute('name', "filename");
		filename.setAttribute('value', name);
		form.appendChild(input);
		form.appendChild(filename);
	}
	// submit
	form.submit();
	return false;
}
//----------------------------------------
//----------------------------------------
// AIの思考に必要な関数
//----------------------------------------
//----------------------------------------

//----------------------------------------
// 開放度を返す
//----------------------------------------
function countOpeness(board, x, y, i, j, turn, turn_num, openess) {

	if (i == 0 && j == 0) {
		return [0, 0];
	}

	x += i;
	y += j;

	// 例外処理
	if (x < 0 || x > BOARDSIZE - 1 || y < 0 || y > BOARDSIZE - 1) {
		return [0, 0];
	}

	// 何もないとき
	if (board[x][y] == 0) {
		return [0, 0];
		// 自分の石があるとき
	} else if (board[x][y] == turn) {
		return [turn_num, openess];

		// 相手の石があるとき
	} else {
		// 最後に自分の石があればひっくり返す
		openess += countOpenessEach(board, x, y);

		return countOpeness(board, x, y, i, j, turn, turn_num + 1, openess);

	}
}

function countOpenessEach(board, x, y) {
	openess = 0;
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			if (x + i < 0 || x + i > BOARDSIZE - 1 || y + i < 0 || y + i > BOARDSIZE - 1) {
				return 0;
			}
			if (board[x + i][y + j] == 0) {
				openess++;
			}
		}
	}
	return openess;
}


// ゲームの終了判定(まだ終わらないならreturn 1、終わるならgameOver()を呼び出す)
function isEnd(board, turn, pass) {
	//両者パスしたら終了
	let movelist = MovelistFunc(board, turn);
	if (movelist.length == 0) {
		if (pass == 1) {
			[numBlack, numWhite, numSpace] = CountStone(board);

			return [numBlack - numWhite, turn, 1];
		} else {
			return [100, (-1) * turn, 1];
		}
	}
	return [100, turn, 0];
}





//----------------------------------------
// 石の数を数える（boardを与えると、黒、白、スペースの数を返す９）
//----------------------------------------
function CountStone(board) {
	numBlack = 0;
	numWhite = 0;
	numSpace = 0;
	for (let x = 0; x < BOARDSIZE; x++) {
		for (let y = 0; y < BOARDSIZE; y++) {
			if (board[x][y] == 1) {
				numBlack++;
			} else if (board[x][y] == -1) {
				numWhite++;
			} else {
				numSpace++;
			}
		}
	}
	return [numBlack, numWhite, numSpace];
}

//----------------------------------------
// 完全読み関数（最善進行での石数差を返す）
//----------------------------------------
function CountStoneAll(board, turn, pass) {

	[numBlack, numWhite, numSpace] = CountStone(board);
	let movelist = MovelistFuncLite(board, turn);

	if (numSpace == 0 || (pass == 1 && movelist.length == 0)) {
		return numBlack - numWhite;
	}
	if (pass == 0 && movelist.length == 0) {
		return CountStoneAll(board, turn * (-1), 1);
	}


	if (turn == 1) {
		var maxDiff = -BOARDSIZE * BOARDSIZE;
	} else if (turn == -1) {
		var maxDiff = BOARDSIZE * BOARDSIZE;
	}
	for (let i = 0; i < movelist.length; i++) {
		[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);
		stoneDiff = CountStoneAll(next_board, next_turn, 0);
		if (turn == 1 && stoneDiff > maxDiff) {
			maxDiff = stoneDiff;
		} else if (turn == -1 && stoneDiff < maxDiff) {
			maxDiff = stoneDiff;
		}
	}
	return maxDiff;
}

//----------------------------------------
// 完全読み関数（最善進行での石数差を返す）
//----------------------------------------
function CountStoneAllAlphaBeta(board, turn, eval_turn, pass, alpha, beta) {

	[numBlack, numWhite, numSpace] = CountStone(board);
	let movelist = MovelistFuncLite(board, turn);

	if (numSpace == 0 || (pass == 1 && movelist.length == 0)) {
		return numBlack - numWhite;

	}
	if (pass == 0 && movelist.length == 0) {
		return CountStoneAllAlphaBeta(board.copy(), turn * (-1), eval_turn, 1, alpha, beta);
	}
	var maxDiff = -BOARDSIZE * BOARDSIZE;
	var minDiff = BOARDSIZE * BOARDSIZE;

	for (let i = 0; i < movelist.length; i++) {
		let next_board;
		[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);
		stoneDiff = CountStoneAllAlphaBeta(next_board, next_turn, eval_turn, 0, maxDiff, minDiff);
		if ((turn == 1 && stoneDiff > beta) || (turn == -1 && stoneDiff < alpha)) {
			return stoneDiff;
		}
		if (maxDiff < stoneDiff) {
			maxDiff = stoneDiff;
		}
		if (minDiff > stoneDiff) {
			minDiff = stoneDiff;
		}

	}
	if (turn == 1) {
		return maxDiff;
	} else {
		return minDiff;
	}
}

//----------------------------------------
// 回帰思考関数（depthの深さでMinMax法で探索する）
//----------------------------------------
function MinMax(board, eval_turn, turn, depth) {
	let movelist = MovelistFunc(board.copy(), turn); //合法手を取得する

	//最深まで読んだら評価値を返す
	if (depth <= 0) {
		//自分と同じ色のときはプラスで、違うときはマイナスを返す
		if (eval_turn == turn) {
			eval_sign = 1;
		} else {
			eval_sign = -1;
		}
		return eval_sign * movelist.length;
	}

	//合法手が無い時はパスして先の手を読む
	if (movelist.length == 0) {
		return MinMax(board.copy(), eval_turn, turn * (-1), depth - 1);
	}

	//自分と同じ色のときMax法で、違う色のときはMin法で
	if (turn == eval_turn) {
		var max_eval = -1000;
	} else {
		var max_eval = 1000;
	}

	for (let i = 0; i < movelist.length; i++) {
		[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);
		evalNum = MinMax(next_board.copy(), eval_turn, next_turn, depth - 1) + EvalBoard(movelist[i][0], movelist[i][1], eval_turn, turn, board.copy()) - movelist[i][3];
		if (turn == eval_turn && max_eval < evalNum) {

			max_eval = evalNum;
		} else if (turn != eval_turn && max_eval > evalNum) {

			max_eval = evalNum;
		}
	}
	return max_eval + 2 * Math.random();
}


//----------------------------------------
// 回帰思考関数（depthの深さでalpha-beta法で探索する）
//----------------------------------------
function AlphaBeta(board, eval_turn, turn, depth, alpha, beta) {
	let movelist = MovelistFunc(board, turn); //合法手を取得する

	//最深まで読んだら評価値を返す
	if (depth <= 0) {
		//自分と同じ色のときはプラスで、違うときはマイナスを返す
		if (eval_turn == turn) {
			eval_sign = 1;
		} else {
			eval_sign = -1;
		}
		return eval_sign * (movelist.length) + Edgeeval(eval_turn, board);
	}

	//合法手が無い時はパスして先の手を読む
	if (movelist.length == 0) {
		return AlphaBeta(board.copy(), eval_turn, turn * (-1), depth - 1, alpha, beta)
	}

	//自分と同じ色のときMax法で、違う色のときはMin法で

	var max_eval = -1000;
	var max_return_eval = -1000;
	var min_eval = 1000;
	var min_return_eval = 1000;

	for (let i = 0; i < movelist.length; i++) {
		[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);
		return_eval = AlphaBeta(next_board.copy(), eval_turn, next_turn, depth - 1, max_return_eval, min_return_eval);
		evalNum = return_eval + 4 * Math.random();
		if ((turn == eval_turn && evalNum >= beta) || (turn != eval_turn && evalNum <= alpha)) {
			return evalNum;
		}
		if (max_eval < evalNum) {
			max_eval = evalNum;
			max_return_eval = return_eval;
		}
		if (min_eval > evalNum) {
			min_eval = evalNum;
			min_return_eval = return_eval;
		}

	}
	if (turn == eval_turn) {
		return max_eval;
	} else {
		return min_eval;
	}

}


//----------------------------------------
// 回帰思考関数（depthの深さでalpha-beta法で探索する）
//----------------------------------------
function AlphaBeta(board, eval_turn, turn, depth, alpha, beta) {
	let movelist = MovelistFunc(board, turn); //合法手を取得する

	//最深まで読んだら評価値を返す
	if (depth <= 0) {
		//自分と同じ色のときはプラスで、違うときはマイナスを返す
		if (eval_turn == turn) {
			eval_sign = 1;
		} else {
			eval_sign = -1;
		}
		return eval_sign * (movelist.length) + Edgeeval(eval_turn, board);
	}

	//合法手が無い時はパスして先の手を読む
	if (movelist.length == 0) {
		return AlphaBeta(board.copy(), eval_turn, turn * (-1), depth - 1, alpha, beta)
	}

	//自分と同じ色のときMax法で、違う色のときはMin法で

	var max_eval = -1000;
	var max_return_eval = -1000;
	var min_eval = 1000;
	var min_return_eval = 1000;

	for (let i = 0; i < movelist.length; i++) {
		[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);
		return_eval = AlphaBeta(next_board.copy(), eval_turn, next_turn, depth - 1, max_return_eval, min_return_eval);
		evalNum = return_eval + 4 * Math.random();
		if ((turn == eval_turn && evalNum >= beta) || (turn != eval_turn && evalNum <= alpha)) {
			return eval;
		}
		if (max_eval < evalNum) {
			max_eval = evalNum;
			max_return_eval = return_eval;
		}
		if (min_eval > evalNum) {
			min_eval = evalNum;
			min_return_eval = return_eval;
		}

	}
	if (turn == eval_turn) {
		return max_eval;
	} else {
		return min_eval;
	}

}


//----------------------------------------
//----------------------------------------
// その他の関数
//----------------------------------------
//----------------------------------------

//----------------------------------------
// 配列のコピーメソッド
//----------------------------------------
Array.prototype.copy = function () {
	let obj = new Array();

	for (let i = 0, len = this.length; i < len; i++) {
		if (this[i].length > 0 && this[i].copy()) {
			obj[i] = this[i].copy();
		} else {
			obj[i] = this[i];
		}
	}

	return obj;
}

function xsort(arrs, col, order) {
	//二次元配列のソート
	//col:並べ替えの対象となる列
	//order:1=昇順、-1=降順
	arrs.sort(function (a, b) {
		return (a[col] - b[col]) * order;
	});
	return arrs;
}


window.onload = function () {
	// 初期設定
	init();
}










//----------------------------------------
//----------------------------------------
// AI(CPU2～)
//----------------------------------------
//----------------------------------------

othello_AI.AI2 = function (board, turn) {
	movelist = MovelistFunc(board.copy(), turn);
	let eval_list = []
	let eval_high = 0
	let eval_board = [
		[10, 0, 4, 4, 0, 10, ],
		[0, 1, 2, 2, 1, 0, ],
		[4, 2, 0, 0, 2, 4, ],
		[4, 2, 0, 0, 2, 4, ],
		[0, 1, 2, 2, 1, 0, ],
		[10, 0, 4, 4, 0, 10, ],
	];

	for (let i = 0; i < movelist.length; i++) {
		eval_list.push(eval_board[movelist[i][0]][movelist[i][1]] + Math.random() * 0.1);

	}

	best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list))
	best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]]
	return [best_move_array, eval_list];

}



othello_AI.AI3 = function (board, turn) {
	Factor_NumOfOpeness = -1;
	movelist = MovelistFunc(board.copy(), turn);
	let eval_list = [];
	let eval_high = 0;
	let eval_board = [
		[100, -20, 4, 4, -20, 100, ],
		[-20, -50, 2, 2, -50, -20, ],
		[4, 2, 0, 0, 2, 4, ],
		[4, 2, 0, 0, 2, 4, ],
		[-20, 1, 2, 2, 1, -50, ],
		[100, -20, 4, 4, -20, 100, ],
	];

	for (let i = 0; i < movelist.length; i++) {
		eval_list.push(eval_board[movelist[i][0]][movelist[i][1]] + Factor_NumOfOpeness * movelist[i][3] + Math.random() * 0.1);
	}
	best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));
	best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]];
	return [best_move_array, eval_list];

}



othello_AI.AI4 = function (board, turn) {
	let ENDGAMEPHASE = 7; //完全読みを始める空きマス数
	let Factor_NumOfOpeness = -0.2; //開放度を重視する度合い

	[numBlack, numWhite, numSpace] = CountStone(board);
	if (numSpace <= ENDGAMEPHASE) {
		let eval_list = [];
		let movelist = MovelistFunc(board.copy(), turn);
		for (let i = 0; i < movelist.length; i++) {
			[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);

			count_num = CountStoneAll(next_board.copy(), next_turn, 0);
			eval_list.push(count_num);
		}
		if (turn == 1) {
			best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));
		} else {
			best_move_index = eval_list.indexOf(Math.min.apply(null, eval_list));
		}
		best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]];
		return [best_move_array, eval_list];
	}







	let movelist = MovelistFunc(board.copy(), turn);
	let eval_list = [];
	let eval_high = 0;
	let eval_board = [
		[100, -20, 4, 4, -20, 100, ],
		[-20, -50, 2, 2, -50, -20, ],
		[4, 2, 0, 0, 2, 4, ],
		[4, 2, 0, 0, 2, 4, ],
		[-20, -50, 2, 2, -50, -20, ],
		[100, -20, 4, 4, -20, 100, ],
	];

	for (let i = 0; i < movelist.length; i++) {
		eval_list.push(eval_board[movelist[i][0]][movelist[i][1]] + Factor_NumOfOpeness * movelist[i][3] + Math.random() * 0.1);
	}
	best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));
	best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]];
	return [best_move_array, eval_list];

}




othello_AI.AI5 = function (board, turn) {
	let ENDGAMEPHASE = 8; //完全読みを始める空きマス数
	let DEPTH = 3; //序中盤の読みの深さ
	//完全読み
	[numBlack, numWhite, numSpace] = CountStone(board.copy());
	if (numSpace <= ENDGAMEPHASE) {
		let eval_list = [];
		let movelist = MovelistFunc(board.copy(), turn);
		for (let i = 0; i < movelist.length; i++) {
			[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);

			count_num = CountStoneAll(next_board.copy(), next_turn, 0);
			eval_list.push(count_num);
		}
		if (turn == 1) {
			best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));
		} else {
			best_move_index = eval_list.indexOf(Math.min.apply(null, eval_list));
		}
		best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]];
		return [best_move_array, eval_list];
	}
	//序中盤の思考
	let movelist = MovelistFunc(board.copy(), turn);
	let eval_list = [];
	for (let i = 0; i < movelist.length; i++) {
		[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);

		evalNum = MinMax(next_board.copy(), turn, next_turn, DEPTH)
		evalNum += EvalBoard(movelist[i][0], movelist[i][1], turn, turn, board.copy());
		eval_list.push(evalNum);
	}
	best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));

	best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]]
	return [best_move_array, eval_list];

}


othello_AI.AI6 = function (board, turn) {
	let ENDGAMEPHASE = 11; //完全読みを始める空きマス数
	let DEPTH = 4; //序中盤の読みの深さ
	//完全読み
	[numBlack, numWhite, numSpace] = CountStone(board.copy());
	if (numSpace <= ENDGAMEPHASE) {
		let eval_list = [];
		let movelist = MovelistFunc(board.copy(), turn);
		movelist = xsort(movelist, 3, 1);
		let minDiff = -BOARDSIZE * BOARDSIZE;
		for (let i = 0; i < movelist.length; i++) {
			[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);

			count_num = CountStoneAllAlphaBeta(next_board.copy(), next_turn, turn, 0, minDiff, BOARDSIZE * BOARDSIZE);
			if (minDiff < count_num) {
				minDiff = count_num;
			}
			eval_list.push(count_num);
		}
		if (turn == 1) {
			best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));
		} else {
			best_move_index = eval_list.indexOf(Math.min.apply(null, eval_list));
		}
		best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]];
		return [best_move_array, eval_list];
	}
	//序中盤の思考
	let movelist = MovelistFunc(board.copy(), turn);
	movelist = xsort(movelist, 3, 1);
	let eval_list = [];
	let min_eval = -1000;
	for (let i = 0; i < movelist.length; i++) {
		[next_board, next_turn] = putStone(board.copy(), turn, movelist[i][0], movelist[i][1]);
		eval = AlphaBeta(next_board.copy(), turn, next_turn, DEPTH, min_eval, 1000);
		eval_list.push(eval);
		if (min_eval < evalNum) {
			min_eval = evalNum;
		}
	}

	best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));

	best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]];
	return [best_move_array, eval_list];

}



//----------------------------------------
// 評価ボード（位置を与えると、その位置の評価値を返す）
//----------------------------------------
function EvalBoard(x, y, eval_turn, turn, board) {
	let eval_board = [
		[100, -50, 0, 0, -50, 100, ],
		[-50, -40, 0, 0, -40, -50, ],
		[0, 0, 0, 0, 0, 0, ],
		[0, 0, 0, 0, 0, 0, ],
		[-50, -40, 0, 0, -40, -50, ],
		[100, -50, 0, 0, -50, 100, ],
	];
	if (((x == 1 & y == 0) || (x == 0 & y == 1)) && board[0][0] == turn) {
		eval_board[x][y] = 60;
	} else if (((x == 4 & y == 0) || (x == 5 & y == 1)) && board[5][0] == turn) {
		eval_board[x][y] = 60;
	} else if (((x == 0 & y == 4) || (x == 1 & y == 5)) && board[0][5] == turn) {
		eval_board[x][y] = 60;
	} else if (((x == 5 & y == 4) || (x == 4 & y == 5)) && board[5][5] == turn) {
		eval_board[x][y] = 60;
	}

	if (eval_turn == turn) {
		eval_sign = 1
	} else {
		eval_sign = -1;
	}

	return eval_sign * eval_board[x][y];
}




//----------------------------------------
// 評価ボード（位置を与えると、その位置の評価値を返す）
//----------------------------------------
function Edgeeval(eval_turn, board) {
	eb = board.copy();
	for (let i = 0; i < BOARDSIZE; i++) {
		for (let j = 0; j < BOARDSIZE; j++) {
			if (board[i][j] == -1) {
				eb[i][j] = 2;
			}
		}
	}
	eval_edge_list = [0, 100, -100, -30, 130, -150, 30, 150, -130, 10, 10, -120, -10, 160, -180, 0, 10, -180, -10, 120, -10, 0, 180, -10, 10, 180, -160, 10, 120, -120, -100, 30, -200, 30, 30, -200, 20, 30, -200, 30, 220, -230, 40, 20, -220, 0, 50, -30, -200, 30, -30, 30, 30, -200, -10, 120, -120, -30, 200, -30, 100, 200, -30, 0, 30, -50, -30, 200, -30, 200, 30, -30, -20, 200, -30, -40, 220, -20, -30, 230, -220, -30, 60, -160, -10, 130, -190, 0, 40, -200, -100, 0, -200, -50, 30, -250, 5, -50, -250, -30, 80, -30, -50, 30, -100, 0, 30, -200, -10, 100, -130, -50, 30, -50, -30, 50, 0, 30, 30, -200, 10, 250, -250, 0, -50, -250, -30, 30, -30, -200, -250, -130, 0, -30, 250, 0, 70, -150, -50, 100, -130, -70, 30, -200, -200, -30, -200, -200, 30, 30, 0, 30, -70, -40, 30, -200, -250, 0, -120, 0, -30, -250, 30, 160, -60, 0, 200, -40, 10, 190, -130, 30, 30, -80, -30, 200, -30, 50, 100, -30, 100, 200, 0, -70, 250, 50, 50, 250, -30, 0, 150, -70, 70, 200, -30, 50, 130, -100, 40, 200, -30, 0, 250, 30, 250, 120, 0, 200, 200, 30, 0, 70, -30, 200, -30, -30, 10, 130, -100, 30, 0, -50, 50, 50, -30, 30, 30, -30, 0, -250, 30, 200, 130, 250, -30, 200, -30, 0, 250, 50, -10, 250, -250, 100, 200, 0, 60, 230, -30, 160, 220, -30, 120, 150, -20, 100, 250, -80, 150, 100, -100, 120, 220, 30, 70, 220, 50, 130, 200, -80, 10, 150, -30, 0, 30, -30, 30, 50, -50, 30, 30, -50, 30, 180, 0, 200, 30, 0, 30, 100, 0, -30, 30, 0, 30, 0, -30, 120, 220, 0, 80, 180, 0, 200, 180, 0, 50, 100, 0, 30, 100, 10, 200, 0, 0, 200, 180, 0, 30, 120, 10, 200, 120, -100, 130, 230, 30, 130, 200, 0, 200, 180, 0, 30, 30, 0, 30, 120, 0, 200, 100, 0, 200, 180, 50, 100, 120, 0, 0, 120, -30, 160, 250, 0, 30, 120, 50, 200, 120, 30, 220, 180, 100, 250, 300, 150, 250, 200, 80, 200, 100, 50, 30, 200, 50, -250, 140, 0, 180, 220, 80, 30, 120, 0, 250, 120, 0, 30, 30, 0, -250, 200, 50, 70, 140, 0, 220, 120, 0, 0, 120, 0, 250, 100, -60, 150, 220, 30, 40, 180, 0, 190, 220, 10, 30, 50, 0, 50, 120, 0, 130, 0, 0, 200, 180, 30, 30, 120, 0, 50, 50, 30, 10, 100, -30, -50, 100, 0, 100, 0, -10, 20, 30, -30, -50, 200, 50, 120, 120, 0, 30, 0, 0, 30, 140, 0, 130, 100, -60, 180, 200, 50, 30, 120, 0, 250, 50, 0, 30, 0, -10, -30, 140, 0, -30, 100, -50, 230, 120, 10, -30, 100, -50, 250, 0, -100, -100, 0, -200, -160, 30, -220, -60, 30, -230, -120, -30, -220, -130, 0, -200, -70, -30, -220, -120, 0, -150, -150, 80, -100, -100, 50, -250, -120, 0, -220, -200, 0, -180, -80, 0, -180, -200, 0, -180, -200, 100, -120, -30, -30, -120, -50, 0, -100, -200, 0, 0, -30, -10, -100, -10, 30, -150, -30, 50, -50, 0, 30, -30, -30, 0, -100, -30, 50, 0, 30, 0, -30, -30, 0, -30, -200, 0, -30, -30, 10, -180, -150, -30, -220, -190, -10, -220, -40, 0, -180, -200, -30, -180, -50, -30, -50, -30, 0, -120, -30, 0, -50, -130, 0, 0, -50, 0, -120, -180, -50, -200, -250, 0, -50, -30, 0, -120, -230, -10, -120, -250, 100, 0, 30, 50, -100, -30, 10, 0, 30, 50, -100, 30, 0, -140, -10, 30, -100, -100, 10, 0, 50, 0, -100, -30, 0, 0, -130, 60, -100, -30, 0, -140, -20, 30, -30, -120, 0, -120, 50, -50, -200, -130, -30, -230, -200, 0, -180, -130, 10, -200, -200, -50, -180, 0, 30, -120, -100, -10, -120, -30, 0, -30, -200, 0, -100, -30, 0, -120, -180, -80, -220, -250, 0, -120, -30, 0, -120, -220, 0, -120, -250, 60, -100, 0, 0, -120, -30, 0, -30, -70, 0, -140, 250, -50, -200, -160, 0, -250, -200, -30, -120, -30, 30, -120, -200, -50, -100, 250, 0, -140, -30, -60, -200, -220, -100, -180, -250, -60, -200, -250, -100, -300]
	edge_eval = 0;
	edge_eval += 0.82 * eval_edge_list[eb[0][0] + eb[0][1] * 3 + eb[0][2] * 9 + eb[0][3] * 27 + eb[0][4] * 81 + eb[0][5] * 243];
	edge_eval += 0.82 * eval_edge_list[eb[5][0] + eb[5][1] * 3 + eb[5][2] * 9 + eb[5][3] * 27 + eb[5][4] * 81 + eb[5][5] * 243];
	edge_eval += 0.82 * eval_edge_list[eb[0][0] + eb[1][0] * 3 + eb[2][0] * 9 + eb[3][0] * 27 + eb[4][0] * 81 + eb[5][0] * 243];
	edge_eval += 0.82 * eval_edge_list[eb[0][5] + eb[1][5] * 3 + eb[2][5] * 9 + eb[3][5] * 27 + eb[4][5] * 81 + eb[5][5] * 243];

	//	edge_eval += 150*(board[0][0]+board[0][5]+board[5][0]+board[5][5]);
	//	edge_eval += -50*(board[1][1]+board[1][4]+board[4][1]+board[4][4]);
	edge_eval += -50 * (board[1][0] + board[0][1] + board[5][1] + board[1][5] + board[5][4] + board[4][5] + board[4][0] + board[0][4]);
	if (eval_turn == 1) {
		eval_sign = 1
	} else {
		eval_sign = -1;
	}
	return eval_sign * edge_eval;
}