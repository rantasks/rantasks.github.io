// script.js — управление анимацией и логикой
// Требование: tasks.js загружен выше (массив tasks)

const cardsRoot = document.getElementById('cards');
const shuffleBtn = document.getElementById('shuffleBtn');
const historyOl = document.getElementById('history');

let cards = []; // массив DOM-элементов карт
let isRunning = false;

// создаём DOM-карты (dataset.task хранит текст задания)
function createBoard(){
  cardsRoot.innerHTML = '';
  cards = [];

  tasks.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.task = t;
    card.dataset.idx = i;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face front">${i+1}</div>
        <div class="card-face back">${t}</div>
      </div>
    `;
    cards.push(card);
    cardsRoot.appendChild(card);
  });
}

createBoard();

/* --- HELPERS --- */
function randRange(min, max){ return Math.random()*(max-min)+min; }
function setShuffleVars(card){
  // назначаем случайную траекторию для ключевой фазы
  const tx = `${Math.round(randRange(-220, 220))}px`;
  const ty = `${Math.round(randRange(-140, 140))}px`;
  const rot = `${Math.round(randRange(-30, 30))}deg`;
  const delay = `${Math.round(randRange(0,120))}ms`;
  card.style.setProperty('--tx', tx);
  card.style.setProperty('--ty', ty);
  card.style.setProperty('--rot', rot);
  card.style.setProperty('--delay', delay);
  // длительность можно варьировать
  card.style.setProperty('--dur', '820ms');
}

/* Одно "проходное" CSS-перемешивание:
   добавляет класс .shuffle-phase к каждой карте, который запускает keyframes shuffle,
   затем ждёт окончания анимации.
*/
function cssShufflePhase(){
  return new Promise(resolve => {
    cards.forEach(c => {
      setShuffleVars(c);
      c.style.setProperty('--dur','1200ms'); // длиннее анимация
    });
    void cardsRoot.offsetWidth;
    cards.forEach(c => c.classList.add('shuffle-phase'));

    const timeout = 1300; // чуть больше длительности
    setTimeout(()=>{
      cards.forEach(c => c.classList.remove('shuffle-phase'));
      resolve();
    }, timeout);
  });
}
}

/* Реальная перестановка — FLIPlike: запоминаем позиции, меняем порядок в DOM,
   считаем инверт и анимируем обратно к месту (чтобы не было резкого "перескакивания").
*/
function doRealShuffle(){
  return new Promise(resolve => {
    // сохраним текущие rect'ы
    const firstRects = cards.map(c => c.getBoundingClientRect());

    // реально перемешаем массив
    cards.sort(() => Math.random() - 0.5);

    // переставим в DOM в новом порядке
    cards.forEach(c => cardsRoot.appendChild(c));

    // получим новые rect'ы
    const lastRects = cards.map(c => c.getBoundingClientRect());

    // применим инверт (временно трансформируя)
    cards.forEach((card, i) => {
      const dx = firstRects[i].left - lastRects[i].left;
      const dy = firstRects[i].top - lastRects[i].top;
      // применяем обратный трансформ
      card.style.transition = 'transform 0s';
      card.style.transform = `translate(${dx}px, ${dy}px)`;
      // заставляем браузер применить
      void card.offsetWidth;
      // анимируем к нулю — карта "летит" плавно на новое место
      requestAnimationFrame(()=>{
        card.style.transition = 'transform 600ms cubic-bezier(.22,1,.36,1)';
        card.style.transform = '';
      });
    });

    // дождёмся завершения
    setTimeout(()=>{
      // очистим inline-поля
      cards.forEach(c => {
        c.style.transition = '';
        c.style.transform = '';
      });
      resolve();
    }, 650);
  });
}

/* Показываем модал с задачей: принимает DOM элемент карты.
   В модалке — кнопка "Удалить и закрыть" и "Отмена".
   Если удаляем — карта удаляется из DOM и из массива cards.
*/
function showTaskModal(card){
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="task">${card.dataset.task}</div>
      <div class="row">
        <button class="btn-confirm" id="confirmBtn">Удалить и закрыть</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const confirmBtn = modal.querySelector('#confirmBtn');
    confirmBtn.onclick = () => {
      // Добавляем в историю
      const li = document.createElement('li');
      li.textContent = `${historyOl.children.length + 1}. ${card.dataset.task}`;
      historyOl.prepend(li);

      // удаляем карту
      const idx = cards.indexOf(card);
      if(idx !== -1) cards.splice(idx,1);
      card.remove();

      overlay.remove();
      resolve(true);
    };

    overlay.addEventListener('click', e=>{
      if(e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });
  });
}


/* Основная последовательность при клике:
   - сделать 3 фазы cssShufflePhase (видимые перемешивания)
   - выполнить doRealShuffle (реальная перестановка с плавной анимацией)
   - выбрать случайную карту из текущих и показать модал
   - при подтверждении — удалить карту и обновить board
*/
shuffleBtn.addEventListener('click', async () => {
  if(isRunning) return;
  if(cards.length === 0){
    alert('Карт больше нет — все задания использованы.');
    return;
  }
  isRunning = true;
  shuffleBtn.disabled = true;

  // видимые проходы
  await cssShufflePhase();
  await cssShufflePhase();
  await cssShufflePhase();

  // реальная перестановка
  await doRealShuffle();

  // выбираем победителя
  const winnerIndex = Math.floor(Math.random() * cards.length);
  const winnerCard = cards[winnerIndex];

  // показываем модалку
  await showTaskModal(winnerCard);

  shuffleBtn.disabled = false;
  isRunning = false;
});







