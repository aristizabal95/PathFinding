var algorithm;
var config;

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
    }
  }
};

[algorithm, config] = selectAlgorithm("BFS");

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
  func = algo.function;
  conf = algo.config;
  return [func, conf];
}

document.addEventListener('input', function(e) {
  if (e.target.id === 'algorithms') {
    [algorithm, config] = selectAlgorithm(e.target.value);
    board.clearSearch();
  }
});
