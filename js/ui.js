function toggleMenu() {
  var menu = document.getElementById('fixed-menu');
  var toggleIcon = document.getElementById('toggle-icon');

  menu.classList.toggle('hidden');
  toggleIcon.classList.toggle('fa-chevron-right');
  toggleIcon.classList.toggle('fa-chevron-left');
  document.activeElement.blur();
}
