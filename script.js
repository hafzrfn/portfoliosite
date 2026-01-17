/**
 * ============================================
 * PORTFOLIO WEBSITE - MAIN JAVASCRIPT
 * ============================================
 * 
 * This file contains all JavaScript functionality:
 * 1. Tab Navigation (Skills/Experience/Education switching)
 * 2. Mobile Menu Toggle (Hamburger animation)
 * 3. Scroll Animations (IntersectionObserver)
 * 4. Parallax Background Effect (Desktop only)
 * 
 * Author: Hafizh Rifan
 * ============================================
 */

// ============================================
// TAB NAVIGATION
// Switches between Skills, Experience, Education tabs
// with pop-up animation effect
// ============================================

var tablinks = document.getElementsByClassName("tab-links");
var tabcontents = document.getElementsByClassName("tab-contents");

function opentab(tabname) {
    // Remove active states from all tabs
    for (let tablink of tablinks) {
        tablink.classList.remove("active-link");
    }
    for (let tabcontent of tabcontents) {
        tabcontent.classList.remove("active-tab");
    }

    // Add active states to clicked tab
    // CSS animation triggers automatically via .active-tab class
    event.currentTarget.classList.add("active-link");
    document.getElementById(tabname).classList.add("active-tab");
}


// ============================================
// MOBILE MENU TOGGLE
// Controls hamburger button animation and 
// glassmorphism nav panel slide-in effect
// ============================================

var sidemenu = document.getElementById("sidemenu");
var hamburger = document.getElementById("hamburger");
var menuOpen = false;

function togglemenu() {
    menuOpen = !menuOpen;
    if (menuOpen) {
        sidemenu.classList.add("active");
        hamburger.classList.add("active");
    } else {
        sidemenu.classList.remove("active");
        hamburger.classList.remove("active");
    }
}

function closemenu() {
    menuOpen = false;
    sidemenu.classList.remove("active");
    hamburger.classList.remove("active");
}


// ============================================
// INTERSECTION OBSERVER - Repeatable Scroll Animation
// 
// How it works:
// 1. Create an observer that watches elements
// 2. When element enters viewport: add 'animate' class
// 3. When element leaves viewport: remove 'animate' class
// 4. This allows animations to replay every time you scroll
// ============================================

const observerOptions = {
    threshold: 0.1,  // Trigger when 10% of element is visible
    rootMargin: '0px 0px -50px 0px'  // Trigger slightly before element enters
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Element entered viewport - play animation
            entry.target.classList.add('animate');
        } else {
            // Element left viewport - reset so animation can replay
            entry.target.classList.remove('animate');
        }
    });
}, observerOptions);

// Observe all elements with 'scroll-animate' class
document.querySelectorAll('.scroll-animate').forEach(element => {
    observer.observe(element);
});


// ============================================
// DYNAMIC PARALLAX BACKGROUND
// 
// Subtly moves background based on cursor position
// Disabled on mobile/touch devices for performance
// ============================================

(function initParallax() {
    const header = document.getElementById('header');
    if (!header) return;

    // Check if device is mobile/touch
    const isMobile = window.matchMedia('(max-width: 768px)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

    if (isMobile) return; // Don't run on mobile

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const ease = 0.05; // Smoother easing factor
    const maxOffset = 10; // Reduced maximum pixels of movement for subtler effect

    // Track mouse position
    header.addEventListener('mousemove', (e) => {
        const rect = header.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate offset from center (-1 to 1)
        const offsetX = (e.clientX - rect.left - centerX) / centerX;
        const offsetY = (e.clientY - rect.top - centerY) / centerY;

        // Set target position (inverted for natural feel)
        targetX = -offsetX * maxOffset;
        targetY = -offsetY * maxOffset;
    });

    // Reset when mouse leaves
    header.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    // Smooth animation loop using requestAnimationFrame
    function animate() {
        // Ease towards target position
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;

        // Apply transform to header background
        header.style.backgroundPosition = `calc(50% + ${currentX}px) calc(50% + ${currentY}px)`;

        requestAnimationFrame(animate);
    }

    animate();
})();
