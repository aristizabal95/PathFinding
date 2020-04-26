var alg;

alg = selectAlgorithm("BFS");

function toggleMenu() {
  var menu = document.getElementById('fixed-menu');
  var toggleIcon = document.getElementById('toggle-icon');

  menu.classList.toggle('hidden');
  toggleIcon.classList.toggle('fa-chevron-right');
  toggleIcon.classList.toggle('fa-chevron-left');
  document.activeElement.blur();
}

function selectAlgorithm(name) {
  algo = algorithms_struct[name];
  return algo;
}

function setupAlgorithmConfig() {
    var config_el = document.getElementById('config');
    var diagonal = document.getElementById('diagonal');
    diagonal.checked = alg.config.diagonal;
    var heur_el = document.getElementById('heuristics');
    if (heur_el) {
      config_el.removeChild(heur_el);
    }
    if (alg.config.heuristic) {
      heur_el = generateHeuristics(alg.config.heuristic);
      config_el.appendChild(heur_el);
    }
}


function generateHeuristics(selected) {
  var container = document.createElement('div');
  container.setAttribute('id', 'heuristics');
  for (const heuristic in heuristics) {
    var heur_el = document.createElement('input');
    heur_el.setAttribute('type', 'radio');
    heur_el.setAttribute('value', heuristic);
    heur_el.setAttribute('name', 'heuristic');
    heur_el.setAttribute('onclick', `setHeuristic("${heuristic}")`)
    if (selected === heuristics[heuristic]) {
      heur_el.setAttribute('checked', 'checked');
    }
    container.appendChild(heur_el);

    var heur_text = document.createTextNode(heuristic);
    container.appendChild(heur_text);
    var br = document.createElement('br');
    container.appendChild(br);
  }
  return container;
}

function setHeuristic(value) {
  if (Object.keys(heuristics).includes(value)) {
    alg.config.heuristic = heuristics[value];
  }
}

function setDiagonal() {
  var diagonal = document.getElementById('diagonal');
  alg.config.diagonal = diagonal.checked;
}

document.addEventListener('input', function(e) {
  if (e.target.id === 'algorithms') {
    alg = selectAlgorithm(e.target.value);
    board.clearSearch();
    setupAlgorithmConfig();
  }
});
