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

document.addEventListener('input', function(e) {
  if (e.target.id === 'algorithms') {
    alg = selectAlgorithm(e.target.value);
    board.clearSearch();
  }
});
