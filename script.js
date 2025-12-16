const cardsContainer = document.getElementById("cards");
const shuffleBtn = document.getElementById("shuffleBtn");
const history = document.getElementById("history");

let availableIndexes = [...Array(tasks.length).keys()];

// создаём карточки
tasks.forEach((task, i) => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face front">🎴</div>
      <div class="card-face back">${task}</div>
    </div>
  `;

  cardsContainer.appendChild(card);
});

shuffleBtn.onclick = () => {
  if (availableIndexes.length === 0) {
    alert("Задания закончились");
    return;
  }

  const cards = document.querySelectorAll(".card");
  cards.forEach(c => c.classList.add("shuffle"));

  const randomPos = Math.floor(Math.random() * availableIndexes.length);
  const index = availableIndexes.splice(randomPos, 1)[0];

  setTimeout(() => {
    cards.forEach(c => c.classList.remove("shuffle"));
    const winner = cards[index];
    winner.classList.add("flip", "winner");

    const li = document.createElement("li");
    li.textContent = tasks[index];
    history.appendChild(li);
  }, 2000);
};
