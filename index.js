/* =====================================================
   index.js - หน้าแรก Scripts
   บันทึกการติว Java
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
    initVisitorCounter();
    initSmoothScroll();
    initDynamicParticles();
    initClickSparkles();
    loadProgress();
});

// =====================================================
// VISITOR COUNTER
// =====================================================
function initVisitorCounter() {
    const counterElement = document.getElementById('visitor-count');
    if (!counterElement) return;

    // Get or initialize visitor count
    let visitors = parseInt(localStorage.getItem('visitor_count') || '0');

    // Check if this is a new session
    if (!sessionStorage.getItem('counted')) {
        visitors += 1;
        localStorage.setItem('visitor_count', visitors);
        sessionStorage.setItem('counted', 'true');
    }

    // Animate counter
    const totalVisitors = visitors;
    let displayCount = 0;
    const duration = 1500;
    const frames = 60;
    const step = totalVisitors / frames;

    const interval = setInterval(function () {
        displayCount += step;
        if (displayCount >= totalVisitors) {
            displayCount = totalVisitors;
            clearInterval(interval);
        }
        counterElement.textContent = Math.floor(displayCount).toLocaleString();
    }, duration / frames);
}

// =====================================================
// SMOOTH SCROLL
// =====================================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// =====================================================
// DYNAMIC PARTICLES
// =====================================================
function initDynamicParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }
}

// =====================================================
// CLICK SPARKLES EFFECT
// =====================================================
function initClickSparkles() {
    document.addEventListener('click', function (e) {
        const colors = ['#00d4ff', '#8b5cf6', '#ec4899', '#ffffff'];
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('click-particle');

            // Random position spread
            const tx = (Math.random() - 0.5) * 100;
            const ty = (Math.random() - 0.5) * 100;

            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            document.body.appendChild(particle);

            // Clean up
            setTimeout(function () {
                particle.remove();
            }, 600);
        }
    });
}

// =====================================================
// PROGRESS TRACKING
// =====================================================
function loadProgress() {
    // Lessons completed
    const lessonsVisited = JSON.parse(localStorage.getItem('java_lessons_visited') || '[]');
    const uniqueLessons = [...new Set(lessonsVisited)].length;
    const lessonsEl = document.getElementById('lessons-completed');
    if (lessonsEl) {
        lessonsEl.textContent = uniqueLessons;
    }

    // Questions answered (from quiz completion data)
    const completedQuizzes = JSON.parse(localStorage.getItem('java_quizzes_completed') || '{}');
    let totalQuestions = 0;

    Object.values(completedQuizzes).forEach(function (questionCount) {
        totalQuestions += questionCount;
    });

    const questionsEl = document.getElementById('questions-answered');
    if (questionsEl) {
        questionsEl.textContent = totalQuestions;
    }
}
