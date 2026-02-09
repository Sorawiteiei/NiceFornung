// Premium Quiz Logic with Explanations support
let quizHistory = []; // Store score history for current session

// Handle Option Selection
document.addEventListener('DOMContentLoaded', () => {
    // Option click handling
    document.querySelectorAll('.option').forEach(o => {
        o.addEventListener('click', function () {
            const q = this.closest('.question');
            if (q.classList.contains('answered')) return; // Prevent changing after answer
            q.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Animate particles if they exist
    const particles = document.querySelector('.bg-particles');
    if (particles) {
        for (let i = 0; i < 10; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 10 + 's';
            particles.appendChild(p);
        }
    }
});

// Quiz Submission
function submitQuiz() {
    const qs = document.querySelectorAll('.question');
    let s = 0, a = 0;

    qs.forEach(q => {
        const ans = q.dataset.answer;
        const sel = q.querySelector('input:checked');
        const explanation = q.querySelector('.explanation');

        // Show explanation regardless of answer status (if submitting)
        if (explanation) explanation.style.display = 'block';

        if (sel) {
            a++;
            const opt = sel.closest('.option');
            if (sel.value === ans) {
                s++;
                opt.classList.add('correct');
            } else {
                opt.classList.add('wrong');
                // Highlight correct answer
                q.querySelectorAll('.option').forEach(x => {
                    if (x.querySelector('input').value === ans) x.classList.add('correct');
                });
            }
            q.classList.add('answered');
        } else {
            // For unanswered questions, still show the correct answer and explanation
            q.querySelectorAll('.option').forEach(x => {
                if (x.querySelector('input').value === ans) {
                    x.classList.add('correct');
                    x.style.opacity = '0.7'; // Dim visual for not selected
                }
            });
            q.classList.add('answered');
        }
    });

    // Record History (Push current score)
    quizHistory.push(s);

    // --- Save to localStorage for Progress Tracking ---
    // Get quiz ID from URL
    const path = window.location.pathname;
    let quizId = 'unknown';
    if (path.includes('quiz-01')) quizId = 'quiz-01';
    else if (path.includes('quiz-02')) quizId = 'quiz-02';
    else if (path.includes('quiz-03')) quizId = 'quiz-03';
    else if (path.includes('quiz-04')) quizId = 'quiz-04';
    else if (path.includes('quiz-05')) quizId = 'quiz-05';
    else if (path.includes('quiz-06')) quizId = 'quiz-06';

    // Mark this quiz as completed (with number of questions)
    const completedQuizzes = JSON.parse(localStorage.getItem('java_quizzes_completed') || '{}');
    completedQuizzes[quizId] = qs.length; // Store number of questions for this quiz
    localStorage.setItem('java_quizzes_completed', JSON.stringify(completedQuizzes));

    // Update Scores
    const scoreEl = document.getElementById('current-score');
    if (scoreEl) scoreEl.textContent = s;

    const answeredEl = document.getElementById('answered');
    if (answeredEl) answeredEl.textContent = qs.length; // Show all as "checked"

    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) finalScoreEl.textContent = s + '/' + qs.length;

    // Result Message
    let t = '';
    const percentage = (s / qs.length) * 100;
    if (percentage >= 80) t = '🏆 ยอดเยี่ยม! คุณเข้าใจเนื้อหาได้ดีมาก!';
    else if (percentage >= 60) t = '👍 ดีมาก! ทบทวนจุดที่ผิดอีกนิดก็สมบูรณ์แบบ!';
    else if (percentage >= 40) t = '📚 พอใช้ได้ครับ ลองกลับไปอ่านบทเรียนทบทวนนะ';
    else t = '💪 ไม่เป็นไรนะ! การเริ่มต้นใหม่คือการเรียนรู้ที่ดีที่สุด';

    const resultText = document.getElementById('result-text');
    if (resultText) resultText.textContent = t;

    // Show Result Box
    const resultBox = document.getElementById('result');
    if (resultBox) {
        resultBox.style.display = 'block';

        // --- Score History Display Logic ---
        let historyContainer = document.getElementById('score-history');
        if (!historyContainer) {
            historyContainer = document.createElement('div');
            historyContainer.id = 'score-history';
            historyContainer.style.cssText = "margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: left; max-width: 320px; margin-left: auto; margin-right: auto;";

            // Try to insert before the restart button if it exists, otherwise append
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                resultBox.insertBefore(historyContainer, restartBtn);
            } else {
                // Insert before the last child (usually the Primary Button) if restart button is not yet created
                // logic below handles restart button creation strictly AFTER history container
                resultBox.appendChild(historyContainer);
            }
        }

        // Generate History HTML
        let historyHTML = '<h3 style="font-size: 1.1rem; margin-bottom: 15px; color: #cbd5e1; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 10px;">📊 คะแนนของคุณใน Session นี้</h3><ul style="list-style: none; padding: 0; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px; max-height: 200px; overflow-y: auto;">';

        quizHistory.forEach((score, index) => {
            const isLast = index === quizHistory.length - 1;
            const highlight = isLast ? 'background: rgba(255,255,255,0.05); border-radius: 6px;' : '';
            const scoreColor = score >= qs.length * 0.8 ? '#4ade80' : (score >= qs.length * 0.5 ? '#facc15' : '#ef4444');
            const icon = score >= qs.length * 0.8 ? '🏆' : (score >= qs.length * 0.5 ? '👍' : '💪');

            historyHTML += `<li style="margin-bottom: 5px; padding: 8px 10px; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center; ${highlight}">
                <span style="color: rgba(255,255,255,0.7);">ครั้งที่ ${index + 1}</span>
                <span style="font-weight: 600; color: ${scoreColor};">${icon} ${score} / ${qs.length}</span>
            </li>`;
        });
        historyHTML += '</ul>';
        historyContainer.innerHTML = historyHTML;

        // --- End Score History ---

        // Inject Restart Button if not exists
        if (!document.getElementById('restart-btn')) {
            const restartBtn = document.createElement('button');
            restartBtn.id = 'restart-btn';
            restartBtn.textContent = '🔄 ทำอีกครั้ง';
            restartBtn.className = 'btn-secondary'; // Use generic class
            // Add inline styles to match premium theme immediately
            restartBtn.style.cssText = `
                background: linear-gradient(135deg, #4b5563, #374151);
                color: #fff;
                border: none;
                padding: 10px 25px;
                font-size: 1rem;
                border-radius: 50px;
                cursor: pointer;
                margin-left: 15px;
                margin-top: 20px;
                transition: transform 0.2s;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            `;
            restartBtn.onmouseover = () => restartBtn.style.transform = 'scale(1.05)';
            restartBtn.onmouseout = () => restartBtn.style.transform = 'scale(1)';
            restartBtn.onclick = restartQuiz;

            // Append after history
            resultBox.appendChild(restartBtn);

            // Logic for Next Chapter Button
            let nextUrl = '';
            const path = window.location.pathname;

            if (path.includes('quiz-01')) nextUrl = '02-control-flow.html';
            else if (path.includes('quiz-02')) nextUrl = '03-loops.html';
            else if (path.includes('quiz-03')) nextUrl = '04-arrays.html';
            else if (path.includes('quiz-04')) nextUrl = '05-methods.html';
            else if (path.includes('quiz-05')) nextUrl = '06-oop.html';
            else if (path.includes('quiz-06')) nextUrl = 'index.html';

            if (nextUrl && !document.getElementById('next-chapter-btn')) {
                const nextBtn = document.createElement('a');
                nextBtn.id = 'next-chapter-btn';
                nextBtn.href = nextUrl;
                nextBtn.textContent = path.includes('quiz-06') ? '🏠 กลับหน้าหลัก' : 'บทเรียนถัดไป ➡️';

                nextBtn.style.cssText = `
                    display: inline-block;
                    background: linear-gradient(135deg, var(--accent-green), #059669);
                    color: #fff;
                    text-decoration: none;
                    padding: 10px 25px;
                    font-size: 1rem;
                    border-radius: 50px;
                    margin-left: 15px;
                    margin-top: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    transition: transform 0.2s;
                    font-weight: bold;
                `;
                nextBtn.onmouseover = () => nextBtn.style.transform = 'scale(1.05)';
                nextBtn.onmouseout = () => nextBtn.style.transform = 'scale(1)';

                resultBox.appendChild(nextBtn);
            }
        } else {
            // If button exists, ensure it is below history (by appending history first logic above)
        }

        resultBox.scrollIntoView({ behavior: 'smooth' });
    }

    // Disable button
    const btn = document.querySelector('.btn-submit');
    if (btn) {
        btn.textContent = '✓ ตรวจคำตอบเรียบร้อย';
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'default';
    }
}

function restartQuiz() {
    // Reset all questions
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('answered');

        // Clear options
        q.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'wrong');
            opt.style.opacity = '1';
        });

        // Uncheck radio buttons
        q.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        // Hide explanation
        const explanation = q.querySelector('.explanation');
        if (explanation) explanation.style.display = 'none';
    });

    // Reset Scores (Display Only)
    const scoreEl = document.getElementById('current-score');
    if (scoreEl) scoreEl.textContent = '0';

    const answeredEl = document.getElementById('answered');
    if (answeredEl) answeredEl.textContent = '0';

    // Hide Result Box
    const resultBox = document.getElementById('result');
    if (resultBox) resultBox.style.display = 'none';

    // Reset Submit Button
    const btn = document.querySelector('.btn-submit');
    if (btn) {
        btn.textContent = '🎯 ตรวจคำตอบ';
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Click Sparkle Effect
document.addEventListener('click', function (e) {
    const colors = ['#00d4ff', '#8b5cf6', '#ec4899', '#ffffff'];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('click-particle');

        // Random position spread
        const tx = (Math.random() - 0.5) * 100; // -50 to 50
        const ty = (Math.random() - 0.5) * 100; // -50 to 50

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        document.body.appendChild(particle);

        // Clean up
        setTimeout(() => particle.remove(), 600);
    }
});

// Auto-Load Music Player for Quizzes
(function () {
    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'music-player.css';
    document.head.appendChild(link);

    // Add JS
    const script = document.createElement('script');
    script.src = 'music-player.js';
    document.body.appendChild(script);
})();
