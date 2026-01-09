function toggleContent(category) {
    const content = category.querySelector('.content');
    const paragraphs = content.querySelectorAll('p');
    let shown = content.querySelectorAll('p.shown').length;

    // Dacă nu e activ, arată primul paragraf
    if (!category.classList.contains('active')) {
        category.classList.add('active');
        paragraphs.forEach((p, i) => {
            p.classList.remove('shown');
            if (i === 0) p.classList.add('shown');
        });
        content.style.maxHeight = paragraphs[0].offsetHeight + 56 + "px"; // mai mult spațiu jos
        return;
    }

    // Dacă mai sunt paragrafe de afișat, arată următorul
    if (shown < paragraphs.length) {
        paragraphs[shown].classList.add('shown');
        // Recalculează înălțimea pentru animație
        let totalHeight = 0;
        paragraphs.forEach(p => {
            if (p.classList.contains('shown')) totalHeight += p.offsetHeight + 16;
        });
        content.style.maxHeight = totalHeight + 40 + "px";
    } else {
        // Dacă toate sunt afișate și apeși din nou, ascunde totul
        category.classList.remove('active');
        paragraphs.forEach(p => p.classList.remove('shown'));
        content.style.maxHeight = null;
    }
}