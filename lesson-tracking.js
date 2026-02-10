/* =====================================================
   lesson-tracking.js
   บันทึกการเข้าชมบทเรียน
   ===================================================== */

(function () {
    // Get lesson ID from data attribute on body or from URL
    let lessonId = document.body.dataset.lessonId;

    // Fallback: detect from URL
    if (!lessonId) {
        const path = window.location.pathname;
        if (path.includes('blog-java') || path.includes('01-')) lessonId = 'lesson-01';
        else if (path.includes('02-')) lessonId = 'lesson-02';
        else if (path.includes('03-')) lessonId = 'lesson-03';
        else if (path.includes('04-')) lessonId = 'lesson-04';
        else if (path.includes('05-')) lessonId = 'lesson-05';
        else if (path.includes('06-')) lessonId = 'lesson-06';
        else if (path.includes('07-')) lessonId = 'lesson-07';
        else if (path.includes('08-')) lessonId = 'lesson-08';
        else if (path.includes('09-')) lessonId = 'lesson-09';
        else if (path.includes('10-')) lessonId = 'lesson-10';
    }

    if (lessonId) {
        let visited = JSON.parse(localStorage.getItem('java_lessons_visited') || '[]');
        if (!visited.includes(lessonId)) {
            visited.push(lessonId);
            localStorage.setItem('java_lessons_visited', JSON.stringify(visited));
        }
    }
})();
