/* ═══════════════════════════════════════════════════════════════════════════
 *
 *   APP  —  renders content.js into the page, then wires the interactions.
 *
 *   You don't need to edit this file. All of the text, projects, jobs and
 *   links come from content.js.
 *
 *   Contents:
 *     1. Helpers
 *     2. Render — profile, about, experience, work, stack, education, contact
 *     3. Nav — sticky bar, scroll progress, overlay menu, active section
 *     4. Hero — name headline, decode effect, live clock
 *     5. Work index — sibling dimming + cursor-trailing preview
 *     6. Scroll reveals
 *     7. Pixel field — reactive phosphor-grid background
 *
 * ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SITE = window.SITE;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 1 · Helpers ──────────────────────────────────────────────────────── */

    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    };

    // Clone a <template> and hand back its first element.
    function tpl(id) {
        var node = document.getElementById(id);
        return node ? node.content.firstElementChild.cloneNode(true) : null;
    }

    // Set text only when there is something to set, so the HTML fallback
    // survives if a content.js key is missing.
    function text(el, value) {
        if (el && value != null && value !== '') el.textContent = value;
    }

    // Fill every [data-bind="key"] in the document from a flat map.
    function bind(map) {
        Object.keys(map).forEach(function (key) {
            $$('[data-bind="' + key + '"]').forEach(function (el) {
                text(el, map[key]);
            });
        });
    }


    /* ── 2 · Render ───────────────────────────────────────────────────────── */

    function renderProfile(p) {
        if (!p) return;

        if (p.name) document.title = p.name.split(' ').slice(-2).join(' ') + ' — ' + (p.role || 'Portfolio');

        // Headline. [[word]] marks the accent word.
        if (Array.isArray(p.headline) && p.headline.length) {
            var h1 = $('#heroName');
            h1.innerHTML = '';
            p.headline.forEach(function (line) {
                var outer = document.createElement('span');
                outer.className = 'line';
                var inner = document.createElement('span');
                inner.className = 'line-in';

                // Split on [[...]] and wrap the marked run in <em>.
                line.split(/(\[\[[^\]]*\]\])/).forEach(function (part) {
                    if (!part) return;
                    if (part.indexOf('[[') === 0) {
                        var em = document.createElement('em');
                        em.textContent = part.slice(2, -2);
                        inner.appendChild(em);
                    } else {
                        inner.appendChild(document.createTextNode(part));
                    }
                });

                outer.appendChild(inner);
                h1.appendChild(outer);
            });
        }

        // Availability pill
        var status = $('#status');
        if (status) status.setAttribute('data-state', p.available ? 'on' : 'off');

        // CV button — removed entirely when no URL is given
        var cv = $('#heroCv');
        if (cv) {
            if (p.cvUrl) cv.href = p.cvUrl;
            else cv.remove();
        }

        // Contact links
        var email = $('#contactEmail');
        if (email && p.email) email.href = 'mailto:' + p.email;

        var phone = $('#contactPhone');
        if (phone) {
            if (p.phone) phone.href = 'tel:' + p.phone.replace(/[^\d+]/g, '');
            else phone.remove();
        }

        var wa = $('#whatsapp');
        if (wa) {
            if (p.whatsapp) wa.href = 'https://wa.me/' + p.whatsapp;
            else wa.remove();
        }

        bind({
            role: p.role,
            location: p.location,
            availableLabel: p.availableLabel,
            cvLabel: p.cvLabel,
            email: p.email,
            phone: p.phone
        });
    }

    function renderAbout(a) {
        if (!a) return;
        bind({ aboutLead: a.lead, aboutBody: a.body });

        var list = $('#facts');
        if (!list || !Array.isArray(a.facts)) return;
        list.innerHTML = '';

        a.facts.forEach(function (fact) {
            var node = tpl('tpl-fact');
            text($('dt', node), fact.label);
            text($('dd', node), fact.value);
            list.appendChild(node);
        });
    }

    // Experience and Education share the row template.
    function renderRows(listId, items, map) {
        var list = document.getElementById(listId);
        if (!list || !Array.isArray(items)) return;
        list.innerHTML = '';

        items.forEach(function (item, i) {
            var node = tpl('tpl-row');
            node.style.setProperty('--d', (i * 80) + 'ms');

            text($('.row-period', node), map.period(item));
            text($('.row-title', node), map.title(item));
            text($('.row-org', node), map.org(item));

            var points = map.points(item);
            var ul = $('.row-points', node);
            if (Array.isArray(points) && points.length) {
                points.forEach(function (point) {
                    var li = document.createElement('li');
                    li.textContent = point;
                    ul.appendChild(li);
                });
            } else {
                ul.remove();
            }

            list.appendChild(node);
        });
    }

    function renderWork(projects) {
        var list = $('#workList');
        if (!list || !Array.isArray(projects)) return;
        list.innerHTML = '';

        projects.forEach(function (project, i) {
            var node = tpl('tpl-work');
            node.style.setProperty('--d', (i * 70) + 'ms');

            var index = String(i + 1).padStart(2, '0');
            text($('.work-index', node), index);
            text($('.work-title', node), project.title);
            text($('.work-year', node), project.year);
            text($('.work-blurb', node), project.blurb);

            if (Array.isArray(project.stack)) {
                text($('.work-stack', node), project.stack.join(' · '));
            }

            // The row itself points at the first link, so the whole row is
            // clickable. With no links it becomes an inert element.
            var primary = (project.links || [])[0];
            var row = $('.work-row', node);
            if (primary) {
                row.href = primary.href;
                row.setAttribute('aria-label', project.title + ' — ' + primary.label);
            } else {
                row.removeAttribute('href');
                row.removeAttribute('target');
                $('.work-arrow', node).remove();
            }

            var thumb = $('.work-thumb', node);
            if (project.image) {
                thumb.src = project.image;
                thumb.setAttribute('data-preview', project.image);
                node.setAttribute('data-preview', project.image);
            } else {
                thumb.remove();
            }

            var links = $('.work-links', node);
            (project.links || []).forEach(function (link) {
                var a = document.createElement('a');
                a.href = link.href;
                a.target = '_blank';
                a.rel = 'noopener';
                a.textContent = link.label;
                links.appendChild(a);
            });

            list.appendChild(node);
        });
    }

    function renderStack(groups) {
        var wrap = $('#stackList');
        if (!wrap || !Array.isArray(groups)) return;
        wrap.innerHTML = '';

        groups.forEach(function (group, i) {
            var node = tpl('tpl-stack-group');
            node.style.setProperty('--d', (i * 90) + 'ms');
            text($('.stack-label', node), group.group);

            var ul = $('.stack-items', node);
            (group.items || []).forEach(function (item) {
                var li = tpl('tpl-stack-item');
                var img = $('img', li);
                img.src = item.icon;
                img.alt = '';
                text($('span', li), item.name);
                ul.appendChild(li);
            });

            wrap.appendChild(node);
        });
    }

    function renderSocials(socials) {
        var nav = $('#socials');
        if (!nav || !Array.isArray(socials)) return;
        nav.innerHTML = '';

        socials.forEach(function (social) {
            var a = document.createElement('a');
            a.href = social.href;
            a.target = '_blank';
            a.rel = 'noopener';

            if (social.icon) {
                var icon = document.createElement('i');
                icon.className = social.icon;
                icon.setAttribute('aria-hidden', 'true');
                a.appendChild(icon);
            }

            a.appendChild(document.createTextNode(social.label));
            nav.appendChild(a);
        });
    }

    function render() {
        if (!SITE) return;   // No content.js? Leave the HTML fallback alone.

        renderProfile(SITE.profile);
        renderAbout(SITE.about);

        renderRows('experienceList', SITE.experience, {
            period: function (x) { return x.period; },
            title: function (x) { return x.title; },
            org: function (x) { return x.org; },
            points: function (x) { return x.points; }
        });

        renderRows('educationList', SITE.education, {
            period: function (x) { return x.period; },
            title: function (x) { return x.degree; },
            org: function (x) { return x.school; },
            points: function (x) { return x.detail ? [x.detail] : []; }
        });

        renderWork(SITE.projects);
        renderStack(SITE.stack);
        renderSocials(SITE.socials);

        if (SITE.footer) {
            bind({ footerNote: SITE.footer.note, footerCredit: SITE.footer.credit });
        }
    }


    /* ── 3 · Nav ──────────────────────────────────────────────────────────── */

    function initNav() {
        var nav = $('#nav');
        var progress = $('#navProgress');
        var toggle = $('#navToggle');
        var overlay = $('#navOverlay');

        // Sticky treatment + scroll progress, batched into one rAF.
        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var y = window.scrollY;
                nav.classList.toggle('is-stuck', y > 40);

                var max = document.documentElement.scrollHeight - window.innerHeight;
                var ratio = max > 0 ? Math.min(y / max, 1) : 0;
                progress.style.transform = 'scaleX(' + ratio + ')';

                ticking = false;
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Overlay menu
        $$('a', overlay).forEach(function (a, i) { a.style.setProperty('--i', i); });

        function setMenu(open) {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            document.body.style.overflow = open ? 'hidden' : '';

            if (open) {
                overlay.hidden = false;
                requestAnimationFrame(function () { overlay.classList.add('is-open'); });
            } else {
                overlay.classList.remove('is-open');
                // Wait out the fade before pulling it from the a11y tree.
                setTimeout(function () {
                    if (toggle.getAttribute('aria-expanded') === 'false') overlay.hidden = true;
                }, reduceMotion ? 0 : 400);
            }
        }

        toggle.addEventListener('click', function () {
            setMenu(toggle.getAttribute('aria-expanded') !== 'true');
        });

        $$('a', overlay).forEach(function (a) {
            a.addEventListener('click', function () { setMenu(false); });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setMenu(false);
                toggle.focus();
            }
        });

        // Close the overlay if the viewport grows past the mobile breakpoint.
        window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
            if (e.matches && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
        });

        // Active section marker. rootMargin pins the "current" band to the
        // upper third of the viewport so the highlight changes when a section
        // reaches reading position, not when it first peeks in.
        var links = $$('.nav-links a');
        var sections = links
            .map(function (a) { return document.querySelector(a.getAttribute('href')); })
            .filter(Boolean);

        if (!sections.length) return;

        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) {
                    var on = a.getAttribute('href') === '#' + entry.target.id;
                    a.classList.toggle('is-active', on);
                    if (on) a.setAttribute('aria-current', 'true');
                    else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        sections.forEach(function (s) { spy.observe(s); });
    }


    /* ── 4 · Hero ─────────────────────────────────────────────────────────── */

    // One-time decode of the role line. Each character lands in sequence
    // while the ones ahead of it churn through glyphs.
    function initScramble() {
        var el = $('#heroRole');
        if (!el) return;

        var target = el.textContent.trim();
        if (!target) return;

        if (reduceMotion) { el.textContent = target; return; }

        var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*#%$';
        var chars = target.split('');
        var revealed = 0;
        var frame = 0;

        el.textContent = '';

        var timer = setInterval(function () {
            frame++;

            // Settle roughly one character every two frames.
            if (frame % 2 === 0) revealed++;

            var out = chars.map(function (ch, i) {
                if (i < revealed || ch === ' ') return ch;
                return glyphs[Math.floor(Math.random() * glyphs.length)];
            }).join('');

            el.textContent = out;

            if (revealed >= chars.length) {
                clearInterval(timer);
                el.textContent = target;
            }
        }, 28);
    }

    // Live clock in the profile's timezone.
    function initClock() {
        var out = $('#clockTime');
        if (!out) return;

        var zone = (SITE && SITE.profile && SITE.profile.timezone) || undefined;
        var formatter;

        try {
            formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: zone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch (err) {
            // Bad timezone string in content.js — fall back to local time
            // rather than leaving the clock stuck on dashes.
            formatter = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
        }

        function tick() { out.textContent = formatter.format(new Date()); }
        tick();
        setInterval(tick, 1000);
    }


    /* ── 5 · Work index ───────────────────────────────────────────────────── */

    function initWork() {
        var list = $('#workList');
        var preview = $('#workPreview');
        var img = $('#workPreviewImg');
        if (!list) return;

        var items = $$('.work-item', list);
        if (!items.length) return;

        // Hover / focus state drives both the sibling dimming and the drawer.
        function activate(item) {
            items.forEach(function (other) { other.classList.toggle('is-hovered', other === item); });
            list.classList.toggle('is-hovering', !!item);
        }

        items.forEach(function (item) {
            item.addEventListener('mouseenter', function () {
                activate(item);
                var src = item.getAttribute('data-preview');
                if (src && preview && !desktopOff()) {
                    img.src = src;
                    preview.classList.add('is-visible');
                }
            });

            item.addEventListener('mouseleave', function () {
                activate(null);
                if (preview) preview.classList.remove('is-visible');
            });

            // Keyboard parity: focusing a row opens the same drawer.
            item.addEventListener('focusin', function () { activate(item); });
            item.addEventListener('focusout', function (e) {
                if (!item.contains(e.relatedTarget)) activate(null);
            });
        });

        if (!preview) return;

        function desktopOff() {
            return reduceMotion || window.matchMedia('(max-width: 900px)').matches;
        }

        // Eased trail. Target is the raw pointer, current lags behind it, so
        // the panel drifts into place instead of snapping.
        var targetX = 0, targetY = 0, curX = 0, curY = 0, running = false;

        window.addEventListener('mousemove', function (e) {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!running && !desktopOff()) { running = true; requestAnimationFrame(loop); }
        }, { passive: true });

        function loop() {
            curX += (targetX - curX) * 0.12;
            curY += (targetY - curY) * 0.12;

            var visible = preview.classList.contains('is-visible');
            var scale = visible ? 1 : 0.9;

            preview.style.transform =
                'translate3d(' + (curX + 28) + 'px,' + (curY - 100) + 'px, 0) scale(' + scale + ')';

            // Idle out once the panel is hidden and has caught up, so we're not
            // holding a rAF loop open for the life of the page.
            var settled = Math.abs(targetX - curX) < 0.5 && Math.abs(targetY - curY) < 0.5;
            if (!visible && settled) { running = false; return; }

            requestAnimationFrame(loop);
        }
    }


    /* ── 6 · Scroll reveals ───────────────────────────────────────────────── */

    function initReveals() {
        var targets = $$('.reveal');
        if (!targets.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            targets.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);   // fire once, never replay
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        targets.forEach(function (el) { io.observe(el); });
    }


    /* ── 7 · Pixel field ──────────────────────────────────────────────────── */

    // A fine mesh of squares covering the whole viewport, dark and inert
    // until the cursor sweeps across it — each cell then glows and decays
    // like phosphor on an old CRT. A click sends a ring pulse through the
    // grid. This is the site's own name made literal: Graphite & Phosphor.
    //
    // Colour comes from the live --accent / --accent-pale custom properties,
    // read once at startup, so retuning the palette retunes this for free.
    function initPixelField() {
        var canvas = document.getElementById('pixelField');
        if (!canvas || !canvas.getContext) return;
        if (reduceMotion) return;   // the static dot grid still gives texture

        var ctx = canvas.getContext('2d', { alpha: true });
        var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        var tokens = getComputedStyle(document.documentElement);
        var trailColor = hexToRgb(tokens.getPropertyValue('--accent')) || { r: 156, g: 220, b: 255 };
        var crestColor = hexToRgb(tokens.getPropertyValue('--accent-pale')) || trailColor;

        var CELL = 8;           // grid pitch, in CSS px
        var DRAW = 5;           // square drawn per cell — smaller than CELL leaves a gap
        var REACH = 11;         // cursor influence radius, in cells
        var DECAY = 0.90;       // brightness kept each frame — the "afterglow"
        var EPSILON = 0.01;
        var RIPPLE_LIFE = 0.6;  // seconds a click pulse lives for
        var RIPPLE_SPEED = 560; // px/sec it expands at — life × speed caps its reach

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var cols = 0, rows = 0, cells = null, w = 0, h = 0;

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            cols = Math.ceil(w / CELL) + 1;
            rows = Math.ceil(h / CELL) + 1;
            cells = new Float32Array(cols * rows);
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();

        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });

        // The pointer position is only recorded here; it gets "stamped" into
        // the grid once per animation frame below, so a burst of mousemove
        // events never costs more than an ordinary frame does.
        var pointerX = 0, pointerY = 0, hasPointer = false;

        if (fine) {
            window.addEventListener('mousemove', function (e) {
                pointerX = e.clientX;
                pointerY = e.clientY;
                hasPointer = true;
            }, { passive: true });

            window.addEventListener('mouseleave', function () { hasPointer = false; });
        }

        // A short-lived expanding pulse per click or tap — capped so a
        // flurry of clicks can't pile up unbounded work. Skipped when the
        // click lands on an actual control, so it never competes with the
        // feedback a link or button already gives.
        var ripples = [];
        window.addEventListener('pointerdown', function (e) {
            if (e.target.closest && e.target.closest('a, button, input, textarea, select')) return;
            if (ripples.length > 5) ripples.shift();
            ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
        }, { passive: true });

        // Raise brightness in a soft-edged disc around (cx, cy). Only the
        // cells inside the disc's bounding box are ever touched.
        function stamp(cx, cy, radiusCells, amount) {
            var minCol = Math.max(0, Math.floor(cx / CELL) - radiusCells);
            var maxCol = Math.min(cols - 1, Math.ceil(cx / CELL) + radiusCells);
            var minRow = Math.max(0, Math.floor(cy / CELL) - radiusCells);
            var maxRow = Math.min(rows - 1, Math.ceil(cy / CELL) + radiusCells);
            var reachPx = radiusCells * CELL;

            for (var ry = minRow; ry <= maxRow; ry++) {
                for (var rx = minCol; rx <= maxCol; rx++) {
                    var dx = (rx * CELL + CELL / 2) - cx;
                    var dy = (ry * CELL + CELL / 2) - cy;
                    var falloff = 1 - Math.sqrt(dx * dx + dy * dy) / reachPx;
                    if (falloff <= 0) continue;

                    var idx = ry * cols + rx;
                    var v = cells[idx] + falloff * falloff * amount;
                    cells[idx] = v > 1 ? 1 : v;
                }
            }
        }

        // Raise brightness in a thin ring — the expanding-pulse shape.
        function stampRing(cx, cy, radius, band, amount) {
            var minCol = Math.max(0, Math.floor((cx - radius - band) / CELL));
            var maxCol = Math.min(cols - 1, Math.ceil((cx + radius + band) / CELL));
            var minRow = Math.max(0, Math.floor((cy - radius - band) / CELL));
            var maxRow = Math.min(rows - 1, Math.ceil((cy + radius + band) / CELL));

            for (var ry = minRow; ry <= maxRow; ry++) {
                for (var rx = minCol; rx <= maxCol; rx++) {
                    var dx = (rx * CELL + CELL / 2) - cx;
                    var dy = (ry * CELL + CELL / 2) - cy;
                    var d = Math.abs(Math.sqrt(dx * dx + dy * dy) - radius);
                    if (d > band) continue;

                    var idx = ry * cols + rx;
                    var v = cells[idx] + (1 - d / band) * amount;
                    cells[idx] = v > 1 ? 1 : v;
                }
            }
        }

        // A sparse, slow flicker so the grid feels alive even at rest —
        // a handful of cells per tick, never a full sweep.
        var lastTwinkle = 0;
        function twinkle() {
            for (var i = 0; i < 3; i++) {
                var idx = (Math.random() * cells.length) | 0;
                cells[idx] = Math.max(cells[idx], Math.random() * 0.3);
            }
        }

        var running = true;
        document.addEventListener('visibilitychange', function () {
            running = !document.hidden;
            if (running) requestAnimationFrame(frame);
        });

        function frame(now) {
            if (!running) return;

            if (hasPointer) stamp(pointerX, pointerY, REACH, 0.55);

            if (now - lastTwinkle > 220) {
                twinkle();
                lastTwinkle = now;
            }

            for (var i = ripples.length - 1; i >= 0; i--) {
                var r = ripples[i];
                var age = (now - r.t0) / 1000;
                if (age > RIPPLE_LIFE) { ripples.splice(i, 1); continue; }
                stampRing(r.x, r.y, age * RIPPLE_SPEED, 20, (1 - age / RIPPLE_LIFE) * 0.72);
            }

            ctx.clearRect(0, 0, w, h);

            for (var idx = 0; idx < cells.length; idx++) {
                var v = cells[idx];
                if (v <= EPSILON) continue;

                var col = idx % cols;
                var row = (idx / cols) | 0;
                var c = v > 0.7 ? crestColor : trailColor;

                ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (v * 0.5).toFixed(3) + ')';
                ctx.fillRect(col * CELL + (CELL - DRAW) / 2, row * CELL + (CELL - DRAW) / 2, DRAW, DRAW);

                cells[idx] = v * DECAY;
            }

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }

    function hexToRgb(hex) {
        var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').trim());
        return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
    }


    /* ── Boot ─────────────────────────────────────────────────────────────── */

    function boot() {
        render();        // content first, so everything below sees real nodes
        initNav();
        initScramble();
        initClock();
        initWork();
        initReveals();
        initPixelField();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
