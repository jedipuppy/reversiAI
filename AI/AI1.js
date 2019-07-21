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
