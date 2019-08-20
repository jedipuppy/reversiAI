//調整する項目
let Factor_NumOfDiscs = 1; //返す石の数をどれぐらい重要視するか（0以上の場合は多く返したがる。0以下だと少なく返したがる。）
let eval_board = [
  //盤面のそれぞれの位置の価値を設定（大きい数字なほど優先して打つようになる）
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1]
];

// 発展的なヒント（空きマスが8個未満の時にFactor_NumOfDiscsを3にする場合は以下のようにします）
//		[numBlack, numWhite, numSpace] = CountStone(board.copy()); //石の数を数える。numBlackが黒石の数、numWhiteが白石の数、numSpaceが空きマスの数
//		if (numSpace < 8){  //もし空きマスが８個未満だったら
//      Factor_NumOfDiscs = 3;
//    }

//評価値の計算
let movelist = MovelistFunc(board.copy(), turn);
let eval_list = [];
let eval_high = 0;
for (let i = 0; i < movelist.length; i++) {
  eval_list.push(
    eval_board[movelist[i][0]][movelist[i][1]] +
      Factor_NumOfDiscs * movelist[i][2] +
      Math.random() * 0.1
  );
}
best_move_index = eval_list.indexOf(Math.max.apply(null, eval_list));
best_move_array = [movelist[best_move_index][0], movelist[best_move_index][1]];
return_arr = [best_move_array, eval_list];
