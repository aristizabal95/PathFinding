class Tile {
  constructor(x, y, size=16, state="clear") {
    this.x = x;
    this.y = y;
    this.size = size;
    this.r = Math.floor(Math.random()*22)
    this.tile_state = state;
    this.rect = this.generateElement();
    this.setupEvents();
  }

  get element() {
    return this.rect;
  }

  generateElement() {
    var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    rect.setAttributeNS(null, 'x', this.x);
    rect.setAttributeNS(null, 'y', this.y);
    rect.setAttributeNS(null, 'width', this.size);
    rect.setAttributeNS(null, 'height', this.size);
    rect.setAttributeNS(null, 'class', this.state);
    return rect;
  }

  setupEvents() {
    const useEventType = (typeof window.PointerEvent === 'function') ? 'pointer' : 'mouse';
    const start_listeners = ['mousedown', 'touchstart'];
    const end_listeners = ['mouseup', 'touchend'];
    const tile = this;

    // Throw an event anchoring the tile object to the desired interactions.
    start_listeners.map(function(eventType) {
      tile.rect.addEventListener(eventType, function(e) {
        e.preventDefault();
        tile.rect.dispatchEvent(new CustomEvent('t_interaction_start', {bubbles: true, detail: {tile: tile}}));
      });
    });

    end_listeners.map(function(eventType) {
      tile.rect.addEventListener(eventType, function(e) {
        e.preventDefault();
        tile.rect.dispatchEvent(new CustomEvent('t_interaction_end', {bubbles: true, detail: {tile: tile}}));
      });
    });

    tile.rect.addEventListener(`${useEventType}enter`, function(e) {
      e.preventDefault();
      tile.rect.dispatchEvent(new CustomEvent('t_enter', {bubbles: true, detail: {tile: tile}}))
    });

    tile.rect.addEventListener(`${useEventType}leave`, function(e) {
      e.preventDefault();
      tile.rect.dispatchEvent(new CustomEvent('t_leave', {bubbles: true, detail: {tile: tile}}))
    });
  }

  set state(state) {
    if (this.states.includes(state)) {
      this.tile_state = state;
      this.rect.setAttributeNS(null, 'class', this.tile_state);
    } else {
      this.tile_state = "clear";
    }
    return this.tile_state;
  }

  get state() {
    return this.tile_state;
  }

  get color() {
    var state = this.state;
    return this.states[state];
  }

  get states() {
    // var r = this.numToHex(this.r);
    const states = [
      "clear",
      "filled",
      "start",
      "end",
      "queued",
      "traversed",
      "path"
    ]
    return states
  }

  get hash_key() {
    return JSON.stringify({x: this.x, y: this.y});
  }

  numToHex(num) {
    var hex = Number(num).toString(16);
    if (hex.length < 2) {
      hex = "0"+hex;
    }
    return hex;
  }

  distance(tile, heuristic) {
    // takes as an input the second tile and a heuristic.
    // if no heuristic is given, defaults to euclidean.

    if (heuristic) {
      return heuristic(this, tile);
    }
    const delta_x = Math.abs(this.x - tile.x);
    const delta_y = Math.abs(this.y - tile.y);

    return Math.sqrt(delta_x**2 + delta_y**2);
  }
}
