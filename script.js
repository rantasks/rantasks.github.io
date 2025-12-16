const cardsContainer = document.getElementById("cards");
const shuffleBtn = document.getElementById("shuffleBtn");
const history = document.getElementById("history");
const scrollBtn = document.getElementById("scrollBtn");

let cards = [];
let isAnimating = false;

// создание карт
tasks.forEach((task, i) => {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.task = task;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face front">${i + 1}</div>
      <div class="card-face back">${task}</div>
    </div>
  `;

  cards.push(card);
  cardsContainer.appendChild(card);
});

shuffleBtn.onclick = async () => {
  if (isAnimating || cards.length === 0) return;
  isAnimating = true;

  // 1️⃣ ВИДИМОЕ ПЕРЕМЕШИВАНИЕ (3 раза)
  for (let i = 0; i < 3; i++) {
    await shuffleOnce();
  }

  // 2️⃣ выбор карты
  const winnerIndex = Math.floor(Math.random() * cards.length);
  const winner = cards[winnerIndex];

  // 3️⃣ полноэкранный режим
  showFullscreen(winner, winnerIndex);

  isAnimating = false;
};

// FLIP shuffle
function shuffleOnce() {
  return new Promise(resolve => {
    const first = cards.map(c => c.getBoundingClientRect());

    cards.sort(() => Math.random() - 0.5);
    cards.forEach(c => cardsContainer.appendChild(c));

    const last = cards.map(c => c.getBoundingClientRect());

    cards.forEach((card, i) => {
      const dx = first[i].left - last[i].left;
      const dy = first[i].top - last[i].top;

      card.style.transform = `translate(${dx}px, ${dy}px)`;
      card.style.transition = "transform 0s";

      requestAnimationFrame(() => {
        card.style.transition = "transform 600ms cubic-bezier(.22,1,.36,1)";
        card.style.transform = "";
      });
    });

    setTimeout(resolve, 650);
  });
}

// полноэкранная карта
function showFullscreen(card, index) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  card.classList.add("fullscreen", "flip");

  overlay.onclick = () => {
    // история
    const li = document.createElement("li");
    li.textContent = `${history.children.length + 1}. ${card.dataset.task}`;
    history.appendChild(li);

    // удаляем карту
    card.remove();
    cards.splice(index, 1);

    // очистка
    overlay.remove();
    card.classList.remove("fullscreen", "flip");
  };
}

// прокрутка
scrollBtn.onclick = () => {
  history.scrollIntoView({ behavior: "smooth" });
};



