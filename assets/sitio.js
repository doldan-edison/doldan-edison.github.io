// En pantallas grandes el juego se abre dentro de la página; en el celular el enlace lo abre a pantalla completa.
(function () {
  var enlace = document.querySelector('.escenario .jugar');
  if (!enlace) return;
  var escenario = enlace.closest('.escenario');
  var barra = document.querySelector('.bajo-juego .controles');
  var grande = window.matchMedia('(min-width: 900px) and (pointer: fine)');

  enlace.addEventListener('click', function (ev) {
    if (!grande.matches || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
    ev.preventDefault();
    var marco = document.createElement('iframe');
    marco.src = enlace.href;
    marco.title = enlace.getAttribute('data-titulo') || 'Juego';
    marco.allow = 'fullscreen; autoplay';
    escenario.textContent = '';
    escenario.appendChild(marco);
    marco.addEventListener('load', function () { marco.focus(); });
    if (barra) barra.hidden = false;
  });

  var completa = document.querySelector('[data-pantalla-completa]');
  if (completa) completa.addEventListener('click', function () {
    var marco = escenario.querySelector('iframe');
    if (marco && marco.requestFullscreen) marco.requestFullscreen().then(function () { marco.focus(); });
  });
})();
