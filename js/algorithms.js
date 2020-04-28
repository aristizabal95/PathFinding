algorithms_struct = {
  "BFS": {
    function: BFS,
    config: {
      diagonal: false,
    }
  },
  "Dijkstra": {
    function: dijkstra,
    config: {
      diagonal: true,
      heuristic: euclidean,
    }
  },
  "a_star": {
    function: a_star,
    config: {
      diagonal: true,
      heuristic: euclidean,
    }
  }
};

function BFS(board, config) {
  /* Breadth-first Search is an algorithm for traversing a graph.         *
   * Here, we set the root to the start tile of the board, and            *
   * recursively search each connected node until we reach the end.       *
   * We store each traversed node in a set, including the node we         *
   * used to reach this one. Once the end is reached, we just traverse    *
   * back our way unitl we return to the start. That will be the shortest *
   * path to the end.                                                     */

  root_node = board.start_tile;
  end_node = board.end_tile;
  q = new Queue();
  traverse_map = new Map();


  // Let's first queue the starting node
  q.enqueue(root_node);

  // Now comes the search
  var interval = setInterval(function() {
    [q, traverse_map] = BFS_step(board, q, traverse_map, config);
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

function BFS_step(board, q, traverse_map, config) {
  // Default configuration
  var diagonal = false;
  if (typeof(config)!=='undefined') {
    diagonal = config.diagonal;
  }

  if (q.length < 1) {
    return [q, traverse_map];
  }
  // Executes a single step of the Breadth-first search.
  // Returns the quere and map in an array to be unpacked.
  current_tile = q.dequeue();

  connected_nodes = board.connectedTiles(current_tile, diagonal);

  for (const next_tile of connected_nodes) {

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

function dijkstra(board, config) {
  /* Dijkstra is a specific path-finding algorithm, that uses a cost   *
   * function to determine what node to search. This Algorithm is only *
   * more effective if each vertex has a weight representing the       *
   * difficulty of traversing that connection. Since here all vertex   *
   * have the same weight, then this basically becomes a more elegant  *
   * BFS */

  // This map will store the
  // Which set to traverse next.
  open_nodes = new Map();
  closed_nodes = new Map();
  dist_map = new Map();
  root_node = board.start_tile;
  end_node = board.end_tile;



  // Let's store the root node in the queue_map
  // In this map we store
  open_nodes.set(root_node.hash_key, {prev: null, dist: 0});
  s = new Set();
  s.add(root_node);
  dist_map.set(0, s);

  var interval = setInterval(function() {
    [open_nodes, closed_nodes, dist_map] = dijkstra_step(board, open_nodes, closed_nodes, dist_map, config)
    if (dist_map.size < 1) {
      clearInterval(interval);

      // search is complete! Now we only need to go back the traverse map
      // until we reach the start
      back_tile = closed_nodes.get(end_node.hash_key).prev;
      if (typeof(back_tile) !== 'undefined'){
        while (back_tile !== board.start_tile) {
          back_tile.state = 'path';
          back_tile = closed_nodes.get(back_tile.hash_key).prev;
        }
      }
    }
  }, 10);
}

function dijkstra_step(board, open_nodes, closed_nodes, dist_map, config) {
  // Default configuration
  var diagonal = false;
  if (typeof(config)!=='undefined') {
    diagonal = config.diagonal;
  }

  // Check that there's at least one object in our dist map
  if (!dist_map.size) {
    return [open_nodes, closed_nodes, dist_map];
  }
  // 1) Get the node with the minimum distance from the open nodes
  min_dist = Math.min(...[...dist_map.keys()]);
  current_node = dist_map.get(min_dist).values().next().value;
  // Remove this node from the set
  dist_map.get(min_dist).delete(current_node);
  if (!dist_map.get(min_dist).size) {
    // this distance is empty. remove it
    dist_map.delete(min_dist);
  }

  // Lets consider this node as closed (traversed)
  current_cost = open_nodes.get(current_node.hash_key);

  // Check if this node is in fact open
  if (typeof(current_cost) === 'undefined') {
    return [open_nodes, closed_nodes, dist_map];
  }

  // Close this node and set as traversed
  open_nodes.delete(current_node.hash_key);
  closed_nodes.set(current_node.hash_key, current_cost);
  if (current_node.state != 'start' && current_node.state != 'end') current_node.state = 'traversed';

  if (current_node.state === 'end') {
    // Found it! empty the distances map to trigger an end to the search algorithm;
    dist_map = new Map();
    return [open_nodes, closed_nodes, dist_map];
  }

  connected_nodes = board.connectedTiles(current_node, diagonal);

  for (const next_node of connected_nodes) {
    if (typeof(closed_nodes.get(next_node.hash_key)) !== 'undefined') {
      // Already traversed, ignore.
      continue;
    }

    dist = current_node.distance(next_node, config.heuristic) + current_cost.dist;

    // Now that we know the distance from the starting node, let's see if
    // this is a better path. If so, update our maps
    cost = open_nodes.get(next_node.hash_key);
    if (typeof(cost) !== 'undefined') {
      if (cost.dist < dist) {
        // Not a better path. continue
        continue;
      }
      dist_map.get(cost.dist).delete(next_node.hash_key);
    }
    // Let's open this node for later possible traversal
    open_nodes.set(next_node.hash_key, {prev: current_node, dist: dist});

    // Let's store this node in the dist_map
    if (dist_map.has(dist)) {
      dist_map.get(dist).add(next_node);
    } else {
      s = new Set();
      s.add(next_node);
      dist_map.set(dist, s);
    }
    // Display the node as queued
    if (next_node.state != 'start' && next_node.state != 'end') next_node.state = 'queued';
  }
  return [open_nodes, closed_nodes, dist_map];
}

function a_star(board, config) {
  /* A* is an algorithm that's very similar to Dijsktra's one. But,    *
   * it takes advantage of the fact that in some scenarios we can      *
   * evaluate each tile not only by the distance to the start node,    *
   * but also by it's approximate distance to the end node. Since some *
   * scenarios have access to the end's coordinates, it becomes much   *
   * more efficient, since it prioritizes tiles that are closer to the *
   * end node */

  // This map will store the
  // Which set to traverse next.
  open_nodes = new Map();
  closed_nodes = new Map();
  dist_map = new Map();
  root_node = board.start_tile;
  end_node = board.end_tile;

  start_dist = root_node.distance(end_node, config.heuristic);

  // Let's store the root node in the queue_map
  // In this map we store
  open_nodes.set(root_node.hash_key, {prev: null, dist: start_dist});
  s = new Set();
  s.add(root_node);
  dist_map.set(start_dist, s);
  console.log(dist_map);

  var interval = setInterval(function() {
    // Notice that this algorithm requires access to the end node to measure distance from it
    [open_nodes, closed_nodes, dist_map] = a_star_step(board, end_node, open_nodes, closed_nodes, dist_map, config)
    if (dist_map.size < 1) {
      clearInterval(interval);

      // search is complete! Now we only need to go back the traverse map
      // until we reach the start
      back_tile = closed_nodes.get(end_node.hash_key).prev;
      if (typeof(back_tile) !== 'undefined'){
        while (back_tile !== board.start_tile) {
          back_tile.state = 'path';
          back_tile = closed_nodes.get(back_tile.hash_key).prev;
        }
      }
    }
  }, 10);
}

function a_star_step(board, end_node, open_nodes, closed_nodes, dist_map, config) {
  // Default configuration
  var diagonal = false;
  if (typeof(config)!=='undefined') {
    diagonal = config.diagonal;
  }


  // Check that there's at least one object in our dist map
  if (!dist_map.size) {
    return [open_nodes, closed_nodes, dist_map];
  }
  // 1) Get the node with the minimum distance from the open nodes
  min_dist = Math.min(...[...dist_map.keys()]);
  current_node = dist_map.get(min_dist).values().next().value;
  // Remove this node from the set
  dist_map.get(min_dist).delete(current_node);
  if (!dist_map.get(min_dist).size) {
    // this distance is empty. remove it
    dist_map.delete(min_dist);
  }

  // Lets consider this node as closed (traversed)
  current_cost = open_nodes.get(current_node.hash_key);

  // Check if this node is in fact open
  if (typeof(current_cost) === 'undefined') {
    return [open_nodes, closed_nodes, dist_map];
  }

  // Close this node and set as traversed
  open_nodes.delete(current_node.hash_key);
  closed_nodes.set(current_node.hash_key, current_cost);
  if (current_node.state != 'start' && current_node.state != 'end') current_node.state = 'traversed';

  if (current_node.state === 'end') {
    // Found it! empty the distances map to trigger an end to the search algorithm;
    dist_map = new Map();
    return [open_nodes, closed_nodes, dist_map];
  }

  connected_nodes = board.connectedTiles(current_node, diagonal);

  for (const next_node of connected_nodes) {
    if (typeof(closed_nodes.get(next_node.hash_key)) !== 'undefined') {
      // Already traversed, ignore.
      continue;
    }

    // Get the distance from the current node to the end, current to next and next to end
    current_end_dist = current_node.distance(end_node, config.heuristic);
    current_next_dist = current_node.distance(next_node, config.heuristic);
    next_end_dist = next_node.distance(end_node, config.heuristic);

    // The total score of the tile is its distance to the actual node and the end node, plus the path cost
    dist = next_end_dist + current_next_dist - current_end_dist + current_cost.dist;


    // Now that we know the distance from the starting node, let's see if
    // this is a better path. If so, update our maps
    cost = open_nodes.get(next_node.hash_key);
    if (typeof(cost) !== 'undefined') {
      if (cost.dist < dist) {
        // Not a better path. continue
        continue;
      }
      dist_map.get(cost.dist).delete(next_node.hash_key);
    }
    // Let's open this node for later possible traversal
    open_nodes.set(next_node.hash_key, {prev: current_node, dist: dist});

    // Let's store this node in the dist_map
    if (dist_map.has(dist)) {
      dist_map.get(dist).add(next_node);
    } else {
      s = new Set();
      s.add(next_node);
      dist_map.set(dist, s);
    }
    // Display the node as queued
    if (next_node.state != 'start' && next_node.state != 'end') next_node.state = 'queued';
  }
  return [open_nodes, closed_nodes, dist_map];
}

///////// HEURISTICS ///////////
const heuristics = {
  "euclidean": euclidean,
  "manhattan": manhattan,
  "chebyshev": chebyshev,
}

function euclidean(node1, node2) {
  const delta_x = Math.abs(node1.x - node2.x);
  const delta_y = Math.abs(node1.y - node2.y);

  return Math.sqrt(delta_x**2 + delta_y**2);
}

function manhattan(node1, node2) {
  const delta_x = Math.abs(node1.x - node2.x);
  const delta_y = Math.abs(node1.y - node2.y);

  return delta_x + delta_y;
}

function chebyshev(node1, node2) {
  const delta_x = Math.abs(node1.x - node2.x);
  const delta_y = Math.abs(node1.y - node2.y);

  return Math.max(delta_x,delta_y);
}
