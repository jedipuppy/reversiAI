
othello_AI.AI4 = function(board,turn){
	var ENDGAMEPHASE = 4; //完全読みを始める空きマス数
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
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Factor_NumOfOpeness*movelist[i][3]+Math.random()*2);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
		return [best_move_array,eval_list];

}