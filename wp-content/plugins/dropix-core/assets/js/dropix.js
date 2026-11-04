/**
 * DROPIX — interacciones del sitio.
 * Header con estado al hacer scroll, parallax del hero, fichas flip, filtros,
 * revelado al hacer scroll, microinteracciones y aviso de carrito.
 */
(function () {
	'use strict';

	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	var root = document.documentElement;

	/* ---------- Pantalla de carga ---------- */
	function hideLoader() {
		var loader = document.querySelector('.dpx-loader');
		if (!loader) { return; }
		loader.classList.add('is-done');
		setTimeout(function () { loader.remove(); }, 700);
		root.classList.add('dpx-ready');
	}
	if (reduced) {
		hideLoader();
	} else {
		window.addEventListener('load', function () { setTimeout(hideLoader, 250); });
		setTimeout(hideLoader, 2200);
	}

	/* ---------- Header: transparente al inicio, sólido al scrollear, se oculta al bajar ---------- */
	var header = document.querySelector('.dpx-header');
	if (header) {
		var lastY = window.scrollY;
		var ticking = false;
		var onScroll = function () {
			var y = window.scrollY;
			header.classList.toggle('is-scrolled', y > 40);
			header.classList.toggle('is-hidden', y > 420 && y > lastY + 4 && !header.contains(document.activeElement));
			if (y < lastY - 4 || y < 420) { header.classList.remove('is-hidden'); }
			lastY = y;
			ticking = false;
		};
		window.addEventListener('scroll', function () {
			if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
		}, { passive: true });
		onScroll();
	}

	/* ---------- Buscador a pantalla completa ---------- */
	document.addEventListener('click', function (e) {
		var open = e.target.closest('[data-dpx-search]');
		var overlay = document.querySelector('.dpx-search-overlay');
		if (!overlay) { return; }
		if (open) {
			overlay.hidden = false;
			document.body.appendChild(overlay);
			setTimeout(function () { overlay.querySelector('input[type="search"]').focus(); }, 50);
		} else if (e.target.closest('.dpx-search-close') || e.target === overlay) {
			overlay.hidden = true;
		}
	});
	document.addEventListener('keydown', function (e) {
		var overlay = document.querySelector('.dpx-search-overlay');
		if (e.key === 'Escape' && overlay && !overlay.hidden) { overlay.hidden = true; }
	});

	/* ---------- Escena 3D del hero: reacciona al mouse ---------- */
	document.querySelectorAll('[data-dpx-scene]').forEach(function (scene) {
		if (reduced || !finePointer) { return; }
		var host = scene.closest('.dpx-hero') || scene;
		var layers = scene.querySelectorAll('[data-depth]');
		var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
		var step = function () {
			cx += (tx - cx) * 0.08;
			cy += (ty - cy) * 0.08;
			layers.forEach(function (el) {
				var d = parseFloat(el.getAttribute('data-depth')) || 1;
				el.style.setProperty('--px', (cx * d * 18).toFixed(2) + 'px');
				el.style.setProperty('--py', (cy * d * 14).toFixed(2) + 'px');
			});
			scene.style.setProperty('--rx', (cy * -6).toFixed(2) + 'deg');
			scene.style.setProperty('--ry', (cx * 8).toFixed(2) + 'deg');
			raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(step) : null;
		};
		host.addEventListener('pointermove', function (e) {
			var r = host.getBoundingClientRect();
			tx = (e.clientX - r.left) / r.width * 2 - 1;
			ty = (e.clientY - r.top) / r.height * 2 - 1;
			if (!raf) { raf = requestAnimationFrame(step); }
		});
		host.addEventListener('pointerleave', function () {
			tx = 0; ty = 0;
			if (!raf) { raf = requestAnimationFrame(step); }
		});
	});

	/* ---------- Fichas flip 3D ---------- */
	document.addEventListener('click', function (e) {
		var toggle = e.target.closest('.dpx-flip__toggle');
		var card = e.target.closest('.dpx-flip');
		if (!card) { return; }
		if (toggle) {
			e.preventDefault();
			card.classList.toggle('is-flipped');
			return;
		}
		// En pantallas táctiles un toque sobre la ficha la gira; los links y botones funcionan normal.
		if (!finePointer && !e.target.closest('a, button')) {
			card.classList.toggle('is-flipped');
		}
	});
	document.addEventListener('keydown', function (e) {
		if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('dpx-flip')) {
			e.preventDefault();
			e.target.classList.toggle('is-flipped');
		}
	});
	document.querySelectorAll('.dpx-flip').forEach(function (card) {
		card.setAttribute('tabindex', '0');
		if (reduced || !finePointer) { return; }
		card.addEventListener('pointermove', function (e) {
			var r = card.getBoundingClientRect();
			var x = (e.clientX - r.left) / r.width;
			var y = (e.clientY - r.top) / r.height;
			card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
			card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
			card.style.setProperty('--tx', ((x - 0.5) * 10).toFixed(2) + 'deg');
			card.style.setProperty('--ty', ((0.5 - y) * 10).toFixed(2) + 'deg');
		});
		card.addEventListener('pointerleave', function () {
			card.style.setProperty('--tx', '0deg');
			card.style.setProperty('--ty', '0deg');
		});
	});

	/* ---------- Filtros por categoría de las fichas ---------- */
	document.querySelectorAll('.dpx-chips').forEach(function (bar) {
		var grid = bar.nextElementSibling;
		bar.addEventListener('click', function (e) {
			var chip = e.target.closest('.dpx-chip');
			if (!chip || !grid) { return; }
			var f = chip.getAttribute('data-filter');
			bar.querySelectorAll('.dpx-chip').forEach(function (c) {
				c.classList.toggle('is-active', c === chip);
				c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
			});
			grid.querySelectorAll('.dpx-flip').forEach(function (card, i) {
				var show = !f || (' ' + card.getAttribute('data-cats') + ' ').indexOf(' ' + f + ' ') > -1;
				card.classList.toggle('is-filtered', !show);
				card.style.setProperty('--i', i);
			});
		});
	});

	/* ---------- Revelado al hacer scroll ---------- */
	var revealEls = document.querySelectorAll('.dpx-reveal, .dpx-flip-grid .dpx-flip, .dpx-strip__item, ul.products .dpx-loop-item');
	if (reduced || !('IntersectionObserver' in window)) {
		revealEls.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		revealEls.forEach(function (el, i) {
			if (!el.style.getPropertyValue('--d')) { el.style.setProperty('--d', (i % 4) * 80 + 'ms'); }
			el.classList.add('dpx-will-reveal');
			io.observe(el);
		});
	}

	/* ---------- Botones magnéticos ---------- */
	if (!reduced && finePointer) {
		document.querySelectorAll('.dpx-btn .elementor-button, .dpx-buy').forEach(function (btn) {
			btn.addEventListener('pointermove', function (e) {
				var r = btn.getBoundingClientRect();
				btn.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
				btn.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px');
				btn.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
			});
			btn.addEventListener('pointerleave', function () {
				btn.style.setProperty('--bx', '0px');
				btn.style.setProperty('--by', '0px');
			});
		});
	}

	/* ---------- Aviso al agregar al carrito (evento de WooCommerce) ---------- */
	function toast(msg) {
		var t = document.createElement('div');
		t.className = 'dpx-toast';
		t.setAttribute('role', 'status');
		t.innerHTML = '<span class="dpx-toast__icon">✓</span><span>' + msg + '</span><a href="' + (window.dpxCartUrl || '/carrito/') + '">Ver carrito</a>';
		document.body.appendChild(t);
		requestAnimationFrame(function () { t.classList.add('is-in'); });
		setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 400); }, 3200);
	}
	if (window.jQuery) {
		window.jQuery(document.body).on('added_to_cart', function (e, fragments, hash, $btn) {
			var card = $btn && $btn[0] ? $btn[0].closest('.dpx-flip') : null;
			var name = card ? card.querySelector('.dpx-flip__title').textContent.trim() : 'Producto';
			toast(name + ' agregado al carrito');
			document.querySelectorAll('.elementor-menu-cart__toggle, .dpx-cart-link').forEach(function (c) {
				c.classList.remove('dpx-bump'); void c.offsetWidth; c.classList.add('dpx-bump');
			});
		});
	}
})();
