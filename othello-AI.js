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

		for(var i=0; i < movelist[0].length; i++){
			eval_list.push(eval_board[movelist[0][i]][movelist[1][i]]+Math.random()*0.1);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) )
		best_move_array = [movelist[0][best_move_index],movelist[1][best_move_index]]
		return [best_move_array,eval_list];

}



othello_AI.AI3 = function(board,turn){
  		Factor_NumOfOpeness = -0.2;
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

		for(var i=0; i < movelist[0].length; i++){
			eval_list.push(eval_board[movelist[0][i]][movelist[1][i]]+Factor_NumOfOpeness*movelist[3][i]+Math.random()*0.1);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
		best_move_array = [movelist[0][best_move_index],movelist[1][best_move_index]];
		return [best_move_array,eval_list];

}



othello_AI.AI4 = function(board,turn){
	var ENDGAMEPHASE = 7; //完全読みを始める空きマス数
	var Factor_NumOfOpeness = -0.2;	//開放度を重視する度合い

	[numBlack, numWhite, numSpace] = CountStone(board);
			if (numSpace <= ENDGAMEPHASE){
				var eval_list = [];
				var movelist = MovelistFunc(board.copy(),turn);	
				for(var i=0; i < movelist[0].length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[0][i],movelist[1][i]);	

					count_num = CountStoneAll(next_board.copy(),next_turn,0);
					eval_list.push(count_num);
				} 
				if (turn == 1){
					best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
				}
				else{
					best_move_index = eval_list.indexOf(Math.min.apply(null,eval_list) );					
				}
				best_move_array = [movelist[0][best_move_index],movelist[1][best_move_index]];
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

		for(var i=0; i < movelist[0].length; i++){
			eval_list.push(eval_board[movelist[0][i]][movelist[1][i]]+Factor_NumOfOpeness*movelist[3][i]+Math.random()*0.1);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
		best_move_array = [movelist[0][best_move_index],movelist[1][best_move_index]];
		return [best_move_array,eval_list];

}




othello_AI.AI5 = function(board,turn){
	var ENDGAMEPHASE = 7; //完全読みを始める空きマス数
	var DEPTH = 3;	//序中盤の読みの深さ
//完全読み
		[numBlack, numWhite, numSpace] = CountStone(board);
			if (numSpace <= ENDGAMEPHASE){
				var eval_list = [];
				var movelist = MovelistFunc(board.copy(),turn);	
				for(var i=0; i < movelist[0].length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[0][i],movelist[1][i]);	

					count_num = CountStoneAll(next_board.copy(),next_turn,0);
					eval_list.push(count_num);
				} 
				if (turn == 1){
					best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
				}
				else{
					best_move_index = eval_list.indexOf(Math.min.apply(null,eval_list) );					
				}
				best_move_array = [movelist[0][best_move_index],movelist[1][best_move_index]];
				return [best_move_array,eval_list];
			}
//序中盤の思考
			var movelist = MovelistFunc(board.copy(),turn);	
			var eval_list = [];
				for(var i=0; i < movelist[0].length; i++){
					[next_board,next_turn] = putStone(board.copy(),turn,movelist[0][i],movelist[1][i]);	

					eval = RegressionEval(next_board.copy(),turn,next_turn,DEPTH)
					eval += EvalBoard(movelist[0][i],movelist[1][i],turn,turn,board.copy());
					eval_list.push(eval);
				} 
					best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );

		best_move_array = [movelist[0][best_move_index],movelist[1][best_move_index]]
		return [best_move_array,eval_list];

}

//----------------------------------------
// 評価ボード（位置を与えると、その位置の評価値を返す）
//----------------------------------------
function EvalBoard(x,y,eval_turn,turn,board)
{	
	var eval_board = [
	[　100,　0,　　20,　　20, 0,　100,], 
	[ 0,　10,　　20,　　20, 10, 0,], 
	[　20,20,20,20,20,20,], 
	[ 20,20,20,20,20,20,], 
	[ 0,　10,　　20,　　20, 10, 0,], 
	[100,　0,　　20,　　20, 0,　100,], 
	];

		if( ( (x == 1 & y == 0) || (x == 0 & y == 1) ) && board[0][0] == turn ){
			eval_board[x][y] = 40;
		}
		else if( ( (x == 4 & y == 0) || (x == 5 & y == 1) ) && board[5][0] == turn ){
			eval_board[x][y] = 40;
		}
		else if( ( (x == 0 & y == 4) || (x == 1 & y == 5) ) && board[0][5] == turn ){
			eval_board[x][y] = 40;
		}
		else if( ( (x == 5 & y == 4) || (x == 4 & y == 5) ) && board[5][5] == turn ){
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
