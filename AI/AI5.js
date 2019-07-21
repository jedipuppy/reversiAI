
othello_AI.AI5 = function(board,turn){
	var ENDGAMEPHASE = 3; //完全読みを始める空きマス数
	var DEPTH = 1;	//序中盤の読みの深さ
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
