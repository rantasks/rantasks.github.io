const cardsRoot = document.getElementById('cards');
const shuffleBtn = document.getElementById('shuffleBtn');
const historyOl = document.getElementById('history');

let cards = [];
let slots = [];
let isRunning = false;

function createBoard(){
  cardsRoot.innerHTML = '';
  cards = [];
  slots = [];

  const rect = cardsRoot.getBoundingClientRect();
  const gap = 20;
  const cardWidth = 180;
  const count = tasks.length;
  const totalWidth = cardsRoot.offsetWidth;
  const startX = (totalWidth - (cardWidth + gap) * count + gap) / 2;

  tasks.forEach((t,i)=>{
    const card = document.createElement('div');
    card.className='card';
    card.dataset.task = t;
    card.dataset.idx = i;

    card.innerHTML=`
      <div class="card-inner">
        <div class="card-face front">${i+1}</div>
        <div class="card-face back">${t}</div>
      </div>
    `;

    cards.push(card);
    cardsRoot.appendChild(card);

    const left = startX + i*(cardWidth + gap);
    const top = 0;
    slots.push({left, top});

    card.style.position='absolute';
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  });
}

createBoard();

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function animateCard(card,path,duration){
  return new Promise(resolve=>{
    let start=null;
    function step(ts){
      if(!start) start=ts;
      let t = (ts-start)/duration;
      if(t>=1){
        const final=path[path.length-1];
        card.style.left=`${final.left}px`;
        card.style.top=`${final.top}px`;
        resolve();
        return;
      }
      const segCount = path.length-1;
      let seg = Math.floor(t*segCount);
      if(seg>=segCount) seg=segCount-1;
      const segT = (t*segCount) - seg;
      const startP=path[seg];
      const endP=path[seg+1];
      const x = startP.left + (endP.left - startP.left)*segT;
      const y = startP.top + (endP.top - startP.top)*segT;
      card.style.left=`${x}px`;
      card.style.top=`${y}px`;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

async function shuffleCards(){
  if(isRunning) return;
  if(cards.length===0){ alert('Нет карт'); return; }
  isRunning=true;
  shuffleBtn.disabled=true;

  const order=[...Array(cards.length).keys()];
  for(let i=order.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [order[i],order[j]]=[order[j],order[i]];
  }

  const totalPhases = 3;
  for(let phase=0; phase<totalPhases; phase++){
    const animations=[];
    cards.forEach((card,i)=>{
      const targetSlot=slots[order[i]];
      const midOffset = 50*(phase+1);
      const mid1={left:(parseFloat(card.style.left)+targetSlot.left)/2, top:-midOffset};
      const mid2={left:targetSlot.left, top:-midOffset/2};
      const path=[ {left:parseFloat(card.style.left),top:parseFloat(card.style.top)}, mid1, mid2, targetSlot ];
      const duration = 500+phase*200;
      animations.push(animateCard(card,path,duration));
    });
    await Promise.all(animations);
  }

  cards.sort((a,b)=>order[a.dataset.idx]-order[b.dataset.idx]);

  const winnerIndex=Math.floor(Math.random()*cards.length);
  const winnerCard=cards[winnerIndex];
  winnerCard.classList.add('highlight-long');
  await showTaskModal(winnerCard);

  shuffleBtn.disabled=false;
  isRunning=false;
}

shuffleBtn.addEventListener('click',shuffleCards);

function showTaskModal(card){
  return new Promise(resolve=>{
    const overlay=document.createElement('div');
    overlay.className='overlay';
    const modal=document.createElement('div');
    modal.className='modal';
    modal.innerHTML=`
      <div class="task">${card.dataset.task}</div>
      <div class="row">
        <button class="btn-confirm" id="confirmBtn">Удалить и закрыть</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('confirmBtn').onclick=()=>{
      const li=document.createElement('li');
      li.textContent=`${historyOl.children.length+1}. ${card.dataset.task}`;
      historyOl.prepend(li);
      const idx=cards.indexOf(card);
      if(idx!==-1) cards.splice(idx,1);
      card.remove();
      overlay.remove();
      resolve(true);
    };

    overlay.addEventListener('click',e=>{
      if(e.target===overlay){ overlay.remove(); resolve(false); }
    });
  });
}








