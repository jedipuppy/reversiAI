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
	[ 1, 1, 1, 1, 1, 1,], 
	[ 1, 1, 1, 1, 1, 1,], 
	[ 1, 1, 1, 1, 1, 1,], 
	[ 1, 1, 1, 1, 1, 1,], 
	[ 1, 1, 1, 1, 1, 1,], 
	[ 1, 1, 1, 1, 1, 1,], 
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
var BOARDSIZE = 6;
var BLOCKSIZE = 60;					// １マスのサイズ
var CANVASSIZE = BLOCKSIZE * BOARDSIZE;				// ボードのサイズ
var NUMSIZE = 100;					// ボード横の番号幅
var ENDDURATION =1 // AI同士でげーむ終了してから次のゲーム開始までの時間
var MAXGAMEPERMATCH = 50;
var blackStoneNum = 0;					// 黒石の数
var whiteStoneNum = 0;					// 白石の数
var Role = [0,0]; // 思考（Role[0]が白番、Role[1]が黒番,Role[2]が解析用AI、0:人間、1:CPU1、2:CPU2）
// ボード脇の文字表示
var boardWordVer = new Array('A', 'B', 'C', 'D', 'E', 'F');
var boardWordHor = new Array('1', '2', '3', '4', '5', '6');


//----------------------------------------
//----------------------------------------
// オセロゲームを制御するクラス
//----------------------------------------
//----------------------------------------
class　Game{
	    constructor(AI1,AI2){
		//AIの初期化
		this.Role =[];
		this.Role[1] = AI1;
		this.Role[0] = AI2;
	    	this.init();
}
		init(){
        //パラメータの初期化
		this.turn = 1;						// ターン
		this.pass = 0;
		// ボードの初期化
		this.board = new Array();					// ボード配列
		for( var i = 0; i < BOARDSIZE; i++ ) {
				this.board[i] = new Array();
				for( var j = 0; j < BOARDSIZE; j++ ) { this.board[i][j] = 0; }
		}
		this.board[2][3] = this.board[3][2] = 1;
		this.board[2][2] = this.board[3][3] = -1;


		this.nextmove =[];
		this.eval_list = [];			
		}
		AIturn(){
	var movelist = MovelistFunc(this.board,this.turn);

	if (movelist.length == 0){
		//終了判定
		var result_Diff;
		[result_Diff,this.turn,this.pass] = isEnd(this.board,this.turn,this.pass);

		if (result_Diff != 100){
			return result_Diff;
		}
		else{
			return this.AIturn();
		}
	}
	this.pass = 0;
	[this.nextmove,this.eval_list] = othello_AI[this.Role[0.5+this.turn*0.5]](this.board,this.turn);

	[this.board,this.turn] = putStone(this.board.copy(),this.turn,this.nextmove[0],this.nextmove[1]);
	return this.AIturn();
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
async function init()
{
	const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

	var game =[];
	var resultTable = [];
	var rating = [];
	for(var AI1 = 0; AI1 < AINameList.length; AI1++){
		game[AI1] =[];
		resultTable[AI1] =[];
		rating[AI1] = 1000;
		for(var AI2 = 0; AI2 < AINameList.length; AI2++){
			resultTable[AI1][AI2] =[];
			resultTable[AI1][AI2] =[];
			resultTable[AI1][AI2][0] =0;
			resultTable[AI1][AI2][1] =0;
		}
	}

			for(var i = 0; i <= MAXGAMEPERMATCH; i++){
	for(var AI1 = 0; AI1 < AINameList.length; AI1++){
		for(var AI2 = 0; AI2 < AINameList.length; AI2++){

			game[AI1][AI2] = new Game(AINameList[AI1],AINameList[AI2]);
		}
	}
			
					for(var AI1 = 0; AI1 < AINameList.length; AI1++){
		for(var AI2 = 0; AI2 < AINameList.length; AI2++){


				game[AI1][AI2].init();
				result_Diff = game[AI1][AI2].AIturn();
				gamepoint = updateResult(result_Diff)
				resultTable[AI1][AI2][0] += gamepoint;
				resultTable[AI1][AI2][1] += 1 - gamepoint;
				rating = ratingCal(AI1,AI2,gamepoint,rating);


				};
				await sleep(1);
				makeTable(AINameList,resultTable,rating,"table");

}
document.getElementById('matchNum').innerHTML=i + " 回目";


			}
}

function ratingCal(AI1,AI2,gamepoint,rating){
	K = 1;
	if (AI1 == AI2){
		return rating;
	}
	E1 = 1/(1+Math.pow(10,(rating[AI2]-rating[AI1])/400));
	E2 = 1/(1+Math.pow(10,(rating[AI1]-rating[AI2])/400));	
	rating[AI1] = rating[AI1] + K * (gamepoint-E1);
	rating[AI2] = rating[AI2] + K * ((1-gamepoint)-E2);
	return rating;
}
//----------------------------------------
// 設定ボタンをおした時の動作
//----------------------------------------
function updateResult(result_Diff){
//戦歴を更新する
	if (result_Diff > 0){	//黒勝ち
		return 1;
	}
	else if (result_Diff < 0){	//白勝ち
		return 0;
	}
	else{	//引き分け勝ち
		return 0.5;
	}
}


//----------------------------------------
// 設定ボタンをおした時の動作
//----------------------------------------
function restart(){
	try{
	MAXGAMEPERMATCH = document.Preference.NumOfMatch.value;
	}
	catch(e){

	}
	init();
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

function putStone(board,turn,x,y)
{
	// 可否確認

	if( board[x][y] != 0 ) { return [board,turn]; }


	// 石を返す
	var turnCheck = 0;
	for( var i = -1; i <= 1; i++ ) {
		for( var j = -1; j <= 1; j++ ) {
			[turn_flag, temp_board] = turnStone(board,x, y, i, j, turn);
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
	movelist = [];
	turn_num_all = 0;
	openess_all = 0;

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
					move_num++;
				}
			}
		}
	}
	return movelist;
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
			openess += countOpenessEach(board,x,y);

			return countOpeness(board, x, y, i, j,turn,turn_num+1,openess);

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
function isEnd(board,turn,pass){
//両者パスしたら終了
var movelist = MovelistFunc(board,turn);	
if( movelist.length == 0){
	if( pass == 1 ){
		[numBlack, numWhite, numSpace] = CountStone(board);

			return [numBlack-numWhite,turn,1];		
	}
	else{
		return [100,(-1)*turn,1];
	}
}
return [100,turn,0];
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

	[numBlack, numWhite, numSpace] = CountStone(board);
	var movelist = MovelistFuncLite(board,turn);	

	if (numSpace == 0 || ( pass == 1 && movelist.length == 0)){
		return numBlack-numWhite;
	} 
	if(pass == 0 && movelist.length == 0 ){
		return CountStoneAll(board,turn*(-1),1);
	}
	
	
	if (turn == 1){
		var maxDiff = -BOARDSIZE*BOARDSIZE;
	}
	else if (turn == -1){
		var maxDiff = BOARDSIZE*BOARDSIZE;
	}	
	for (var i = 0; i < movelist.length; i++) {
		[next_board,next_turn] = putStone(board.copy(),turn,movelist[i][0],movelist[i][1]);
		stoneDiff = CountStoneAll(next_board,next_turn,0);
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
		eval = MinMax(next_board.copy(),eval_turn,next_turn,depth-1)+EvalBoard(movelist[i][0],movelist[i][1],eval_turn,turn,board.copy())-movelist[i][3]+2*Math.random();
		if (turn == eval_turn && max_eval < eval ){

			max_eval = eval;
		}
		else if (turn != eval_turn && max_eval > eval ){

			max_eval = eval;
		}		
	}
	return max_eval+2*Math.random();
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
		return eval_sign * (movelist.length)+Edgeeval(eval_turn,board);
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
		eval = return_eval+2*Math.random();
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
		return eval_sign * (movelist.length)+Edgeeval(eval_turn,board);
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
		eval = return_eval+4*Math.random();
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



function makeTable(list, data, rating, tableId){
    // 表の作成開始
    var rows=[];
    var table = document.createElement("table");
    var par_table =document.getElementById(tableId);

    while (par_table.firstChild) par_table.removeChild(par_table.firstChild);
    // 表に2次元配列の要素を格納
             rows.push(table.insertRow(-1));  // 行の追加   
            cell=rows[0].insertCell(-1);
            cell.appendChild(document.createTextNode(""));             
    for(j = 0; j < data[0].length; j++){
            cell=rows[0].insertCell(-1);
            cell.appendChild(document.createTextNode(list[j]));
    }
            cell=rows[0].insertCell(-1);
            cell.appendChild(document.createTextNode("rating"));

    for(i = 0; i < data.length; i++){
        rows.push(table.insertRow(-1));  // 行の追加
        cell=rows[i+1].insertCell(-1);
        cell.style.backgroundColor = " rgb(0,0,0)";
        cell.style.color = " rgb(255,255,255)";
        cell.appendChild(document.createTextNode(list[i]));

        for(j = 0; j < data[0].length; j++){
            cell=rows[i+1].insertCell(-1);
            prob = Math.round(data[i][j][0]/(data[i][j][0]+data[i][j][1])*100);
          cell.appendChild(document.createTextNode(prob+" %"));
            // 背景色の設定
            	alpha = data[i][j][0]/(data[i][j][0]+data[i][j][1])
                cell.style.backgroundColor = " rgba(255,139,139,"+alpha+")";
        }
        cell=rows[i+1].insertCell(-1);
        cell.appendChild(document.createTextNode(rating[i]));
    }
    // 指定したdiv要素に表を加える
    document.getElementById(tableId).appendChild(table);
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
  				[10, 0, 4, 4, 0,10,], 
  				[ 0, 1, 2, 2, 1, 0,], 
  				[ 4, 2, 0, 0, 2, 4,], 
  				[ 4, 2, 0, 0, 2, 4,], 
  				[ 0, 1, 2, 2, 1, 0,], 
  				[10, 0, 4, 4, 0,10,], 
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
  				[　100,　-20,　　4,　　4, -20,　100,], 
  				[ -20,　-50,　　2,　　2, -50, -20,], 
  				[　　　4, 2, 0, 0, 2, 4,], 
  				[ 4, 2, 0, 0, 2, 4,], 
  				[ -20, 1, 2, 2, 1, -50,], 
  				[100, -20, 4, 4, -20,100,], 
		];

		for(var i=0; i < movelist.length; i++){
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Factor_NumOfOpeness*movelist[i][3]+Math.random()*3);
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
  				[　100,　-20,　　4,　　4, -20,　100,], 
  				[ -20,　-50,　　2,　　2, -50, -20,], 
  				[　　　4, 2, 0, 0, 2, 4,], 
  				[ 4, 2, 0, 0, 2, 4,], 
  				[ -20, -50, 2, 2, -50, -20,], 
  				[100, -20, 4, 4, -20,100,], 
		];

		for(var i=0; i < movelist.length; i++){
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Factor_NumOfOpeness*movelist[i][3]+Math.random()*5);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
		return [best_move_array,eval_list];

}




othello_AI.AI5 = function(board,turn){
	var ENDGAMEPHASE = 8; //完全読みを始める空きマス数
	var DEPTH = 3;	//序中盤の読みの深さ
//完全読み
		[numBlack, numWhite, numSpace] = CountStone(board.copy());
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
	var ENDGAMEPHASE = 11; //完全読みを始める空きマス数
	var DEPTH = 4;	//序中盤の読みの深さ
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
	
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
		return [best_move_array,eval_list];

}



//----------------------------------------
// 評価ボード（位置を与えると、その位置の評価値を返す）
//----------------------------------------
function EvalBoard(x,y,eval_turn,turn,board)
{	
	var eval_board = [
	[　100,　-50,　　0,　　0, -50,　100,], 
	[ -50,　-40,　　0,　　0, -40, -50,], 
	[　  0,  0,   0,  0,   0,   0,], 
	[　  0,  0,   0,  0,   0,   0,], 
	[ -50,　-40,　　0,　　0, -40, -50,], 
	[　100,　-50,　　0,　　0, -50,　100,], 
	];
		if( ( (x == 1 & y == 0) || (x == 0 & y == 1) ) && board[0][0] == turn ){
			eval_board[x][y] = 60;
		}
		else if( ( (x == 4 & y == 0) || (x == 5 & y == 1) ) && board[5][0] == turn ){
			eval_board[x][y] = 60;
		}
		else if( ( (x == 0 & y == 4) || (x == 1 & y == 5) ) && board[0][5] == turn ){
			eval_board[x][y] = 60;
		}
		else if( ( (x == 5 & y == 4) || (x == 4 & y == 5) ) && board[5][5] == turn ){
			eval_board[x][y] = 60;
		}

	if (eval_turn == turn){
		eval_sign = 1
	}
	else{
		eval_sign = -1;
	}

	return eval_sign * eval_board[x][y];
}




//----------------------------------------
// 評価ボード（位置を与えると、その位置の評価値を返す）
//----------------------------------------
function Edgeeval(eval_turn,board)
{
	eb = board.copy();
	for( var i = 0; i < BOARDSIZE; i++ ) {
		for( var j = 0; j < BOARDSIZE; j++ ) { 
			if (board[i][j] == -1){
				eb[i][j] = 2;
			}
		}
	}
	eval_edge_list = [0, 100, -100, -30, 130, -150, 30, 150, -130, 10, 10, -120, -10, 160, -180, 0, 10, -180, -10, 120, -10, 0, 180, -10, 10, 180, -160, 10, 120, -120, -100, 30, -200, 30, 30, -200, 20, 30, -200, 30, 220, -230, 40, 20, -220, 0, 50, -30, -200, 30, -30, 30, 30, -200, -10, 120, -120, -30, 200, -30, 100, 200, -30, 0, 30, -50, -30, 200, -30, 200, 30, -30, -20, 200, -30, -40, 220, -20, -30, 230, -220, -30, 60, -160, -10, 130, -190, 0, 40, -200, -100, 0, -200, -50, 30, -250, 5, -50, -250, -30, 80, -30, -50, 30, -100, 0, 30, -200, -10, 100, -130, -50, 30, -50, -30, 50, 0, 30, 30, -200, 10, 250, -250, 0, -50, -250, -30, 30, -30, -200, -250, -130, 0, -30, 250, 0, 70, -150, -50, 100, -130, -70, 30, -200, -200, -30, -200, -200, 30, 30, 0, 30, -70, -40, 30, -200, -250, 0, -120, 0, -30, -250, 30, 160, -60, 0, 200, -40, 10, 190, -130, 30, 30, -80, -30, 200, -30, 50, 100, -30, 100, 200, 0, -70, 250, 50, 50, 250, -30, 0, 150, -70, 70, 200, -30, 50, 130, -100, 40, 200, -30, 0, 250, 30, 250, 120, 0, 200, 200, 30, 0, 70, -30, 200, -30, -30, 10, 130, -100, 30, 0, -50, 50, 50, -30, 30, 30, -30, 0, -250, 30, 200, 130, 250, -30, 200, -30, 0, 250, 50, -10, 250, -250, 100, 200, 0, 60, 230, -30, 160, 220, -30, 120, 150, -20, 100, 250, -80, 150, 100, -100, 120, 220, 30, 70, 220, 50, 130, 200, -80, 10, 150, -30, 0, 30, -30, 30, 50, -50, 30, 30, -50, 30, 180, 0, 200, 30, 0, 30, 100, 0, -30, 30, 0, 30, 0, -30, 120, 220, 0, 80, 180, 0, 200, 180, 0, 50, 100, 0, 30, 100, 10, 200, 0, 0, 200, 180, 0, 30, 120, 10, 200, 120, -100, 130, 230, 30, 130, 200, 0, 200, 180, 0, 30, 30, 0, 30, 120, 0, 200, 100, 0, 200, 180, 50, 100, 120, 0, 0, 120, -30, 160, 250, 0, 30, 120, 50, 200, 120, 30, 220, 180, 100, 250, 300, 150, 250, 200, 80, 200, 100, 50, 30, 200, 50, -250, 140, 0, 180, 220, 80, 30, 120, 0, 250, 120, 0, 30, 30, 0, -250, 200, 50, 70, 140, 0, 220, 120, 0, 0, 120, 0, 250, 100, -60, 150, 220, 30, 40, 180, 0, 190, 220, 10, 30, 50, 0, 50, 120, 0, 130, 0, 0, 200, 180, 30, 30, 120, 0, 50, 50, 30, 10, 100, -30, -50, 100, 0, 100, 0, -10, 20, 30, -30, -50, 200, 50, 120, 120, 0, 30, 0, 0, 30, 140, 0, 130, 100, -60, 180, 200, 50, 30, 120, 0, 250, 50, 0, 30, 0, -10, -30, 140, 0, -30, 100, -50, 230, 120, 10, -30, 100, -50, 250, 0, -100, -100, 0, -200, -160, 30, -220, -60, 30, -230, -120, -30, -220, -130, 0, -200, -70, -30, -220, -120, 0, -150, -150, 80, -100, -100, 50, -250, -120, 0, -220, -200, 0, -180, -80, 0, -180, -200, 0, -180, -200, 100, -120, -30, -30, -120, -50, 0, -100, -200, 0, 0, -30, -10, -100, -10, 30, -150, -30, 50, -50, 0, 30, -30, -30, 0, -100, -30, 50, 0, 30, 0, -30, -30, 0, -30, -200, 0, -30, -30, 10, -180, -150, -30, -220, -190, -10, -220, -40, 0, -180, -200, -30, -180, -50, -30, -50, -30, 0, -120, -30, 0, -50, -130, 0, 0, -50, 0, -120, -180, -50, -200, -250, 0, -50, -30, 0, -120, -230, -10, -120, -250, 100, 0, 30, 50, -100, -30, 10, 0, 30, 50, -100, 30, 0, -140, -10, 30, -100, -100, 10, 0, 50, 0, -100, -30, 0, 0, -130, 60, -100, -30, 0, -140, -20, 30, -30, -120, 0, -120, 50, -50, -200, -130, -30, -230, -200, 0, -180, -130, 10, -200, -200, -50, -180, 0, 30, -120, -100, -10, -120, -30, 0, -30, -200, 0, -100, -30, 0, -120, -180, -80, -220, -250, 0, -120, -30, 0, -120, -220, 0, -120, -250, 60, -100, 0, 0, -120, -30, 0, -30, -70, 0, -140, 250, -50, -200, -160, 0, -250, -200, -30, -120, -30, 30, -120, -200, -50, -100, 250, 0, -140, -30, -60, -200, -220, -100, -180, -250, -60, -200, -250, -100, -300]
		edge_eval = 0;
	edge_eval += 0.82 * eval_edge_list[eb[0][0]+eb[0][1]*3+eb[0][2]*9+eb[0][3]*27+eb[0][4]*81+eb[0][5]*243];
	edge_eval += 0.82 * eval_edge_list[eb[5][0]+eb[5][1]*3+eb[5][2]*9+eb[5][3]*27+eb[5][4]*81+eb[5][5]*243];
	edge_eval += 0.82 * eval_edge_list[eb[0][0]+eb[1][0]*3+eb[2][0]*9+eb[3][0]*27+eb[4][0]*81+eb[5][0]*243];
	edge_eval += 0.82 * eval_edge_list[eb[0][5]+eb[1][5]*3+eb[2][5]*9+eb[3][5]*27+eb[4][5]*81+eb[5][5]*243];

//	edge_eval += 150*(board[0][0]+board[0][5]+board[5][0]+board[5][5]);
//	edge_eval += -50*(board[1][1]+board[1][4]+board[4][1]+board[4][4]);	
	edge_eval += -50*(board[1][0]+board[0][1]+board[5][1]+board[1][5]+board[5][4]+board[4][5]+board[4][0]+board[0][4]);	
	if (eval_turn == 1){
		eval_sign = 1
	}
	else{
		eval_sign = -1;
	}
	return eval_sign * edge_eval;
}


