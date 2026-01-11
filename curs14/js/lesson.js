/**
 * Lesson Navigation Script
 * Adds prev/next navigation to each lesson page
 */
(function() {
    'use strict';

    // Define all lessons in order
    const lessons = [
        { id: '14.1.1', title: 'Introducere în Ierarhia de Memorie', src: '../14.1.1/index.html' },
        { id: '14.1.2', title: 'Localitate Temporală și Spațială', src: '../14.1.2/index.html' },
        { id: '14.1.3', title: 'Niveluri de Memorie', src: '../14.1.3/index.html' },
        { id: '14.2.1', title: 'Structura Cache-ului', src: '../14.2.1/index.html' },
        { id: '14.2.2', title: 'Mapare Directă', src: '../14.2.2/index.html' },
        { id: '14.2.3', title: 'Mapare Asociativă', src: '../14.2.3/index.html' },
        { id: '14.2.4', title: 'Politici de Înlocuire', src: '../14.2.4/index.html' },
        { id: '14.3.1', title: 'Hit Rate și Miss Rate', src: '../14.3.1/index.html' },
        { id: '14.3.2', title: 'Tipuri de Miss-uri', src: '../14.3.2/index.html' },
        { id: '14.3.3', title: 'Optimizări Cache', src: '../14.3.3/index.html' },
        { id: '14.4.1', title: 'Concepte de Bază', src: '../14.4.1/index.html' },
        { id: '14.4.2', title: 'Paginare și Segmentare', src: '../14.4.2/index.html' },
        { id: '14.4.3', title: 'Translation Lookaside Buffer', src: '../14.4.3/index.html' }
    ];

    // Find current lesson index from URL
    function getCurrentLessonIndex() {
        const path = window.location.pathname;
        for (let i = 0; i < lessons.length; i++) {
            if (path.includes(lessons[i].id)) {
                return i;
            }
        }
        return -1;
    }

    // Mark lesson as completed
    function markCompleted(index) {
        let completed = JSON.parse(localStorage.getItem('curs14_completed') || '[]');
        if (!completed.includes(index)) {
            completed.push(index);
            localStorage.setItem('curs14_completed', JSON.stringify(completed));
        }
    }

    // Get progress percentage
    function getProgress() {
        const completed = JSON.parse(localStorage.getItem('curs14_completed') || '[]');
        return Math.round((completed.length / lessons.length) * 100);
    }

    // Create navigation bar
    function createNavBar() {
        const currentIndex = getCurrentLessonIndex();
        if (currentIndex === -1) return;

        // Mark current lesson as completed when viewed
        markCompleted(currentIndex);

        const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
        const progress = getProgress();

        const nav = document.createElement('nav');
        nav.className = 'lesson-nav';
        nav.innerHTML = `
            ${prevLesson 
                ? `<a href="${prevLesson.src}" class="btn-nav" title="${prevLesson.title}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>Înapoi</span>
                   </a>` 
                : '<span class="btn-nav disabled">Înapoi</span>'
            }
            
            <div class="progress-info">
                <strong>Lecția ${currentIndex + 1} / ${lessons.length}</strong>
                <span>Progres: ${progress}%</span>
            </div>
            
            <a href="../../html/main.html" class="btn-nav btn-home" title="Cuprins">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Cuprins</span>
            </a>
            
            ${nextLesson 
                ? `<a href="${nextLesson.src}" class="btn-nav" title="${nextLesson.title}">
                    <span>Următorul</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                   </a>` 
                : `<a href="../../html/main.html" class="btn-nav" title="Finalizare">
                    <span>Finalizare</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                   </a>`
            }
        `;

        document.body.appendChild(nav);

        // Add back-to-top button
        const btnTop = document.createElement('button');
        btnTop.className = 'btn-top';
        btnTop.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
            </svg>
        `;
        btnTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(btnTop);

        // Show/hide back-to-top button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btnTop.classList.add('visible');
            } else {
                btnTop.classList.remove('visible');
            }
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createNavBar);
    } else {
        createNavBar();
    }
})();
