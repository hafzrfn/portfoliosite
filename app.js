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
 *     6b. Theme — dark/light toggle
 *     7. Pixel field — dithered wallpaper + reactive phosphor grid
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

        // Tab title uses the hero headline — that's the name people actually
        // see on the page. Falls back to the full legal name in `name`.
        var shortName = Array.isArray(p.headline) && p.headline.length
            ? p.headline.join(' ').replace(/\[\[|\]\]/g, '').trim()
            : p.name;
        if (shortName) document.title = shortName + ' — ' + (p.role || 'Portfolio');

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
        }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

        targets.forEach(function (el) { io.observe(el); });
    }


    /* ── 6b · Theme ───────────────────────────────────────────────────────── */

    // Dark by default. A stored choice wins; otherwise follow the OS. The
    // canvas reads its colours from CSS custom properties, so it listens for
    // the change event below and repaints rather than being told twice.
    function initTheme() {
        var btn = $('#themeToggle');
        var label = $('#themeLabel');
        var root = document.documentElement;
        var meta = $('meta[name="theme-color"]');

        var stored = null;
        try { stored = localStorage.getItem('theme'); } catch (err) { /* private mode */ }

        var light = stored
            ? stored === 'light'
            : window.matchMedia('(prefers-color-scheme: light)').matches;

        function apply(isLight, persist) {
            if (isLight) root.setAttribute('data-theme', 'light');
            else root.removeAttribute('data-theme');

            if (label) label.textContent = isLight ? 'Dark' : 'Light';
            if (btn) btn.setAttribute('aria-label', 'Switch to ' + (isLight ? 'dark' : 'light') + ' theme');
            if (meta) meta.setAttribute('content', isLight ? '#F3F5F8' : '#0A0B0D');

            if (persist) {
                try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (err) { }
            }

            window.dispatchEvent(new CustomEvent('themechange'));
        }

        apply(light, false);

        if (btn) {
            btn.addEventListener('click', function () {
                light = !light;
                apply(light, true);
            });
        }
    }


    /* ── 7 · Pixel field ──────────────────────────────────────────────────── */

    // A fine mesh of squares covering the whole viewport. Two things live on
    // it, both drawn as the same squares so the motif reads as one material:
    //
    //   · a dithered icy-blue wallpaper behind the landing page, which fades
    //     out to pure black as you scroll down into the site proper;
    //   · a reactive phosphor layer — the cursor leaves a glowing trail that
    //     decays like a CRT, and a click sends a pulse through the grid.
    //
    // Colour comes from the live --accent* custom properties, read once at
    // startup, so retuning the palette retunes all of this for free.
    //
    // Cost control, in rough order of how much each one saves:
    //
    //   · the loop SLEEPS. When nothing is lit, nothing is displaced and the
    //     wallpaper is scrolled out of view, the animation frame is cancelled
    //     outright rather than spinning on an empty grid. Most of the page is
    //     below the fold, so this is most of the time.
    //   · quality adapts. The renderer times its own work and, if it is over
    //     budget, coarsens the grid and drops the pixel ratio. Cost scales
    //     with cell count and with dpr², so one step down is a big saving on
    //     a slow device — and nothing changes on a fast one.
    //   · only live cells are visited. Lit and displaced cells are kept in
    //     index lists, so the per-frame work is proportional to what is
    //     actually moving rather than to the size of the grid.
    //   · fills are batched. Both layers group their cells by colour and draw
    //     one path per group, so fillStyle is set a handful of times a frame
    //     instead of once per cell. Parsing thousands of colour strings a
    //     frame is the classic way to make an effect like this crawl.
    function initPixelField() {
        var canvas = document.getElementById('pixelField');
        if (!canvas || !canvas.getContext) return;

        var ctx = canvas.getContext('2d', { alpha: true });
        var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        var trailColor, crestColor, deepColor;

        function readColors() {
            var t = getComputedStyle(document.documentElement);
            trailColor = hexToRgb(t.getPropertyValue('--accent')) || { r: 156, g: 220, b: 255 };
            crestColor = hexToRgb(t.getPropertyValue('--accent-pale')) || trailColor;
            deepColor = hexToRgb(t.getPropertyValue('--accent-deep')) || trailColor;
        }
        readColors();

        /* ── Quality ───────────────────────────────────────────────────────
           Three tiers. We start on one picked from what the device reports,
           then measure and step down if the work doesn't fit the budget.
           We never step back up — oscillating between tiers would be more
           distracting than simply running at the lower one. */

        var TIERS = [
            { cell: 8,  draw: 5, dpr: 2,   wallFps: 22, grabFps: 60 },
            { cell: 10, draw: 6, dpr: 1.5, wallFps: 20, grabFps: 45 },
            { cell: 13, draw: 8, dpr: 1,   wallFps: 15, grabFps: 30 }
        ];

        // These hints are a starting guess only, and a deliberately generous
        // one — plenty of capable machines report four cores, and starting
        // them on a coarser grid would cost visual quality for nothing. The
        // measured step-down below is the real safety net, so this only has
        // to catch the clearly-underpowered case.
        var cores = navigator.hardwareConcurrency || 4;
        var mem = navigator.deviceMemory || 4;
        var tier = (cores <= 2 || mem <= 2) ? 2
                 : (cores <= 4 && mem <= 4) ? 1
                 : 0;

        var CELL, DRAW, WALL_STEP, GRAB_STEP, dpr;

        function applyTier() {
            var t = TIERS[tier];
            CELL = t.cell;
            DRAW = t.draw;
            WALL_STEP = 1000 / t.wallFps;
            GRAB_STEP = 1000 / t.grabFps;
            dpr = Math.min(window.devicePixelRatio || 1, t.dpr);
        }
        applyTier();

        // Rolling average of our own work. Budget is deliberately well under
        // a 16.7ms frame — this layer is decoration and must never be the
        // reason the page stutters.
        var BUDGET = 5;
        var sampleSum = 0, sampleCount = 0;

        function sampleCost(ms) {
            if (tier >= TIERS.length - 1) return;
            sampleSum += ms;
            if (++sampleCount < 90) return;

            var mean = sampleSum / sampleCount;
            sampleSum = 0;
            sampleCount = 0;

            if (mean > BUDGET) {
                tier++;
                applyTier();
                resize();
            }
        }

        var REACH = 7;          // cursor influence radius, in cells
        var DECAY = 0.90;       // brightness kept each frame — the "afterglow"
        var EPSILON = 0.01;
        var RIPPLE_LIFE = 0.6;  // seconds a click pulse lives for
        var RIPPLE_SPEED = 560; // px/sec it expands at — life × speed caps its reach
        var BANDS = 5;          // quantisation steps in the wallpaper gradient
        var WALL_ALPHA = 0.62;  // wallpaper opacity at its brightest cell
        var FADE_OVER = 0.9;    // viewport-heights of scroll before it's fully black

        var PULL_RADIUS = 140;  // px the cursor's grab reaches into the wallpaper
        var PULL_MAX = 15;      // px a cell travels toward the cursor at most
        var SPRING = 0.11;      // how hard a cell is pulled to its target
        var DAMP = 0.83;        // velocity retained per step — higher wobbles longer

        var cols = 0, rows = 0, w = 0, h = 0;
        var resizeTimer;

        // Per-cell state.
        var cells = null;                       // trail brightness
        var dispX = null, dispY = null;         // grab offset from home
        var velX = null, velY = null;

        // Live-cell indices, so a frame costs what is moving rather than what
        // exists. The Uint8 flags keep pushes idempotent.
        var lit = [], isLit = null;
        var moving = [], isMoving = null;

        var anyDisp = false;

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            cols = Math.ceil(w / CELL) + 1;
            rows = Math.ceil(h / CELL) + 1;

            var n = cols * rows;
            cells = new Float32Array(n);
            dispX = new Float32Array(n);
            dispY = new Float32Array(n);
            velX = new Float32Array(n);
            velY = new Float32Array(n);
            isLit = new Uint8Array(n);
            isMoving = new Uint8Array(n);
            lit.length = 0;
            moving.length = 0;

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            sizeWallpaper();
            paintWallpaper(staticMode ? 0 : (window.performance ? performance.now() : 0));
            if (staticMode) paintStatic();
        }

        /* ── Wallpaper ─────────────────────────────────────────────────────
           A dithered icy-blue field, painted to an offscreen canvas a few
           times a second and composited every frame at a scroll-driven alpha.
           The waves are built as 1-D row/column tables once per repaint, so a
           cell costs a couple of multiplies rather than its own sin(). */

        var wall = document.createElement('canvas');
        var wctx = wall.getContext('2d');
        var lastWall = -1e9;

        var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

        var colA = null, colB = null, rowA = null, rowB = null;
        var buckets = [];
        var wallPalette = [];

        function wallpaperColor(v) {
            return v < 0.55
                ? mix(deepColor, trailColor, v / 0.55)
                : mix(trailColor, crestColor, (v - 0.55) / 0.45);
        }

        function sizeWallpaper() {
            wall.width = canvas.width;
            wall.height = canvas.height;
            wctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            colA = new Float32Array(cols);
            colB = new Float32Array(cols);
            rowA = new Float32Array(rows);
            rowB = new Float32Array(rows);

            buckets.length = 0;
            for (var b = 0; b <= BANDS; b++) buckets.push([]);

            wallPalette.length = 0;
            for (var p = 0; p <= BANDS; p++) {
                var v = p / BANDS;
                var c = wallpaperColor(v);
                wallPalette.push('rgba(' + c.r + ',' + c.g + ',' + c.b + ',' +
                    (v * WALL_ALPHA).toFixed(3) + ')');
            }
        }

        function paintWallpaper(ms) {
            wctx.clearRect(0, 0, w, h);

            var t = ms * 0.001;
            var cx = 0.86 + Math.sin(t * 0.11) * 0.10;
            var cy = 0.34 + Math.cos(t * 0.083) * 0.12;

            var i2;
            for (i2 = 0; i2 < cols; i2++) {
                colA[i2] = Math.sin(i2 * 0.045 + t * 0.62);
                colB[i2] = Math.sin(i2 * 0.019 - t * 0.34);
            }
            for (i2 = 0; i2 < rows; i2++) {
                rowA[i2] = Math.sin(i2 * 0.037 - t * 0.47);
                rowB[i2] = Math.sin(i2 * 0.016 + t * 0.28);
            }

            for (var z = 0; z <= BANDS; z++) buckets[z].length = 0;

            var offset = (CELL - DRAW) / 2;

            for (var row = 0; row < rows; row++) {
                var ny = (row * CELL + CELL / 2) / h;
                var fall = 1 - Math.pow(ny, 1.35);
                if (fall <= 0) continue;

                var ra = rowA[row], rb = rowB[row];
                var rowBase = row * cols;

                for (var col = 0; col < cols; col++) {
                    var nx = (col * CELL + CELL / 2) / w;

                    var dx = (nx - cx) * 0.92;
                    var dy = (ny - cy) * 1.45;
                    var bloom = 1 - Math.sqrt(dx * dx + dy * dy) / 0.80;
                    bloom = bloom > 0 ? bloom * bloom : 0;

                    var sweep = nx * nx * 0.3;
                    var wave = colA[col] * ra * 0.6 + colB[col] * rb * 0.4;

                    var i = (bloom + sweep) * fall * (0.78 + wave * 0.42);

                    var idx = rowBase + col;
                    var ox = dispX[idx], oy = dispY[idx];
                    if (ox !== 0 || oy !== 0) {
                        var mag = Math.sqrt(ox * ox + oy * oy) / PULL_MAX;
                        i += (mag > 1 ? 1 : mag) * 0.14;
                    }

                    if (i < 0.1) continue;
                    if (i > 1) i = 1;

                    var scaled = i * BANDS;
                    var band = scaled | 0;
                    if (scaled - band > BAYER[(row & 3) * 4 + (col & 3)] * 0.0625) band++;
                    if (band <= 0) continue;
                    if (band > BANDS) band = BANDS;

                    buckets[band].push(col * CELL + offset + ox, row * CELL + offset + oy);
                }
            }

            for (var f = 1; f <= BANDS; f++) {
                var pts = buckets[f];
                if (!pts.length) continue;
                wctx.fillStyle = wallPalette[f];
                wctx.beginPath();
                for (var k = 0; k < pts.length; k += 2) {
                    wctx.rect(pts[k], pts[k + 1], DRAW, DRAW);
                }
                wctx.fill();
            }
        }

        // 1 at the top of the page, 0 once the landing page is behind you.
        function wallpaperFade() {
            var t = window.scrollY / (h * FADE_OVER);
            return t >= 1 ? 0 : Math.pow(1 - t, 1.4);
        }

        function drawWallpaper(ms, fade) {
            if (fade <= 0.002) return;   // scrolled past — don't even repaint

            var step = anyDisp ? GRAB_STEP : WALL_STEP;
            if (ms - lastWall >= step) {
                paintWallpaper(ms);
                lastWall = ms;
            }

            ctx.globalAlpha = fade;
            ctx.drawImage(wall, 0, 0, w, h);
            ctx.globalAlpha = 1;
        }

        /* ── Grab ──────────────────────────────────────────────────────────
           Cells inside the cursor's reach are given a target offset pointing
           at it; everything else targets home. The same spring carries them
           both ways, so the grab and the release are one motion. */

        function pullTarget(col, row, px, py, out) {
            var ox = px - (col * CELL + CELL / 2);
            var oy = py - (row * CELL + CELL / 2);
            var d2 = ox * ox + oy * oy;

            if (d2 >= PULL_RADIUS * PULL_RADIUS) { out[0] = 0; out[1] = 0; return false; }

            var d = Math.sqrt(d2) || 1;
            var u = d / PULL_RADIUS;

            // u²(1-u)² leaves the pointer with zero slope and peaks at
            // mid-radius, so the same travel is spread over a wide ring
            // instead of compressing hardest at the centre. Keeps peak
            // density below the point where squares would overlap.
            var uu = u * (1 - u);
            var pull = PULL_MAX * 16 * uu * uu;

            out[0] = ox / d * pull;
            out[1] = oy / d * pull;
            return true;
        }

        var target = [0, 0];

        function stepDisplacement(fade) {
            var pulling = hasPointer && fade > 0.002;
            var px = pointerX, py = pointerY;

            // Enrol cells that have just come under the cursor. Already-active
            // ones are skipped here and handled by the integrate pass below.
            if (pulling) {
                var c0 = Math.max(0, Math.floor((px - PULL_RADIUS) / CELL));
                var c1 = Math.min(cols - 1, Math.ceil((px + PULL_RADIUS) / CELL));
                var r0 = Math.max(0, Math.floor((py - PULL_RADIUS) / CELL));
                var r1 = Math.min(rows - 1, Math.ceil((py + PULL_RADIUS) / CELL));

                for (var row = r0; row <= r1; row++) {
                    var base = row * cols;
                    for (var col = c0; col <= c1; col++) {
                        var idx = base + col;
                        if (isMoving[idx]) continue;
                        if (pullTarget(col, row, px, py, target)) {
                            isMoving[idx] = 1;
                            moving.push(idx);
                        }
                    }
                }
            }

            // Integrate only what is actually in motion.
            var moved = false;

            for (var n = 0; n < moving.length; n++) {
                var mi = moving[n];
                var mcol = mi % cols;
                var mrow = (mi / cols) | 0;

                if (pulling) pullTarget(mcol, mrow, px, py, target);
                else { target[0] = 0; target[1] = 0; }

                var dx = dispX[mi], dy = dispY[mi];
                var vx = (velX[mi] + (target[0] - dx) * SPRING) * DAMP;
                var vy = (velY[mi] + (target[1] - dy) * SPRING) * DAMP;
                dx += vx;
                dy += vy;

                if (dx * dx + dy * dy < 0.0025 && vx * vx + vy * vy < 0.0025) {
                    // Settled — drop it from the live list.
                    dispX[mi] = 0; dispY[mi] = 0; velX[mi] = 0; velY[mi] = 0;
                    isMoving[mi] = 0;
                    moving[n] = moving[moving.length - 1];
                    moving.pop();
                    n--;
                    continue;
                }

                dispX[mi] = dx; dispY[mi] = dy;
                velX[mi] = vx; velY[mi] = vy;
                moved = true;
            }

            anyDisp = moved;
        }

        /* ── Reduced motion ────────────────────────────────────────────────
           Keep the wallpaper, drop everything that moves. */

        var staticMode = reduceMotion;

        function paintStatic() {
            ctx.clearRect(0, 0, w, h);
            var fade = wallpaperFade();
            if (fade <= 0.002) return;
            ctx.globalAlpha = fade;
            ctx.drawImage(wall, 0, 0, w, h);
            ctx.globalAlpha = 1;
        }

        resize();

        window.addEventListener('themechange', function () {
            readColors();
            sizeWallpaper();                         // rebuilds the band palette
            lastTrailAlpha = -1;                     // forces the trail palette
            paintWallpaper(window.performance ? performance.now() : 0);
            if (staticMode) paintStatic(); else wake();
        });

        if (staticMode) {
            window.addEventListener('scroll', paintStatic, { passive: true });
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resize, 150);
            });
            return;
        }

        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { resize(); wake(); }, 150);
        });

        /* ── Input ─────────────────────────────────────────────────────────
           The pointer position is only recorded here; it gets stamped into
           the grid once per animation frame, so a burst of mousemove events
           never costs more than an ordinary frame does. */

        var pointerX = 0, pointerY = 0, hasPointer = false;

        if (fine) {
            window.addEventListener('mousemove', function (e) {
                pointerX = e.clientX;
                pointerY = e.clientY;
                hasPointer = true;
                wake();
            }, { passive: true });

            window.addEventListener('mouseleave', function () { hasPointer = false; });
        }

        var ripples = [];
        window.addEventListener('pointerdown', function (e) {
            if (e.target.closest && e.target.closest('a, button, input, textarea, select')) return;
            if (ripples.length > 5) ripples.shift();
            ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
            wake();
        }, { passive: true });

        // The wallpaper's visibility is scroll-dependent, so scrolling can
        // give the loop something to do again.
        window.addEventListener('scroll', wake, { passive: true });

        function touch(idx) {
            if (!isLit[idx]) { isLit[idx] = 1; lit.push(idx); }
        }

        // Raise brightness in a soft-edged disc around (cx, cy).
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
                    touch(idx);
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
                    touch(idx);
                }
            }
        }

        // A sparse, slow flicker so the grid feels alive at rest.
        var lastTwinkle = 0;
        function twinkle() {
            for (var i = 0; i < 3; i++) {
                var idx = (Math.random() * cells.length) | 0;
                if (cells[idx] < 0.3) cells[idx] = Math.random() * 0.3;
                touch(idx);
            }
        }

        /* ── Trail rendering ───────────────────────────────────────────────
           Grouped into a few alpha steps and drawn one path per step. Setting
           fillStyle per cell means parsing a colour string per cell, which is
           what makes a layer like this expensive. */

        var TRAIL_STEPS = 8;
        var trailBuckets = [];
        var trailPalette = [];
        for (var tb = 0; tb < TRAIL_STEPS; tb++) trailBuckets.push([]);

        function buildTrailPalette(alpha) {
            trailPalette.length = 0;
            for (var s = 0; s < TRAIL_STEPS; s++) {
                var v = (s + 1) / TRAIL_STEPS;
                var c = v > 0.7 ? crestColor : trailColor;
                trailPalette.push('rgba(' + c.r + ',' + c.g + ',' + c.b + ',' +
                    (v * alpha).toFixed(3) + ')');
            }
        }

        var lastTrailAlpha = -1;

        function drawTrail(fade) {
            if (!lit.length) return;

            // Over the landing page the trail lands on an already-lit field;
            // ease it back there so the two don't sum into a hot spot.
            var alpha = 0.5 * (1 - fade * 0.45);
            var quantised = Math.round(alpha * 100) / 100;
            if (quantised !== lastTrailAlpha) {
                buildTrailPalette(quantised);
                lastTrailAlpha = quantised;
            }

            var s;
            for (s = 0; s < TRAIL_STEPS; s++) trailBuckets[s].length = 0;

            var half = (CELL - DRAW) / 2;

            for (var n = 0; n < lit.length; n++) {
                var idx = lit[n];
                var v = cells[idx];

                if (v <= EPSILON) {
                    cells[idx] = 0;
                    isLit[idx] = 0;
                    lit[n] = lit[lit.length - 1];
                    lit.pop();
                    n--;
                    continue;
                }

                var col = idx % cols;
                var row = (idx / cols) | 0;

                var step = (v * TRAIL_STEPS) | 0;
                if (step >= TRAIL_STEPS) step = TRAIL_STEPS - 1;

                // Ride the same displacement the wallpaper is under, so the
                // two never read as separate misaligned grids.
                trailBuckets[step].push(
                    col * CELL + half + dispX[idx],
                    row * CELL + half + dispY[idx]
                );

                cells[idx] = v * DECAY;
            }

            for (s = 0; s < TRAIL_STEPS; s++) {
                var pts = trailBuckets[s];
                if (!pts.length) continue;
                ctx.fillStyle = trailPalette[s];
                ctx.beginPath();
                for (var k = 0; k < pts.length; k += 2) {
                    ctx.rect(pts[k], pts[k + 1], DRAW, DRAW);
                }
                ctx.fill();
            }
        }

        /* ── Loop ──────────────────────────────────────────────────────────
           Runs only while there is something to show. */

        var looping = false;
        var visible = true;

        function wake() {
            if (looping || !visible || staticMode) return;
            looping = true;
            requestAnimationFrame(frame);
        }

        document.addEventListener('visibilitychange', function () {
            visible = !document.hidden;
            if (visible) wake();
        });

        function frame(now) {
            if (!visible) { looping = false; return; }

            var t0 = performance.now();
            var fade = wallpaperFade();

            // The trail works the whole way down the page, not just over the
            // wallpaper.
            if (hasPointer) stamp(pointerX, pointerY, REACH, 0.55);

            // The idle twinkle is ambience for the landing page. Letting it
            // run below the fold would keep cells alive forever and stop the
            // loop from ever sleeping, for something nobody would notice on
            // a plain black background.
            if (fade > 0.002 && now - lastTwinkle > 220) {
                twinkle();
                lastTwinkle = now;
            }

            for (var i = ripples.length - 1; i >= 0; i--) {
                var r = ripples[i];
                var age = (now - r.t0) / 1000;
                if (age > RIPPLE_LIFE) { ripples.splice(i, 1); continue; }
                stampRing(r.x, r.y, age * RIPPLE_SPEED, 20, (1 - age / RIPPLE_LIFE) * 0.72);
            }

            stepDisplacement(fade);

            ctx.clearRect(0, 0, w, h);
            drawWallpaper(now, fade);
            drawTrail(fade);

            sampleCost(performance.now() - t0);

            // Nothing lit, nothing moving, no pulses and no wallpaper on
            // screen: stop entirely rather than spin on an empty grid. Any
            // of the input listeners will wake us again.
            if (!lit.length && !moving.length && !ripples.length && fade <= 0.002) {
                looping = false;
                return;
            }

            requestAnimationFrame(frame);
        }

        wake();
    }

    // Blend two {r,g,b} colours; t = 0 gives a, t = 1 gives b.
    function mix(a, b, t) {
        return {
            r: Math.round(a.r + (b.r - a.r) * t),
            g: Math.round(a.g + (b.g - a.g) * t),
            b: Math.round(a.b + (b.b - a.b) * t)
        };
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
        initTheme();
        initPixelField();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
