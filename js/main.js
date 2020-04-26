var board;
document.addEventListener("DOMContentLoaded", function(e) {
  var board_parent = document.getElementById('board-container');
  var w = board_parent.offsetWidth;
  var h = board_parent.offsetHeight;
  var tile_size = 32;
  board = new Board("board", w, h, tile_size);
  board_parent.appendChild(board.element);
  setupAlgorithmConfig();
});
