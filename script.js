const cardsContainer = document.getElementById("cards");
const history = document.getElementById("history");
const shuffleBtn = document.getElementById("shuffleBtn");

let available = [...Array(tasks.length).keys()];

// создаём карточки
tasks.forEach((task, i) => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face front">${i + 1}</div>
      <div class="card-face back">${task}</div>
    </div>
  `;
  cardsContainer.appendChild(card);
});

shuffleBtn.onclick = () => {
  if (!available.length) return alert("Задания закончились");

  const cards = document.querySelectorAll(".card");

  // фаза перемешивания
  cards.forEach(card => {
    const x = `${(Math.random() - .5) * 300}px`;
    const y = `${(Math.random() - .5) * 200}px`;
    card.style.setProperty("--x", x);
    card.style.setProperty("--y", y);
    card.classList.add("moving");
  });

  const index = available.splice(
    Math.floor(Math.random() * available.length), 1
  )[0];

  // возврат + выбор победителя
  setTimeout(() => {
    cards.forEach(card => card.classList.remove("moving"));

    const winner = cards[index];
    winner.classList.add("flip", "winner");

    const li = document.createElement("li");
    li.textContent = `${history.children.length + 1}. ${tasks[index]}`;
    history.appendChild(li);
  }, 1600);
};

