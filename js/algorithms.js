
var hash_key;
function BFS(board) {
  /* Breadth-first Search is an algorithm for traversing a graph.         */
  /* Here, we set the root to the start tile of the board, and            */
  /* recursively search each connected node until we reach the end.       */
  /* We store each traversed node in a set, including the node we         */
  /* used to reach this one. Once the end is reached, we just traverse    */
  /* back our way unitl we return to the start. That will be the shortest */
  /* path to the end.                                                     */
  root_node = board.start_tile;
  end_node = board.end_tile;
  q = new Queue();
  traverse_map = new Map();


  // Let's first queue the starting node
  q.enqueue(root_node);

  // Now comes the search
  var interval = setInterval(function() {
    [q, traverse_map] = BFS_step(board, q, traverse_map);
    if (q.length < 1) {
      clearInterval(interval);

      // search is complete! Now we only need to go back the traverse map
      // until we reach the start
      back_tile = traverse_map[end_node.hash_key];
      if (typeof(back_tile) !== 'undefined'){
        while (back_tile !== board.start_tile) {
          back_tile.state = 'path';
          back_tile = traverse_map[back_tile.hash_key];
        }
      }
    }
  }, 10);

}

function BFS_step(board, q, traverse_map) {
  if (q.length < 1) {
    return [q, traverse_map];
  }
  // Executes a single step of the Breadth-first search.
  // Returns the quere and map in an array to be unpacked.
  current_tile = q.dequeue();

  // We'll traverse the child nodes in a clock-wise direction. starting from
  // the top edge
  r_moves = [-1,0,1,0];
  c_moves = [0,1,0,-1];

  for (const i of Array(r_moves.length).keys()) {
    shape = board.shape
    tile_pos = board.tilePosition(current_tile)
    r_idx =  tile_pos[0] + r_moves[i];
    c_idx = tile_pos[1] + c_moves[i];

    if (r_idx < 0 || c_idx < 0 || r_idx >= shape[0] || c_idx >= shape[1]) {
      // Ignore out of bound tiles
      continue;
    }

    next_tile = board.matrix[r_idx][c_idx];


    if (next_tile.state === 'filled' || next_tile.state === 'start') {
      // If next tile is a wall, or is the starting point, then ignore.
      continue;
    }

    // We'll use the tile coordinates as keys to our map;
    hash_key = next_tile.hash_key;


    if (typeof(traverse_map[hash_key]) === 'undefined') {
      // The tile has not been seen yet. Enqueue it and add it to traverse map.
      traverse_map[hash_key] = current_tile;
      if (next_tile.state !== 'end') {
        next_tile.state = 'queued';
        q.enqueue(next_tile);
      } else {
        // We found the shortest path, empty the queue so we can stop the search.
        q.empty();
        break;
      }
    }
    if (current_tile.state !== 'start') current_tile.state = 'traversed';
  }

  return [q, traverse_map];
}
