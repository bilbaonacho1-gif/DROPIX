# DROPIX — vidriera estática

Copia estática del sitio DROPIX (WordPress + Elementor + Pro Elements + WooCommerce), publicada en Vercel para poder verlo desde cualquier lugar.

- Se ven todas las páginas, el catálogo, las fichas flip 3D, las animaciones y el responsive.
- Carrito, checkout, cuenta y formularios necesitan el servidor de WordPress: en esta copia muestran un aviso (`dpx-static.js`).
- La tienda funcional es el sitio WordPress del proyecto (LocalWP: `dropix-2.local`).

Proyecto académico independiente — Diseño Multimedial, Plataformas de Desarrollo (Da Vinci, 2026). Sin afiliación con Valve Corporation ni con Counter-Strike 2.

## Cómo se regenera

El contenido se exporta desde el WordPress local con un script que recorre el sitio y reescribe las URLs `http://dropix-2.local` como rutas relativas a la raíz. Después: `git add -A && git commit && git push`, y Vercel publica solo.
