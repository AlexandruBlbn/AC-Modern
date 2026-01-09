/**
 * CURS 13 - Main Application Script
 * Handles navigation, progress tracking, and UI interactions
 */

(function() {
    'use strict';

    // =====================================================
    // DOM ELEMENTS
    // =====================================================
    
    const appContainer = document.getElementById('appContainer');
    const sidebar = document.getElementById('sidebar');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const navList = document.getElementById('navList');
    const contentContainer = document.getElementById('contentContainer');
    const notAvailable = document.getElementById('notAvailable');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const congratsModal = document.getElementById('congratsModal');

    // =====================================================
    // STATE MANAGEMENT
    // =====================================================
    
    let lessons = [];
    let currentIndex = 0;
    let completedLessons = new Set();

    // =====================================================
    // INITIALIZATION
    // =====================================================
    
    function init() {
        buildLessonsList();
        loadProgress();
        setupEventListeners();
        updateUI();
    }

    function buildLessonsList() {
        const navLinks = navList.querySelectorAll('.nav-link');
        lessons = Array.from(navLinks).map((link, index) => ({
            element: link,
            src: link.dataset.src,
            index: index
        }));
    }

    function loadProgress() {
        const saved = localStorage.getItem('curs13_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                completedLessons = new Set(data.completed || []);
                currentIndex = data.currentIndex || 0;
            } catch (e) {
                console.warn('Could not load saved progress');
            }
        }
        
        // Set initial active lesson
        if (lessons[currentIndex]) {
            navigateToLesson(currentIndex, false);
        }
    }

    function saveProgress() {
        const data = {
            completed: Array.from(completedLessons),
            currentIndex: currentIndex
        };
        localStorage.setItem('curs13_progress', JSON.stringify(data));
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================
    
    function setupEventListeners() {
        // Toggle sidebar
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', handleToggleSidebar);
        }

        // Chapter toggles
        const chapterToggles = navList.querySelectorAll('.chapter-toggle');
        chapterToggles.forEach(toggle => {
            toggle.addEventListener('click', handleChapterToggle);
        });

        // Navigation links
        lessons.forEach((lesson, index) => {
            lesson.element.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToLesson(index);
            });
        });

        // Previous button only - Next is handled dynamically in updateNavigationButtons
        if (btnPrev) {
            btnPrev.addEventListener('click', () => navigateToLesson(currentIndex - 1));
        }

        // Close modal on overlay click
        if (congratsModal) {
            congratsModal.addEventListener('click', (e) => {
                if (e.target === congratsModal) {
                    congratsModal.classList.remove('active');
                }
            });
        }

        // Setup reset button in modal
        const resetBtn = document.getElementById('btnRestart');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetCourse);
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

    // =====================================================
    // EVENT HANDLERS
    // =====================================================
    
    function handleToggleSidebar() {
        appContainer.classList.toggle('sidebar-collapsed');
    }

    function handleChapterToggle(e) {
        const toggle = e.currentTarget;
        const chapterId = toggle.dataset.chapter;
        const chapterItems = document.getElementById(`chapter${chapterId}`);
        
        if (chapterItems) {
            const isExpanded = chapterItems.classList.contains('expanded');
            
            // Toggle the chapter
            toggle.classList.toggle('expanded', !isExpanded);
            chapterItems.classList.toggle('expanded', !isExpanded);
            toggle.setAttribute('aria-expanded', !isExpanded);
        }
    }

    function handleKeyboardNavigation(e) {
        // Arrow keys for navigation when not focused on input
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            navigateToLesson(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < lessons.length - 1) {
            navigateToLesson(currentIndex + 1);
        }
    }

    // =====================================================
    // NAVIGATION
    // =====================================================
    
    function navigateToLesson(index, markComplete = true) {
        if (index < 0 || index >= lessons.length) return;

        // Mark current lesson as completed
        if (markComplete && currentIndex !== index) {
            completedLessons.add(currentIndex);
        }

        currentIndex = index;
        const lesson = lessons[index];

        // Update active state in navigation
        lessons.forEach((l, i) => {
            l.element.classList.toggle('active', i === index);
        });

        // Expand parent chapter if collapsed
        const parentChapter = lesson.element.closest('.nav-chapter');
        if (parentChapter) {
            const toggle = parentChapter.querySelector('.chapter-toggle');
            const items = parentChapter.querySelector('.chapter-items');
            if (toggle && items && !items.classList.contains('expanded')) {
                toggle.classList.add('expanded');
                items.classList.add('expanded');
                toggle.setAttribute('aria-expanded', 'true');
            }
        }

        // Load content
        loadContent(lesson.src);

        // Update UI
        updateUI();
        saveProgress();
    }

    async function loadContent(src) {
        if (!src) {
            showNotAvailable(src);
            return;
        }

        contentContainer.style.display = 'block';
        notAvailable.style.display = 'none';
        
        // Show loading state
        contentContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Se încarcă...</p></div>';

        try {
            const response = await fetch(src);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            
            // Extract body content from the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Get the article/main content
            const article = doc.querySelector('article') || doc.querySelector('main') || doc.body;
            
            if (article) {
                contentContainer.innerHTML = article.innerHTML;
                
                // Re-initialize accordions in the loaded content
                initContentAccordions();
                
                // Scroll to top
                contentContainer.scrollTop = 0;
            } else {
                showNotAvailable(src);
            }
        } catch (error) {
            console.error('Error loading content:', error);
            showNotAvailable(src);
        }
    }

    function initContentAccordions() {
        const accordionHeaders = contentContainer.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isExpanded = content.classList.contains('expanded');
                header.classList.toggle('active', !isExpanded);
                content.classList.toggle('expanded', !isExpanded);
            });
        });
    }

    function showNotAvailable(src) {
        contentContainer.style.display = 'none';
        notAvailable.style.display = 'flex';
        
        // Update direct link
        const directLink = document.getElementById('directLink');
        if (directLink && src) {
            directLink.href = src;
        }
    }

    // =====================================================
    // UI UPDATES
    // =====================================================
    
    function updateUI() {
        updateNavigationButtons();
        updateProgress();
    }

    function updateNavigationButtons() {
        if (btnPrev) {
            btnPrev.disabled = currentIndex === 0;
        }
        if (btnNext) {
            const isLast = currentIndex === lessons.length - 1;
            
            if (isLast) {
                btnNext.disabled = false;
                btnNext.innerHTML = `
                    <span>Finalizare</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                `;
                btnNext.onclick = showCompletionModal;
            } else {
                btnNext.disabled = false;
                btnNext.innerHTML = `
                    <span>Următorul</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                `;
                btnNext.onclick = () => navigateToLesson(currentIndex + 1);
            }
        }
    }

    function showCompletionModal() {
        // Mark last lesson as completed
        completedLessons.add(currentIndex);
        saveProgress();
        
        if (congratsModal) {
            congratsModal.classList.add('active');
        }
    }

    function resetCourse() {
        // Clear all progress
        completedLessons.clear();
        currentIndex = 0;
        localStorage.removeItem('curs13_progress');
        
        // Close modal
        if (congratsModal) {
            congratsModal.classList.remove('active');
        }
        
        // Navigate to first lesson
        navigateToLesson(0, false);
    }

    function updateProgress() {
        // Calculate progress based on completed lessons
        const percent = Math.round((completedLessons.size / lessons.length) * 100);
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${percent}%`;
        }

        // Update nav items with completed state
        lessons.forEach((lesson, index) => {
            if (completedLessons.has(index)) {
                lesson.element.classList.add('completed');
            } else {
                lesson.element.classList.remove('completed');
            }
        });
    }

    // =====================================================
    // ACCORDION FUNCTIONALITY (for lesson content pages)
    // =====================================================
    
    // This function can be called from within lesson iframes
    window.initAccordions = function() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isExpanded = content.classList.contains('expanded');
                
                header.classList.toggle('active', !isExpanded);
                content.classList.toggle('expanded', !isExpanded);
            });
        });
    };

    // =====================================================
    // TAB FUNCTIONALITY (for lesson content pages)
    // =====================================================
    
    window.initTabs = function() {
        const tabContainers = document.querySelectorAll('.tabs');
        tabContainers.forEach(container => {
            const buttons = container.querySelectorAll('.tab-button');
            const panels = container.querySelectorAll('.tab-panel');
            
            buttons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    panels.forEach(p => p.classList.remove('active'));
                    
                    button.classList.add('active');
                    panels[index].classList.add('active');
                });
            });
        });
    };

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================
    
    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // =====================================================
    // START APPLICATION
    // =====================================================
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
