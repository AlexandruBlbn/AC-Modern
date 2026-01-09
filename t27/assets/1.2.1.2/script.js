// Scroll la secțiunea cu carduri
function scrollToCards() {
  // Arată navbarul și secțiunea cu carduri
  document.getElementById("main-nav").classList.remove("hidden");
  const cards = document.getElementById("cards-section");
  cards.classList.remove("hidden");

  // Derulează lin spre carduri
  cards.scrollIntoView({ behavior: "smooth" });
}



// Afișare/ascundere detalii secțiune
function toggleDetails(id) {
  const el = document.getElementById(id);
  el.classList.toggle("hidden");
}

// Afișare/ascundere subsecțiune
function toggleSub(id) {
  const el = document.getElementById(id);
  el.classList.toggle("hidden");
}

// Afișare buton "Sus" la scroll
window.addEventListener("scroll", function () {
  const btn = document.querySelector(".back-to-top");
  if (window.scrollY > 500) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});
