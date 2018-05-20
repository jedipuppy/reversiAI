
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
			eval_list.push(eval_board[movelist[i][0]][movelist[i][1]]+Math.random()*1);
				
		} 

		best_move_index = eval_list.indexOf(Math.max.apply(null,eval_list) )
		best_move_array = [movelist[best_move_index][0],movelist[best_move_index][1]]
		return [best_move_array,eval_list];

}