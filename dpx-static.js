/**
 * DROPIX — modo vidriera (copia estática en Vercel).
 * La tienda real corre en WordPress + WooCommerce; acá las acciones que necesitan
 * servidor (carrito, checkout, login, formularios, búsqueda) muestran un aviso
 * en lugar de fallar en silencio.
 */
(function () {
	'use strict';

	var MSG = 'Esta es la vidriera estática de DROPIX. Carrito, checkout, cuenta y formularios funcionan en la versión WordPress + WooCommerce del proyecto.';

	function notice() {
		var old = document.querySelector('.dpx-static-notice');
		if (old) { old.remove(); }
		var t = document.createElement('div');
		t.className = 'dpx-toast dpx-static-notice is-in';
		t.setAttribute('role', 'status');
		t.innerHTML = '<span class="dpx-toast__icon">i</span><span>' + MSG + '</span>';
		document.body.appendChild(t);
		setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 400); }, 5200);
	}

	var BLOCK = '.add_to_cart_button, .single_add_to_cart_button, .dpx-buy, .moderncart-trigger-open, .elementor-menu-cart__toggle_button, a[href*="add-to-cart="], a[href$="/carrito/"], a[href$="/finalizar-compra/"], a[href*="/step/"]';

	document.addEventListener('click', function (e) {
		// Filtro por taxonomía de Elementor: sin servidor, lleva a la página de la categoría.
		var filter = e.target.closest('.e-filter-item');
		if (filter) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var slug = filter.getAttribute('data-filter');
			window.location.href = !slug || slug === '__all' ? '/tienda/' : '/product-category/' + slug + '/';
			return;
		}
		var el = e.target.closest(BLOCK);
		if (!el) { return; }
		// Las variantes llevan a la ficha del producto, que sí existe en la vidriera.
		if (el.classList.contains('dpx-buy') && !el.classList.contains('add_to_cart_button')) { return; }
		e.preventDefault();
		e.stopImmediatePropagation();
		notice();
	}, true);

	document.addEventListener('submit', function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		notice();
	}, true);

	// Cinta superior que identifica la vidriera.
	document.addEventListener('DOMContentLoaded', function () {
		var bar = document.createElement('div');
		bar.className = 'dpx-static-bar';
		bar.textContent = 'Vidriera estática · Proyecto académico DROPIX';
		document.body.appendChild(bar);
	});

	var css = document.createElement('style');
	css.textContent = '.dpx-static-bar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9998;padding:8px 14px;border-radius:999px;background:rgba(8,8,8,.85);border:1px solid rgba(77,163,255,.35);color:#4da3ff;font:600 11px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;backdrop-filter:blur(8px);pointer-events:none}.dpx-static-notice{max-width:420px}@media(max-width:767px){.dpx-static-bar{bottom:auto;top:calc(var(--dpx-header-h,64px) + 8px);font-size:9.5px;white-space:nowrap}}';
	document.head.appendChild(css);
})();
