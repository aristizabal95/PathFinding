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
    rect.setAttributeNS(null, 'fill', this.color);
    rect.setAttributeNS(null, 'stroke-width', 1);
    rect.setAttributeNS(null, 'stroke', '#444');
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
    const possible_states = Object.keys(this.states);
    if (possible_states.includes(state)) {
      this.tile_state = state;
      this.rect.setAttributeNS(null, 'fill', this.color);
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
    var r = this.numToHex(this.r);
    const state_color = {
      "clear": "#"+r+r+r,
      "filled": "#BBB",
      "start": "#33AA33",
      "end": "#CC0000",
      "queued": "#996633",
      "traversed": "#006699",
      "path": "#FFCC00"
    }
    return state_color;
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
}
