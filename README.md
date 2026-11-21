# Escuadrón Juegos

Sitio que junta los dos juegos (Escuadrón Antiplaga y Escuadrón Cacerola) con sus páginas de cómo jugar, las fuentes de la parodia, la política de privacidad y el contacto. Está pensado para pedir Google AdSense.

Los juegos no viven acá: siguen en sus propios repositorios y se abren en `/escuadron-antiplaga/` y `/escuadron-cacerola/`. Si este sitio se publica como sitio de usuario de GitHub Pages (repositorio `doldan-edison.github.io`), esas rutas quedan bajo la misma dirección, también con dominio propio.

## Cómo se arma

Las páginas se escriben en `fuente/` y se arman con:

```bash
node herramientas/armar.mjs
```

Eso escribe el HTML final en la raíz (`index.html`, `cacerola/`, `antiplaga/`, `fuentes/`, `privacidad/`, `acerca/`, `404.html`). **No edites esos archivos a mano**: se pisan cada vez que se arma.

- `fuente/plantilla.html`: cabecera, menú y pie de todas las páginas.
- `fuente/*.html`: una por página. Arriba lleva un bloque con `titulo`, `descripcion` y `ruta`.
- `fuente/partes/`: pedazos que se repiten (los carteles de los juegos).
- `assets/estilo.css`, `assets/sitio.js`, `assets/img/`.

## Lo que se configura en `config.json`

| Dato | Para qué | Ejemplo |
|---|---|---|
| `nombre` | Nombre del sitio en títulos y pie | `Escuadrón Juegos` |
| `url` | Dirección final. Genera `sitemap.xml`, las direcciones canónicas y el archivo `CNAME` del dominio | `https://midominio.com` |
| `adsense` | Identificador de editor de AdSense. Pone el código de Google en todas las páginas y genera `ads.txt` | `ca-pub-1234567890123456` |
| `contacto.correo` | Correo que se muestra en Acerca. Si está vacío se muestra el enlace de `contacto.url` | |

Después de cambiar algo, volvé a armar el sitio.

Con `adsense` vacío no se carga nada de Google Ads y la página de privacidad dice que todavía no hay anuncios. La página 404 nunca lleva anuncios.

## Verlo en la PC

```bash
node herramientas/servidor.mjs
```

Abre el sitio en http://127.0.0.1:8380/ y sirve los dos juegos desde sus carpetas vecinas (`../JuegoHormigas` y `../EscuadronCacerola`) en las mismas rutas que tienen publicados.

## La página de fuentes

`fuente/fuentes.html` relaciona cada chiste de la parodia con una nota de prensa. Cada dato fue leído en la nota enlazada. Si el caso cambia, hay que actualizar el texto y la fecha de «Última revisión». No agregar datos sin una nota que los respalde.
