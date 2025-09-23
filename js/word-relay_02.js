const number = Number(prompt('참가자는 몇 명인가요?'));
const input = document.querySelector('input');
const button = document.querySelector('button');
const wordEl = document.querySelector('#word');
const orderEl = document.querySelector('#order');
const historyEl = document.querySelector('#history');
const playersEl = document.querySelector('#players');
const currentEl = document.querySelector('#current');
const statusEl = document.querySelector('#status');
const usedWords = new Set();
const players = [];
let currentIndex = 0;
let newWord;
let word;

const onInput = (event) => {
  newWord = event.target.value;
};

for (let i = 0; i < number; i++) {
  const name = prompt(`${i + 1}번 참가자 이름을 입력하세요`);
  players.push({ name: name || `참가자${i + 1}`, alive: true });
}

const renderPlayers = () => {
  playersEl.innerHTML = '';
  players.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = `${!p.alive ? 'dead' : ''} ${idx === currentIndex ? 'turn' : ''}`.trim();
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = p.name;
    const stateSpan = document.createElement('span');
    stateSpan.textContent = p.alive ? '진행' : '탈락';
    li.appendChild(nameSpan);
    li.appendChild(stateSpan);
    playersEl.appendChild(li);
  });
};

const aliveCount = () => players.filter(p => p.alive).length;

const moveToNextAlive = () => {
  if (aliveCount() <= 1) return;
  do {
    currentIndex = (currentIndex + 1) % players.length;
  } while (!players[currentIndex].alive);
  orderEl.textContent = String((currentIndex + 1));
  currentEl.textContent = players[currentIndex].name;
  renderPlayers();
};

const eliminateCurrent = (reasonText) => {
  const player = players[currentIndex];
  player.alive = false;
  statusEl.textContent = `${player.name} 탈락! ${reasonText}`;
  renderPlayers();
  if (aliveCount() === 1) {
    const winner = players.find(p => p.alive);
    statusEl.textContent = `${player.name} 탈락! 우승자는 ${winner?.name} 입니다!`;
    if (winner?.name) {
      alert(`우승자는 ${winner.name} 입니다!`);
    }
    input.disabled = true;
    button.disabled = true;
    return;
  }
  moveToNextAlive();
};

const appendHistory = (text) => {
  const li = document.createElement('li');
  li.textContent = text;
  if (historyEl.firstChild) {
    historyEl.insertBefore(li, historyEl.firstChild);
  } else {
    historyEl.appendChild(li);
  }
};

orderEl.textContent = '1';
currentEl.textContent = players[0]?.name || '';
statusEl.textContent = `${players[0]?.name || ''} 님부터 시작합니다.`;
renderPlayers();

const onClickButton = () => {
  if (aliveCount() <= 1) return;
  const player = players[currentIndex];
  if (!player.alive) {
    moveToNextAlive();
    return;
  }
  const submitted = (newWord || '').trim();
  if (!submitted) {
    statusEl.textContent = '빈 단어는 입력할 수 없습니다.';
    input.value = '';
    input.focus();
    return;
  }
  if (usedWords.has(submitted)) {
    appendHistory(`${player.name}: ${submitted} (중복) → 탈락`);
    eliminateCurrent('이미 사용한 단어를 입력했습니다.');
    input.value = '';
    input.focus();
    return;
  }
  if (word && word.at(-1) !== submitted[0]) {
    appendHistory(`${player.name}: ${submitted} (규칙 위반) → 탈락`);
    eliminateCurrent('끝말잇기 규칙을 어겼습니다.');
    input.value = '';
    input.focus();
    return;
  }
  word = submitted;
  usedWords.add(submitted);
  wordEl.textContent = word;
  appendHistory(`${player.name}: ${submitted}`);
  statusEl.textContent = `${player.name} 입력 완료. 다음 차례로 넘어갑니다.`;
  moveToNextAlive();
  input.value = '';
  input.focus();
};

input.addEventListener('input', onInput);
button.addEventListener('click', onClickButton);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    onClickButton();
  }
});

