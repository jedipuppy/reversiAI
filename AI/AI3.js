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
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Factor_NumOfOpeness*movelist[i][3]+Math.random()*1);
		} 
		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) );
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]];
		return [best_move_array,eval_list];

}