//----------------------------------------
//----------------------------------------
// AI(調整用)
//----------------------------------------
//----------------------------------------

var othello_AI = new Array();


othello_AI.AI1 = function(board,turn){

  Factor_NumOfDiscs = 1	//返す石の数をどれぐらい重要視するか（0以上の場合は多く返したがる。0以下だと少なく返したがる。）
  movelist = MovelistFunc(board.copy(),turn);	
  var eval_list = []
  var eval_high = 0
	var eval_board = [	//盤面のそれぞれの位置の価値を設定（大きい数字なほど優先して打つようになる）
	[ 1, 1, 1, 1, 1, 1, 1, 1], 
	[ 1, 1, 1, 1, 1, 1, 1, 1], 
	[ 1, 1, 1, 1, 1, 1, 1, 1], 
	[ 1, 1, 1, 1, 1, 1, 1, 1], 
	[ 1, 1, 1, 1, 1, 1, 1, 1],  
	[ 1, 1, 1, 1, 1, 1, 1, 1], 
	[ 1, 1, 1, 1, 1, 1, 1, 1],  
	[ 1, 1, 1, 1, 1, 1, 1, 1], 
	];

	for(var i=0; i < movelist.length; i++){
		eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Factor_NumOfDiscs*movelist[i][2]+Math.random()*0.1);
	} 
	best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) )
	best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]]
	return [best_move_array,eval_list];

}


//----------------------------------------
//----------------------------------------
// パラメータの設定
//----------------------------------------
//----------------------------------------
//定数
var BOARDSIZE = 8;
var BLOCKSIZE = 60;					// １マスのサイズ
var CANVASSIZE = BLOCKSIZE * BOARDSIZE;				// ボードのサイズ
var NUMSIZE = 20;					// ボード横の番号幅
var ANALYSISSIZE = 20;	//解析結果の数字の大きさ
var DELAYDURATION = 700 // 打ってから反映するまでの時間
var ENDDURATION =1000 // AI同士でげーむ終了してから次のゲーム開始までの時間

//変数
var mouseX = 0;						// マウスの横方向座標
var mouseY = 0;						// マウスの縦方向座標
var mouseBlockX = ~~(mouseX / BLOCKSIZE);		// マウスのマス上での横方向座標
var mouseBlockY = ~~(mouseY / BLOCKSIZE);		// マウスのマス上での縦方向座標
gameEndFlag = 0;					// ゲーム進行フラグ
AIthinkFlag = 0;					// ゲーム進行フラグ
var turn = 1;						// ターン
var board = new Array();					// ボード配列
var blackStoneNum = 0;					// 黒石の数
var whiteStoneNum = 0;					// 白石の数
var Role = [0,0,1]; // 思考（Role[0]が白番、Role[1]が黒番,Role[2]が解析用AI、0:人間、1:CPU1、2:CPU2）
var Pass = 0


//----------------------------------------
//----------------------------------------
// オセロの動作・盤面描画に関する関数
//----------------------------------------
//----------------------------------------

//----------------------------------------
// 初期化
//----------------------------------------
function init()
{
// キャンバスの設定
	// 描画先canvasのidを取得する
	canvas = document.getElementById('canvas');
	if( !canvas || !canvas.getContext ) { return false; }
	ctx = canvas.getContext('2d');	// contextを取得する
	// キャンバスの大きさを取得する
	canvas.width = CANVASSIZE + NUMSIZE;
	canvas.height = CANVASSIZE + NUMSIZE;

//イベントリスナの設定
	// マウスが動くとmoveMouseを呼び出す
	canvas.onmousemove = function(event) {
		if( gameEndFlag == 0 && AIthinkFlag == 0) {
			moveMouse(event);
			draw(ctx, canvas);
		}
	}
	//マウスがクリックするとhumanTurnを呼び出す。既にゲーム終了後の場合はinitを呼び出す。
	canvas.onclick = function() {
		if( gameEndFlag == 1) {
			init();
		}
		else if( AIthinkFlag == 0){
			humanTurn();
		}

	}

//パラメータの初期化
	var turn = 1;	// 順番の初期化
	gameEndFlag = 0;	// ゲーム終了フラグの初期化
	// ボードの初期化
	for( var i = 0; i < BOARDSIZE; i++ ) {
		board[i] = new Array();
		for( var j = 0; j < BOARDSIZE; j++ ) { board[i][j] = 0; }
	}
board[3][4] = board[4][3] = 1;
board[3][3] = board[4][4] = -1;

// 初期描画
	draw(ctx, canvas);

//初手がAIの場合はAIの思考を開始
	if(Role[1] != 0){
		AIthinkFlag = 1;
		AIturn();
	}
}

//----------------------------------------
// 設定ボタンをおした時の動作
//----------------------------------------
function restart(){
//戦歴をリセットする
	document.getElementById('black_win_num').innerHTML= 0;
	document.getElementById('white_win_num').innerHTML= 0;
	document.getElementById('draw_win_num').innerHTML= 0;

//	黒番と白番の思考を読み込む
	Role[2] = document.Preference.ana_role.value;
	Role[1] = document.Preference.black_role.value;
	Role[0] = document.Preference.white_role.value;

//	ゲームスピードを設定する
	game_speed = document.Preference.game_speed.value;
	if(game_speed == 0){	//低速
		DELAYDURATION = 1000;
		ENDDURATION = 1000 ;
	}
	else if (game_speed == 1){	//高速
		DELAYDURATION = 100;
		ENDDURATION = 200;
	}
	else{	//超高速
		DELAYDURATION = 0;
		ENDDURATION = 0;
	}

//	手番がAI
	if(Role[[0.5+turn*0.5]] != 0){
		AIthinkFlag = 1;
		AIturn();
	}
}

//----------------------------------------
// ゲーム終了時に呼び出す関数
//----------------------------------------
function gameOver() {
	gameEndFlag = 1;	//ゲーム終了フラグをtrueにする。

// 石数の計算
	blackStoneNum = 0;
	whiteStoneNum = 0;
	for( var x = 0; x < BOARDSIZE; x++ ) {
		for( var y = 0; y < BOARDSIZE; y++ ) {
			if( board[x][y] == 1 ) { blackStoneNum++; }
			else if( board[x][y] == -1 ) { whiteStoneNum++; }
		}
	}
//勝敗の判定
	if (blackStoneNum > whiteStoneNum){	//黒勝ち
		console.log("Black Win")
		black_win_num = parseInt(document.getElementById('black_win_num').innerHTML)
		document.getElementById('black_win_num').innerHTML= black_win_num + 1;
	}
	else if (blackStoneNum < whiteStoneNum){	//白勝ち
		console.log("White Win")
		white_win_num = parseInt(document.getElementById('white_win_num').innerHTML)
		document.getElementById('white_win_num').innerHTML= white_win_num + 1;
	}
	else{	//引き分け勝ち
		console.log("Draw")
		draw_win_num = parseInt(document.getElementById('draw_win_num').innerHTML)
		document.getElementById('draw_win_num').innerHTML= draw_win_num + 1;
	}
	console.log("Black:", blackStoneNum,"  White:",whiteStoneNum)	//console上に結果を表示

//CPU同士の対決の場合は自動的に次の対局を開始
	if(Role[0] != 0 && Role[1] !=  0 ){
		setTimeout("init()", ENDDURATION);
	}
}



//----------------------------------------
// 石を返す
//----------------------------------------
function turnStone(board_temp, x, y, i, j, turn)
{

	if( i == 0 && j == 0 ) { return [0,board_temp]; }	//　i = 0　かつ j = 0のときはスキップ
	x += i;
	y += j;

// 盤面からはみ出したらスキップ
	if( x < 0 || x > BOARDSIZE - 1 || y < 0 || y > BOARDSIZE - 1 ) { return [0,board_temp]; }

//	石を返すかを判定する
	if( board_temp[x][y] == 0 ) {	// 何もないとき
		return [0,board_temp];	//0を返す
	} 
	else if( board_temp[x][y] == turn ) {// 自分の石があるとき
		return [3,board_temp];	//3を返す
	} else {	// 相手の石があるとき
		[turn_flag, board_temp] = turnStone(board_temp,x, y, i, j, turn);	//さらに次の石をチェック
		if( turn_flag >= 2 ) {	// 最後に自分の石があればひっくり返す
			board_temp[x][y] = turn;	// 石を返す
			return [2,board_temp];	//返せたときは2を返す
		}
		return [1,board_temp];	//自分の石がその先にないときは1を返す
	}
}

//----------------------------------------
// 石を返す数を返す
//----------------------------------------
function turnNum(board, x, y, i, j,turn,turn_num)
{

	if( i == 0 && j == 0 ) { return 0; }

	x += i;
	y += j;

	// 例外処理
	if( x < 0 || x > BOARDSIZE - 1 || y < 0 || y > BOARDSIZE - 1 ) {
		return 0;
	}

	// 何もないとき
	if( board[x][y] == 0 ) {
		return 0;
	// 自分の石があるとき
}
else if( board[x][y] == turn ) {
	return turn_num;

	// 相手の石があるとき
} 
else 
{
		// 最後に自分の石があればひっくり返す
		return turnNum(board, x, y, i, j,turn,turn_num+1);
	}
}


//----------------------------------------
// 石を置く(人)
//----------------------------------------
function humanTurn()
{
	var movelist = MovelistFunc(board,turn);
	if (movelist.length == 0){
		//終了判定
		isEnd(board,turn)
		turn *= -1;
		Pass =1;
		if(Role[0.5+turn*0.5] != 0){
			AIthinkFlag = 1;
			AIturn();
		}
		return;
	}
	Pass = 0;
	//AIのturnなら終了
	if(Role[0.5+turn*0.5] == 1){
		return;
	}
	[board,turn] = putStone(board.copy(),turn,mouseBlockX,mouseBlockY);

	if(Role[0.5+turn*0.5] != 0){
		AIthinkFlag = 1;
		setTimeout("AIturn()", DELAYDURATION);
	}

	draw(ctx, canvas);
}

//----------------------------------------
// 石を置く(CPU)
//----------------------------------------
function AIturn()
{
	var movelist = MovelistFunc(board,turn);
	if (movelist.length == 0){
		//終了判定
		isEnd(board,turn)
		turn *= -1;
		Pass =1;

		if(Role[0.5+turn*0.5] != 0){
			AIthinkFlag = 1;
			AIturn();
		}
		AIthinkFlag = 0;
		return;
	}
	Pass = 0;
	AI_name = "AI"+Role[0.5+turn*0.5];
	[nextmove,eval_list] = othello_AI[AI_name](board,turn);
	[board,turn] = putStone(board.copy(),turn,nextmove[0],nextmove[1]);
	draw(ctx, canvas);
	if(Role[0.5+turn*0.5] != 0){
		AIthinkFlag = 1;
		setTimeout("AIturn()", DELAYDURATION);
		}
	else{
	AIthinkFlag = 0;
	}

}


function putStone(board,turn,x,y)
{
	// 可否確認

	if( board[x][y] != 0 ) { return [board,turn]; }


	// 石を返す
	var turnCheck = 0;
	for( var i = -1; i <= 1; i++ ) {
		for( var j = -1; j <= 1; j++ ) {
			[turn_flag, temp_board] = turnStone(board.copy(),x, y, i, j, turn);
			if( turn_flag== 2 ) {turnCheck = 1; board = temp_board; }
		}
	}
	// 石を置けるかの可否確認
	if( turnCheck == 0 ) { return [board,turn]; }

	// 石を置く
	board[x][y] = turn;

	// 順番を入れ替える
	turn *= -1;

	return [board,turn];

}

function MovelistFunc(board,turn){
	var movelist = new Array();
	var turn_num_all = 0;
	var openess_all = 0;
	var turn_num  = 0;
	//----------置けるかどうかの確認----------
	move_num= 0;
	turnCheck = 0;
	for( var x = 0; x < BOARDSIZE; x++ ) {
		for( var y = 0; y < BOARDSIZE; y++ ) {
			turn_num_all = 0;
			if( board[x][y] == 0 ) {
				for( var i = -1; i <= 1; i++ ) {
					for( var j = -1; j <= 1; j++ ) {
						[turn_num,openess] = countOpeness(board,x, y, i, j,turn,0,0);
						turn_num_all += turn_num;
						openess_all += openess;
						}
					}
				}
				if( turn_num_all > 0 ) {
					movelist[move_num] = [x,y,turn_num_all,openess_all];
					turnCheck = 1;
					move_num++;				

			}
		}
	}
	return movelist;
}


function MovelistFuncLite(board,turn){
	var movelist = new Array();
	var turn_num_all = 0;
	var turn_num  = 0;
	//----------置けるかどうかの確認----------
	move_num= 0;
	turnCheck = 0;
	for( var x = 0; x < BOARDSIZE; x++ ) {
		for( var y = 0; y < BOARDSIZE; y++ ) {
			turn_num_all = 0;
			if( board[x][y] == 0 ) {
				for( var i = -1; i <= 1; i++ ) {
					for( var j = -1; j <= 1; j++ ) {
						turn_num =  turnNum(board, x, y, i, j,turn,0);
						turn_num_all += turn_num;						
					}
				}
				if( turn_num_all > 0 ) {
					movelist[move_num] = [x,y,turn_num_all];
					turnCheck = 1;
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
function moveMouse(event)
{
	// マウス座標の取得
	if( event ) {
		mouseX = event.pageX - canvas.offsetLeft;
		mouseY = event.pageY - canvas.offsetTop;
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
function draw(ctx, canvas)
{
	// マウス位置の取得
	var mouseBlockXr = mouseBlockX * BLOCKSIZE + NUMSIZE;
	var mouseBlockYr = mouseBlockY * BLOCKSIZE + NUMSIZE;

	// 描画の削除
	ctx.clearRect(0, 0, CANVASSIZE + NUMSIZE, CANVASSIZE + NUMSIZE);

	// 罫線の描画
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.strokeStyle = '#000000';
	for( var i = 0; i <= BOARDSIZE - 1; i++ ) {
		ctx.moveTo( ~~(i * BLOCKSIZE) + NUMSIZE + 0.5, 0.5);
		ctx.lineTo( ~~(i * BLOCKSIZE) + NUMSIZE + 0.5, CANVASSIZE + NUMSIZE + 0.5);

		ctx.moveTo(0.5,  ~~(i * BLOCKSIZE) + NUMSIZE + 0.5);
		ctx.lineTo(CANVASSIZE + NUMSIZE + 0.5, ~~(i * BLOCKSIZE) + NUMSIZE + 0.5);
	}
	ctx.stroke();

	// 石の表示
	canvas.style.cursor = 'default';
	for( var x = 0; x < BOARDSIZE; x++ ) {
		for( var y = 0; y < BOARDSIZE; y++ ) {
			// 石がある場所

			if( board[x][y] == 1 || board[x][y] == -1 ) {
				ctx.beginPath();
				if( board[x][y] == 1 ) { ctx.fillStyle = '#000000';}

				else if( board[x][y] == -1 ) { ctx.fillStyle = '#ffffff';}

				ctx.strokeStyle = '#000000';
				ctx.arc(x * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5, y * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5, BLOCKSIZE / 2 * 0.8, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.stroke();

			// 石がない場所（置けるかどうかの確認）
		} else if( board[x][y] == 0 ) {
			var turnCheck = 0;
			for( var i = -1; i <= 1; i++ ) {
				for( var j = -1; j <= 1; j++ ) {
					[turn_flag, temp_board] = turnStone(board.copy(),x, y, i, j,turn);
					if( turn_flag== 2 ) { 

							// 濃度調節
							var alpha = 0;
							if( x == mouseBlockX && y == mouseBlockY ) {
								canvas.style.cursor = 'pointer';
								alpha = 0.5;
							} else {
								alpha = 0.2;
							}

							// 石の表示
							ctx.beginPath();
							ctx.globalAlpha = alpha;
							if( turn == 1 ) { ctx.fillStyle = '#000000'; }
							else if( turn == -1 ) { ctx.fillStyle = '#ffffff'; }
							ctx.strokeStyle = '#000000';
							ctx.arc(x * BLOCKSIZE + NUMSIZE + ~~(BLOCKSIZE * 0.5) + 0.5, y * BLOCKSIZE + NUMSIZE + ~~(BLOCKSIZE * 0.5) + 0.5, BLOCKSIZE / 2 * 0.8, 0, 2 * Math.PI, false);
							ctx.fill();
							ctx.stroke();
							ctx.globalAlpha = 1;

							turnCheck = 1;
							break;
						}
					}
					if( turnCheck != 0 ) { break; }
				}
			}
		}
	}

	// ボード脇の色を設定
	ctx.beginPath();
	ctx.fillStyle = '#000000';
	ctx.rect(0, 0, CANVASSIZE + NUMSIZE, NUMSIZE);
	ctx.rect(0, 0, NUMSIZE, CANVASSIZE + NUMSIZE);
	ctx.fill();

	// ボード脇の文字表示
	var boardWordVer = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');
	var boardWordHor = new Array('1', '2', '3', '4', '5', '6', '7', '8');
	for( var i = 0; i < BOARDSIZE; i++ ) {
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

function DrawAIthink(){
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.fillStyle = '#B3677A';
	ctx.fillText("boardWordVer[i]", 100,100);
}

//----------------------------------------
// 評価値を返す
//----------------------------------------
function analysis(){

	ctx.beginPath();
	ctx.font = ANALYSISSIZE + "px 'Osaka'";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = '#ffffff';
	var movelist = MovelistFunc(board.copy(),turn);
	Role[2] = document.Preference.ana_role.value;
	AI_name = "AI"+Role[2];
	[nextmove,eval_list] = othello_AI[AI_name](board,turn);
	for(var i=0; i < movelist.length; i++){
		ctx.fillText(Math.floor(eval_list[i]),movelist[i][0] * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5, movelist[i][1] * BLOCKSIZE + ~~(BLOCKSIZE * 0.5) + NUMSIZE + 0.5);
	}
}



//----------------------------------------
//----------------------------------------
// AIの思考に必要な関数
//----------------------------------------
//----------------------------------------

//----------------------------------------
// 開放度を返す
//----------------------------------------
function countOpeness(board, x, y, i, j,turn,turn_num,openess)
{

	if( i == 0 && j == 0 ) { return [0,0]; }

	x += i;
	y += j;

	// 例外処理
	if( x < 0 || x > BOARDSIZE - 1 || y < 0 || y > BOARDSIZE - 1 ) {
		return [0,0];
	}

	// 何もないとき
	if( board[x][y] == 0 ) {
		return [0,0];
	// 自分の石があるとき
}
else if( board[x][y] == turn ) {
	return [turn_num,openess];

	// 相手の石があるとき
} 
else 
{
			// 最後に自分の石があればひっくり返す
			openess += countOpenessEach(board.copy(),x,y);

			return countOpeness(board.copy(), x, y, i, j,turn,turn_num+1,openess);

		}
	}

	function countOpenessEach(board,x,y){
		openess = 0;
		for( var i = -1; i <= 1; i++ ) {
			for( var j = -1; j <= 1; j++ ) {
				if( x+i < 0 || x+i > BOARDSIZE - 1 || y+i < 0 || y+i > BOARDSIZE - 1 ) {
					return 0;
				}
				if( board[x+i][y+j] == 0 ) { openess++; }
			}
		}
		return openess;
	}


	// ゲームの終了判定(まだ終わらないならreturn 1、終わるならgameOver()を呼び出す)
	function isEnd(board,turn){
//両者パスしたら終了
var movelist = MovelistFunc(board,turn);	
console.log(movelist,turn,Pass);
if(Pass ==1 && movelist.length == 0){
	gameOver()
	exit;
}

//全マス埋まったら終了
var gameCheck = 0;
for( var x = 0; x < BOARDSIZE; x++ ) {
	for( var y = 0; y < BOARDSIZE; y++ ) {
		if( board[x][y] == 0 ) {
			return 1;
		}
	}
	if( gameCheck != 0 ) { break; }
}
if(gameCheck == 0){
	gameOver()
	exit;
}
}



//----------------------------------------
// 石の数を数える（boardを与えると、黒、白、スペースの数を返す９）
//----------------------------------------
function CountStone(board)
{
	numBlack = 0;
	numWhite = 0;
	numSpace = 0;
	for( var x = 0; x < BOARDSIZE; x++ ) {
		for( var y = 0; y < BOARDSIZE; y++ ) {
			if ( board[x][y] == 1 ){
				numBlack++;
			}
			else if ( board[x][y] == -1 ){
				numWhite++;
			}
			else{
				numSpace++;
			}
		}
	}
	return [numBlack, numWhite, numSpace];
}

//----------------------------------------
// 完全読み関数（最善進行での石数差を返す）
//----------------------------------------
function CountStoneAll(board,turn,pass)
{	

	[numBlack, numWhite, numSpace] = CountStone(board.copy());
	var movelist = MovelistFuncLite(board.copy(),turn);	

	if (numSpace == 0 || ( pass == 1 && movelist.length == 0)){
		return numBlack-numWhite;
	} 
	if(pass == 0 && movelist.length == 0 ){
		return CountStoneAll(board.copy(),turn*(-1),1);
	}
	
	
	if (turn == 1){
		var maxDiff = -BOARDSIZE*BOARDSIZE;
	}
	else if (turn == -1){
		var maxDiff = BOARDSIZE*BOARDSIZE;
	}	
	for (var i = 0; i < movelist.length; i++) {
		[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);
		stoneDiff = CountStoneAll(next_board.copy(),next_turn,0);
		if (turn == 1 && stoneDiff > maxDiff ){
			maxDiff = stoneDiff;
		}
		else if (turn == -1 && stoneDiff < maxDiff ){
			maxDiff = stoneDiff;
		}		
	}
	return maxDiff;
}

//----------------------------------------
// 完全読み関数（最善進行での石数差を返す）
//----------------------------------------
function CountStoneAllAlphaBeta(board,turn,eval_turn,pass,alpha,beta)
{	

	[numBlack, numWhite, numSpace] = CountStone(board);
	var movelist = MovelistFuncLite(board,turn);	

	if (numSpace == 0 || ( pass == 1 && movelist.length == 0)){
		return numBlack-numWhite;

	} 
	if(pass == 0 && movelist.length == 0 ){
		return CountStoneAllAlphaBeta(board.copy(),turn*(-1),eval_turn,1,alpha,beta);
	}
	var maxDiff = -BOARDSIZE*BOARDSIZE;
	var minDiff = BOARDSIZE*BOARDSIZE;

for (var i = 0; i < movelist.length; i++) {
	var next_board;
	[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);
	stoneDiff = CountStoneAllAlphaBeta(next_board,next_turn,eval_turn,0,maxDiff,minDiff);
	if ((turn == 1 && stoneDiff > beta) || (turn == -1 && stoneDiff < alpha) ){
		return stoneDiff;
	}		
	if (maxDiff < stoneDiff ){
		maxDiff = stoneDiff;
	}
	if (minDiff > stoneDiff ){
		minDiff = stoneDiff;
	}	

}
if (turn == 1){
	return maxDiff;
}
else{
	return minDiff;
}	
}


//----------------------------------------
// 回帰思考関数（depthの深さでMinMax法で探索する）
//----------------------------------------
function MinMax(board,eval_turn,turn,depth)
{	
	var movelist = MovelistFunc(board.copy(),turn);		//合法手を取得する

//最深まで読んだら評価値を返す
	if(depth <= 0){
		//自分と同じ色のときはプラスで、違うときはマイナスを返す
		if (eval_turn == turn){
			eval_sign = 1;
		}
		else{
			eval_sign = -1;
		}
		return eval_sign * movelist.length;
	}

//合法手が無い時はパスして先の手を読む
	if(movelist.length == 0 ){
		return MinMax(board.copy(),eval_turn,turn*(-1),depth-1);
	}

//自分と同じ色のときMax法で、違う色のときはMin法で
	if (turn == eval_turn){
		var max_eval = -1000;
	}
	else{
		var max_eval = 1000;
	}	
	
	for (var i = 0; i < movelist.length; i++) {
		[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);
		eval = MinMax(next_board.copy(),eval_turn,next_turn,depth-1)+EvalBoard(movelist[i][0],movelist[i][1],eval_turn,turn,board.copy())-movelist[i][3]-1*movelist[i][2]+2*Math.random();
		if (turn == eval_turn && max_eval < eval ){

			max_eval = eval;
		}
		else if (turn != eval_turn && max_eval > eval ){

			max_eval = eval;
		}		
	}
	return max_eval;
}



//----------------------------------------
// 回帰思考関数（depthの深さでalpha-beta法で探索する）
//----------------------------------------
function AlphaBeta(board,eval_turn,turn,depth,alpha,beta)
{	
	var movelist = MovelistFunc(board,turn);		//合法手を取得する
	
//最深まで読んだら評価値を返す
	if(depth <= 0){
		//自分と同じ色のときはプラスで、違うときはマイナスを返す
		if (eval_turn == turn){
			eval_sign = 1;
		}
		else{
			eval_sign = -1;
		}
		return eval_sign * (movelist.length);
	}

//合法手が無い時はパスして先の手を読む
	if(movelist.length == 0 ){
		return AlphaBeta(board.copy(),eval_turn,turn*(-1),depth-1,alpha,beta)
	}

//自分と同じ色のときMax法で、違う色のときはMin法で

		var max_eval = -1000;
		var max_return_eval = -1000;
		var min_eval = 1000;
		var min_return_eval = 1000;

	for (var i = 0; i < movelist.length; i++) {
		[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);
		return_eval = AlphaBeta(next_board.copy(),eval_turn,next_turn,depth-1,max_return_eval,min_return_eval);
		eval = return_eval+EvalBoard(movelist[i][0],movelist[i][1],eval_turn,turn,board)-0.3*depth*movelist[i][3]-0.3*depth*movelist[i][2]+2*Math.random();
			if ((turn == eval_turn && eval >= beta) || (turn != eval_turn && eval <= alpha) ){
				return eval;
			}
		if (max_eval < eval ){
			max_eval = eval;
			max_return_eval = return_eval;
		}
		if (min_eval > eval ){
			min_eval = eval;
			min_return_eval = return_eval;
		}	

	}
		if (turn == eval_turn){
		return max_eval;
	}
	else{
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
Array.prototype.copy = function()
{
	var obj = new Array();

	for( var i = 0, len = this.length; i < len; i++ ) {
		if( this[i].length > 0 && this[i].copy() ) { obj[i] = this[i].copy(); }
		else { obj[i] = this[i]; }
	}

	return obj;
}


function xsort(arrs, col, order){
  //二次元配列のソート
  //col:並べ替えの対象となる列
  //order:1=昇順、-1=降順
  arrs.sort(function(a,b){
    return (a[col]-b[col])*order;
  });
  return arrs;
}


window.onload = function()
{
	// 初期設定
	init();
}










//----------------------------------------
//----------------------------------------
// AI(CPU2～)
//----------------------------------------
//----------------------------------------

othello_AI.AI2 = function(board,turn){

		movelist = MovelistFunc(board.copy(),turn);	
		var eval_list = []
		var eval_high = 0
		var eval_board = [
  				[10, 0, 5, 3, 3, 5, 0,10,], 
  				[ 0, 1, 2, 2, 2, 2, 1, 0,], 
  				[ 5, 2, 4, 4, 4, 4, 2, 5,], 
  				[ 3, 2, 4, 0, 0, 4, 2, 3,], 
  				[ 3, 2, 4, 0, 0, 4, 2, 3,], 
  				[ 5, 2, 4, 4, 4, 4, 2, 5,], 
  				[ 0, 1, 2, 2, 2, 2, 1, 0,], 
  				[10, 0, 5, 3, 3, 5, 0,10,], 
		];

		for(var i=0; i < movelist.length; i++){
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Math.random()*0.1);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) )
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]]
		return [best_move_array,eval_list];

}



othello_AI.AI3 = function(board,turn){
  		Factor_NumOfOpeness = -1;
		movelist = MovelistFunc(board.copy(),turn);	
		var eval_list = [];
		var eval_high = 0;
		var eval_board = [
  				[100, 0, 10, 6, 6, 10, 0,100,], 
  				[ 0, 2, 4, 4, 4, 4, 2, 0,], 
  				[ 10, 4, 8, 8, 8, 8, 4, 10,], 
  				[ 6, 4, 8, 0, 0, 8, 4, 6,], 
  				[ 6, 4, 8, 0, 0, 8, 4, 6,],
  				[ 10, 4, 8, 8, 8, 8, 4, 10,], 
  				[ 0, 2, 4, 4, 4, 4, 2, 0,], 
  				[100, 0, 10, 6, 6, 10, 0,100,], 
		];

		for(var i=0; i < movelist.length; i++){
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Factor_NumOfOpeness*movelist[i][3]+Math.random()*0.1);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
		return [best_move_array,eval_list];

}



othello_AI.AI4 = function(board,turn){
	var ENDGAMEPHASE = 7; //完全読みを始める空きマス数
	var Factor_NumOfOpeness = -0.2;	//開放度を重視する度合い

	[numBlack, numWhite, numSpace] = CountStone(board);
			if (numSpace <= ENDGAMEPHASE){
				var eval_list = [];
				var movelist = MovelistFunc(board.copy(),turn);	
				for(var i=0; i < movelist.length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);	

					count_num = CountStoneAll(next_board.copy(),next_turn,0);
					eval_list.push(count_num);
				} 
				if (turn == 1){
					best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
				}
				else{
					best_move_index = eval_list.indexOf(Math.min.apply(null,eval_list) );					
				}
				best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
				return [best_move_array,eval_list];
			}






  		
  		var movelist = MovelistFunc(board.copy(),turn);	
		var eval_list = [];
		var eval_high = 0;
		var eval_board = [
  				[100, 0, 10, 6, 6, 10, 0,100,], 
  				[ 0, 2, 4, 4, 4, 4, 2, 0,], 
  				[ 10, 4, 8, 8, 8, 8, 4, 10,], 
  				[ 6, 4, 8, 0, 0, 8, 4, 6,], 
  				[ 6, 4, 8, 0, 0, 8, 4, 6,],
  				[ 10, 4, 8, 8, 8, 8, 4, 10,], 
  				[ 0, 2, 4, 4, 4, 4, 2, 0,], 
  				[100, 0, 10, 6, 6, 10, 0,100,], 
		];

		for(var i=0; i < movelist.length; i++){
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Factor_NumOfOpeness*movelist[i][3]+Math.random()*0.1);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
		return [best_move_array,eval_list];

}




othello_AI.AI5 = function(board,turn){
	var ENDGAMEPHASE = 7; //完全読みを始める空きマス数
	var DEPTH = 2;	//序中盤の読みの深さ
//完全読み
		[numBlack, numWhite, numSpace] = CountStone(board);
			if (numSpace <= ENDGAMEPHASE){
				var eval_list = [];
				var movelist = MovelistFunc(board.copy(),turn);	
				for(var i=0; i < movelist.length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);	

					count_num = CountStoneAll(next_board.copy(),next_turn,0);
					eval_list.push(count_num);
				} 
				if (turn == 1){
					best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
				}
				else{
					best_move_index = eval_list.indexOf(Math.min.apply(null,eval_list) );					
				}
				best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
				return [best_move_array,eval_list];
			}
//序中盤の思考
			var movelist = MovelistFunc(board.copy(),turn);	
			var eval_list = [];
				for(var i=0; i < movelist.length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);	

					eval = MinMax(next_board.copy(),turn,next_turn,DEPTH)
					eval += EvalBoard(movelist[i][0],movelist[i][1],turn,turn,board.copy());
					eval_list.push(eval);
				} 
					best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );

		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]]
		return [best_move_array,eval_list];

}


othello_AI.AI6 = function(board,turn){
	var ENDGAMEPHASE = 7; //完全読みを始める空きマス数
	var DEPTH = 3;	//序中盤の読みの深さ
//完全読み
		[numBlack, numWhite, numSpace] = CountStone(board.copy());
			if (numSpace <= ENDGAMEPHASE){
				var eval_list = [];
				var movelist = MovelistFunc(board.copy(),turn);	
				movelist = xsort(movelist, 3, 1);
				var minDiff = -BOARDSIZE*BOARDSIZE;
				for(var i=0; i < movelist.length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);	

					count_num = CountStoneAllAlphaBeta(next_board.copy(),next_turn,turn,0,minDiff,BOARDSIZE*BOARDSIZE);
					if (minDiff < count_num ){
						minDiff = count_num;
					}					
					eval_list.push(count_num);
				} 
				if (turn == 1){
					best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
				}
				else{
					best_move_index = eval_list.indexOf(Math.min.apply(null,eval_list) );					
				}
				best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
				return [best_move_array,eval_list];
			}
//序中盤の思考
			var movelist = MovelistFunc(board.copy(),turn);	
			movelist = xsort(movelist, 3, 1);
			var eval_list = [];
			var min_eval = -1000;
				for(var i=0; i < movelist.length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);	
					eval = AlphaBeta(next_board.copy(),turn,next_turn,DEPTH,min_eval,1000);
					eval_list.push(eval);
					if (min_eval < eval ){
						min_eval = eval;
					}
				} 

		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
	
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]]
		return [best_move_array,eval_list];

}
//----------------------------------------
// 評価ボード（位置を与えると、その位置の評価値を返す）
//----------------------------------------
function EvalBoard(x,y,eval_turn,turn,board)
{	
	var eval_board = [
  				[100, -30, 10, 6, 6, 10, -30,100,], 
  				[ -30, -20, 4, 4, 4, 4, -20, -30,], 
  				[ 10, 4, 8, 8, 8, 8, 4, 10,], 
  				[ 6, 4, 8, 0, 0, 8, 4, 6,], 
  				[ 6, 4, 8, 0, 0, 8, 4, 6,],
  				[ 10, 4, 8, 8, 8, 8, 4, 10,], 
  				[ -30, -20, 4, 4, 4, 4, -20, -30,],  
  				[100, -30, 10, 6, 6, 10, -30,100,], 
	];

		if( ( (x == 1 & y == 0) || (x == 0 & y == 1) ) && board[0][0] == turn ){
			eval_board[x][y] = 40;
		}
		else if( ( (x == 6 & y == 0) || (x == 7 & y == 1) ) && board[7][0] == turn ){
			eval_board[x][y] = 40;
		}
		else if( ( (x == 0 & y == 6) || (x == 1 & y == 7) ) && board[0][7] == turn ){
			eval_board[x][y] = 40;
		}
		else if( ( (x == 7 & y == 6) || (x == 6 & y == 7) ) && board[7][7] == turn ){
			eval_board[x][y] = 40;
		}

	if (eval_turn == turn){
		eval_sign = 1
	}
	else{
		eval_sign = -1;
	}

	return eval_sign * eval_board[x][y];
}



