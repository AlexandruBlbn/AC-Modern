document.addEventListener("DOMContentLoaded", function () {
  const gridContainer = document.querySelector(".grid-container");
  const listGroup = document.getElementById("toc-list");
  const toggleBtn = document.getElementById("toggleSidebarBtn");
  const contentIframe = document.getElementById("content-iframe");
  const notAvailableMessage = document.getElementById("not-available-message");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progressBar = document.getElementById("progressBar");
  const progressContainer = document.getElementById("progressContainer");
  const congratsModal = document.getElementById("congratsModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const fireworksCanvas = document.getElementById("fireworks-canvas");
  const ctx = fireworksCanvas.getContext("2d");

  const allSubChapters = Array.from(
    listGroup.querySelectorAll(".list-group-item-action:not(.chapter-toggle)")
  );
  const totalSubChapters = allSubChapters.length;
  const visitedLinks = new Set();
  let fireworksAnimation;

  function updateProgress() {
    const progress = (visitedLinks.size / totalSubChapters) * 100;
    progressBar.style.width = `${progress}%`;
    progressContainer.setAttribute("aria-valuenow", progress);
  }

  function unlockChapter(chapterId) {
    const chapterToggle = listGroup.querySelector(
      `.chapter-toggle[data-chapter-id='${chapterId}']`
    );
    const collapseElement = document.getElementById(
      `collapseChapter${chapterId}`
    );

    if (chapterToggle && chapterToggle.classList.contains("locked")) {
      chapterToggle.classList.remove("locked");
      new bootstrap.Collapse(collapseElement, { toggle: true });
    }
  }

  function getVisibleLinks() {
    return allSubChapters.filter((link) => {
      const parentToggle = listGroup.querySelector(
        `[data-chapter-id='${link.dataset.parentChapter}']`
      );
      return !parentToggle.classList.contains("locked");
    });
  }

  function handleSubChapterClick(event) {
    event.preventDefault();
    const parentChapterId = this.dataset.parentChapter;
    const parentToggle = listGroup.querySelector(
      `.chapter-toggle[data-chapter-id='${parentChapterId}']`
    );
    if (parentToggle.classList.contains("locked")) return;

    const currentActive = listGroup.querySelector(".list-group-item.active");
    if (currentActive) {
      currentActive.classList.remove("active");
    }
    this.classList.add("active");

    if (!visitedLinks.has(this)) {
      visitedLinks.add(this);
      updateProgress();
    }

    const pageSrc = this.dataset.src;

    if (pageSrc && pageSrc.trim() !== "") {
      contentIframe.classList.remove("d-none");
      notAvailableMessage.classList.add("d-none");
      contentIframe.src = pageSrc;
    } else {
      contentIframe.classList.add("d-none");
      notAvailableMessage.classList.remove("d-none");
      contentIframe.src = "";
    }

    const visibleLinks = getVisibleLinks();
    const currentIndex = visibleLinks.indexOf(this);

    backBtn.disabled = currentIndex === 0;

    const isLastOfAll = allSubChapters.indexOf(this) === totalSubChapters - 1;

    if (isLastOfAll) {
      nextBtn.innerHTML = 'Finalizare <i class="bi bi-check-circle-fill"></i>';
    } else {
      nextBtn.innerHTML = 'Următorul <i class="bi bi-arrow-right"></i>';
    }

    const subChaptersInScope = Array.from(
      this.parentElement.querySelectorAll(".list-group-item-action")
    );
    const isLastInChapter =
      subChaptersInScope.indexOf(this) === subChaptersInScope.length - 1;

    if (isLastInChapter) {
      const nextChapterId = parseInt(parentChapterId) + 1;
      unlockChapter(nextChapterId);
    }
  }

  function handleNextClick() {
    if (nextBtn.textContent.includes("Finalizare")) {
      progressBar.classList.remove(
        "progress-bar-animated",
        "progress-bar-striped"
      );
      congratsModal.classList.remove("d-none");
      triggerFireworks();
      return;
    }

    const currentActive = listGroup.querySelector(".list-group-item.active");
    if (!currentActive) return;

    const visibleLinks = getVisibleLinks();
    const currentIndex = visibleLinks.indexOf(currentActive);

    if (currentIndex < visibleLinks.length - 1) {
      visibleLinks[currentIndex + 1].click();
    }
  }

  function handleBackClick() {
    const currentActive = listGroup.querySelector(".list-group-item.active");
    if (!currentActive) return;

    const visibleLinks = getVisibleLinks();
    const currentIndex = visibleLinks.indexOf(currentActive);

    if (currentIndex > 0) {
      visibleLinks[currentIndex - 1].click();
    }
  }

  //Fireworks Logic
  let particles = [];
  function triggerFireworks() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createFirework(
          Math.random() * fireworksCanvas.width,
          Math.random() * (fireworksCanvas.height / 2)
        );
      }, i * 400);
    }

    if (!fireworksAnimation) {
      fireworksAnimation = requestAnimationFrame(animateFireworks);
    }
    setTimeout(() => {
      cancelAnimationFrame(fireworksAnimation);
      fireworksAnimation = null;
      particles = [];
      ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }, 5000);
  }

  function createFirework(x, y) {
    const particleCount = 200;
    const angleIncrement = (Math.PI * 2) / particleCount;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angleIncrement * i) * (Math.random() * 5 + 1),
        vy: Math.sin(angleIncrement * i) * (Math.random() * 5 + 1),
        color: `hsl(${Math.random() * 40 + 200}, 90%, 60%)`,
        alpha: 1,
      });
    }
  }

  function animateFireworks() {
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.alpha -= 0.01;

      if (p.alpha <= 0) {
        particles.splice(index, 1);
      } else {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2, false);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }
    });
    fireworksAnimation = requestAnimationFrame(animateFireworks);
  }

  function initialize() {
    allSubChapters.forEach((link) => {
      link.addEventListener("click", handleSubChapterClick);
    });

    toggleBtn.addEventListener("click", () => {
      const isCollapsed = gridContainer.classList.toggle("sidebar-collapsed");
      const btnIcon = toggleBtn.querySelector("i");
      btnIcon.classList.toggle("bi-chevron-bar-left", !isCollapsed);
      btnIcon.classList.toggle("bi-chevron-bar-right", isCollapsed);
      toggleBtn.classList.toggle("justify-content-start", !isCollapsed);
      toggleBtn.classList.toggle("justify-content-center", isCollapsed);
    });

    nextBtn.addEventListener("click", handleNextClick);
    backBtn.addEventListener("click", handleBackClick);
    closeModalBtn.addEventListener("click", () =>
      congratsModal.classList.add("d-none")
    );

    unlockChapter(1);

    const firstSubChapter = listGroup.querySelector(
      "#collapseChapter1 .list-group-item-action"
    );
    if (firstSubChapter) {
      firstSubChapter.click();
    }
  }

  initialize();
});
