/**
 * DROPIX Store — interacciones livianas: sombra del header al scrollear, revelado de tarjetas
 * y aviso al agregar al carrito. Respeta prefers-reduced-motion.
 */
(function () {
	'use strict';

	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	var header = document.querySelector('.dpx-header');
	if (header) {
		var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	// Entrada escalonada de tarjetas de producto y colecciones.
	var items = document.querySelectorAll('.dpx-products > .dpx-card, .dpx-collections > .dpx-collection, ul.products > .dpx-card');
	if (!reduced && 'IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
			});
		}, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
		items.forEach(function (el, i) {
			el.classList.add('dpx-reveal');
			el.style.setProperty('--d', (i % 4) * 70 + 'ms');
			io.observe(el);
		});
	}

	function toast(msg) {
		var t = document.createElement('div');
		t.className = 'dpx-toast';
		t.setAttribute('role', 'status');
		t.innerHTML = '<span>' + msg + '</span><a href="' + ((window.wc_add_to_cart_params && window.wc_add_to_cart_params.cart_url) || '/carrito/') + '">Ver carrito</a>';
		document.body.appendChild(t);
		requestAnimationFrame(function () { t.classList.add('is-in'); });
		setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 400); }, 3200);
	}

	if (window.jQuery) {
		window.jQuery(document.body).on('added_to_cart', function (e, fragments, hash, $btn) {
			var card = $btn && $btn[0] ? $btn[0].closest('.dpx-card') : null;
			var title = card ? card.querySelector('.dpx-card__title') : null;
			toast((title ? title.textContent.trim() : 'Producto') + ' se agregó al carrito');
			document.querySelectorAll('.dpx-hcart').forEach(function (c) {
				c.classList.remove('dpx-bump'); void c.offsetWidth; c.classList.add('dpx-bump');
			});
		});
	}
})();
