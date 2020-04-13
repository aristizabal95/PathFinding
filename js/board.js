class Board {
  constructor(svg_id, width, height, tile_size=16) {
    this.width = width;
    this.height = height;
    this.tile_size = tile_size;
    this.svg = this.generateSvg(svg_id);
    this.matrix = this.generateMatrix();
    this.setupListeners();
    this.interacting = false;
    this.action = "none";
    this.current_tile = null;
    [this.start_tile, this.end_tile] = this.setSpecialTiles(8);
  }

  get tile() {
    return this.current_tile;
  }

  set tile(new_tile) {
    if (!this.current_tile) {
      this.current_tile = new_tile;
    }
    switch(this.action) {
      case 'm_start':
        if (this.current_tile.state === 'end') return;
        if (new_tile.state !== 'clear') return;
        this.current_tile.state = 'clear';
        new_tile.state = 'start';
        this.start_tile = new_tile;
        break;
      case 'm_end':
        if (this.current_tile.state === 'start') return;
        if (new_tile.state !== 'clear') return;
        this.current_tile.state = 'clear';
        new_tile.state = 'end';
        this.end_tile = new_tile;
        break;
      case 'paint':
        if (new_tile.state === 'clear') {
          new_tile.state = 'filled';
        }
        break;
      case 'erase':
        if (new_tile.state === 'filled') {
          new_tile.state = 'clear';
        }
        break;
    }
    this.current_tile = new_tile;
  }

  generateSvg(id="board") {
    var el = document.createElementNS("http://www.w3.org/2000/svg" ,'svg');
    el.setAttributeNS(null, 'id', id);
    el.setAttributeNS(null, 'height', this.height);
    el.setAttributeNS(null, 'width', this.width);
    return el;
  }

  generateMatrix() {
    var cols = Math.ceil(this.width/this.tile_size);
    var rows = Math.ceil(this.height/this.tile_size);
    var matrix = [];

    for (const row of Array(rows).keys()) {
      var row_arr = [];
      for (const col of Array(cols).keys()) {
        var tile = new Tile(col*this.tile_size, row*this.tile_size, this.tile_size);
        this.svg.appendChild(tile.element);
        row_arr.push(tile);
      }
      matrix.push(row_arr);
    }
    return matrix;
  }

  setupListeners() {
    var board = this;
    this.svg.addEventListener('t_interaction_start', function(e) {
      board.interacting = true;
      const state_action = {
        'clear': 'paint',
        'filled': 'erase',
        'start': 'm_start',
        'end': 'm_end'
      };
      board.action = state_action[e.detail.tile.state];
      board.tile = e.detail.tile;
    });

    this.svg.addEventListener('t_interaction_end', function(e) {
      board.interacting = false;
      board.current_tile = null;
    });

    this.svg.addEventListener('t_enter', function(e) {
      if (board.interacting) {
        board.tile = e.detail.tile;
      }
    });
  }

  get shape() {
    return [this.matrix.length, this.matrix[0].length]
  }

  get element() {
    return this.svg;
  }

  setSpecialTiles(distance) {
    var center = this.shape.map(x => Math.round(x/2.0));
    var offset = Math.round(distance/2.0);
    var start_idx = [center[0], center[1]-offset];
    var end_idx = [center[0], center[1]+offset];
    var start_tile = this.matrix[start_idx[0]][start_idx[1]];
    var end_tile = this.matrix[end_idx[0]][end_idx[1]];

    start_tile.state = 'start';
    end_tile.state = 'end';
    return [start_tile, end_tile];
  }

  tilePosition(tile) {
    var flat_pos = this.matrix.flat().indexOf(tile);
    var row = -1;
    var col = -1;
    if (flat_pos >= 0) {
      row = Math.floor(flat_pos/this.shape[1]);
      col = flat_pos % this.shape[1];
    }
    return [row, col];
  }

  clearWalls() {
    var walls = this.matrix.flat().filter((tile) => tile.state === 'filled');
    walls.forEach(function(tile) {
      tile.state = 'clear';
    });
  }

  clearSearch() {
    var searched = this.matrix.flat().filter((tile) =>
      tile.state === 'traversed' ||
      tile.state === 'queued' ||
      tile.state === 'path');
    searched.forEach(function(tile) {
      tile.state = 'clear';
    });
  }

  connectedTiles(tile, diagonal=true) {
    var r_moves;
    var c_moves;
    if (diagonal) {
      r_moves = [-1,-1,-1,0,0,1,1,1];
      c_moves = [-1,0,1,-1,1,-1,0,1];
    } else {
      r_moves = [-1,0,0,1];
      c_moves = [0,-1,1,0];
    }

    var tile_pos = this.tilePosition(tile);
    var connected = [];

    for (const i of Array(r_moves.length).keys()) {
      var r_idx =  tile_pos[0] + r_moves[i];
      var c_idx = tile_pos[1] + c_moves[i];

      if (r_idx < 0 || c_idx < 0 || r_idx >= this.shape[0] || c_idx >= this.shape[1]) {
        // Ignore out of bound tiles
        continue;
      }

      const target = board.matrix[r_idx][c_idx];
      const adjacent_tiles = [board.matrix[tile_pos[0]][c_idx], board.matrix[r_idx][tile_pos[1]]];
      const adjacent_filled = adjacent_tiles.map((t) => t.state === 'filled');
      const blocked = adjacent_filled.reduce((a,b) => a*b);
      if (target.state == 'filled' || blocked) {
        continue;
      }
      connected.push(target);
    }
    return connected;
  }
}
