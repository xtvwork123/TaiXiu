let balance = 0;
let currentBet = 0;
let userSide = '';
let pnl = 0;
let round = 0;
let history = [];

const HIGH_BET_THRESHOLD = 0.5;

function fmt(n) {
  return '₫' + Math.abs(n).toLocaleString('vi-VN');
}

function updateUI() {
  document.getElementById('balance').textContent = fmt(balance);
  document.getElementById('betDisplay').textContent = fmt(currentBet);
  const pnlEl = document.getElementById('pnl');
  pnlEl.textContent = (pnl >= 0 ? '+' : '-') + fmt(pnl);
  pnlEl.className = 'wallet-val' + (pnl > 0 ? ' green' : pnl < 0 ? ' red' : '');
}

function deposit() {
  const val = parseInt(document.getElementById('depositInput').value);
  const msg = document.getElementById('depMsg');
  if (!val || val < 1000) { msg.textContent = 'Enter at least ₫1,000'; return; }
  balance += val;
  document.getElementById('depositInput').value = '';
  msg.textContent = fmt(val) + ' deposited!';
  setTimeout(() => { msg.textContent = ''; }, 2000);
  updateUI();
}

function clearChips() {
  ['chip1k', 'chip5k', 'chip10k', 'chip50k', 'chipAll'].forEach(id =>
    document.getElementById(id).classList.remove('active')
  );
}

function setBet(amount) {
  if (balance === 0) { showDepMsg('Deposit funds first!'); return; }
  if (amount > balance) amount = balance;
  currentBet = amount;
  clearChips();
  const map = { 1000: 'chip1k', 5000: 'chip5k', 10000: 'chip10k', 50000: 'chip50k' };
  if (map[amount]) document.getElementById(map[amount]).classList.add('active');
  updateUI();
}

function setBetAll() {
  if (balance === 0) { showDepMsg('Deposit funds first!'); return; }
  currentBet = balance;
  clearChips();
  document.getElementById('chipAll').classList.add('active');
  updateUI();
}

function setCustomBet() {
  const val = parseInt(document.getElementById('customBet').value);
  if (!val || val < 1) return;
  currentBet = val > balance ? balance : val;
  clearChips();
  document.getElementById('customBet').value = '';
  updateUI();
}

function showDepMsg(txt) {
  const msg = document.getElementById('depMsg');
  msg.textContent = txt;
  setTimeout(() => { msg.textContent = ''; }, 2000);
}

function chooseSide(c) {
  userSide = c;
  document.getElementById('btnTai').className = 'bet-btn' + (c === 'Tai' ? ' active-tai' : '');
  document.getElementById('btnXiu').className = 'bet-btn' + (c === 'Xiu' ? ' active-xiu' : '');
}

function isHighBet() {
  return balance > 0 && (currentBet / balance) >= HIGH_BET_THRESHOLD;
}

function addHistoryRow(entry) {
  const empty = document.getElementById('historyEmpty');
  const list  = document.getElementById('historyList');
  empty.style.display = 'none';

  const row = document.createElement('div');
  row.className = 'history-row';
  row.innerHTML = `
    <span class="h-round">#${entry.round}</span>
    <div class="h-dice">
      <div class="h-die">${entry.d1}</div>
      <div class="h-die">${entry.d2}</div>
      <div class="h-die">${entry.d3}</div>
    </div>
    <span class="h-sum">${entry.sum}</span>
    <span class="h-badge ${entry.result.toLowerCase()}">${entry.result === 'Tai' ? 'Tài' : 'Xỉu'}</span>
    <span class="h-choice">
      <span class="dot ${entry.choice.toLowerCase()}"></span>
      ${entry.choice === 'Tai' ? 'Tài' : 'Xỉu'}
    </span>
    <span class="h-spacer"></span>
    <span class="h-amount ${entry.won ? 'win' : 'lose'}">
      ${entry.won ? '+' : '-'}${fmt(entry.bet)}
    </span>
  `;
  list.prepend(row);
}

function clearHistory() {
  history = [];
  document.getElementById('historyList').innerHTML = '';
  document.getElementById('historyEmpty').style.display = '';
}

function roll() {
  const badge = document.getElementById('resultBadge');
  const msg   = document.getElementById('outcomeMsg');
  badge.className = 'result-badge';
  msg.className   = 'outcome-msg';

  if (balance === 0)   { msg.textContent = 'Deposit funds to play!';     msg.className = 'outcome-msg show warn'; return; }
  if (currentBet === 0){ msg.textContent = 'Set a bet amount first!';     msg.className = 'outcome-msg show warn'; return; }
  if (!userSide)        { msg.textContent = 'Choose Tài or Xỉu first!'; msg.className = 'outcome-msg show warn'; return; }

  ['d1', 'd2', 'd3'].forEach(id => {
    const d = document.getElementById(id);
    d.classList.remove('rolling');
    void d.offsetWidth;
    d.classList.add('rolling');
  });

  setTimeout(() => {
    let r1, r2, r3, sum, result;

    if (isHighBet()) {
      const forcedSide = userSide === 'Tai' ? 'Xiu' : 'Tai';
      do {
        r1 = Math.floor(Math.random() * 6) + 1;
        r2 = Math.floor(Math.random() * 6) + 1;
        r3 = Math.floor(Math.random() * 6) + 1;
        sum = r1 + r2 + r3;
        result = sum <= 10 ? 'Xiu' : 'Tai';
      } while (result !== forcedSide);
    } else {
      r1 = Math.floor(Math.random() * 6) + 1;
      r2 = Math.floor(Math.random() * 6) + 1;
      r3 = Math.floor(Math.random() * 6) + 1;
      sum = r1 + r2 + r3;
      result = sum <= 10 ? 'Xiu' : 'Tai';
    }

    document.getElementById('d1').textContent = r1;
    document.getElementById('d2').textContent = r2;
    document.getElementById('d3').textContent = r3;
    document.getElementById('sumNum').textContent = sum;

    badge.textContent = result === 'Tai' ? 'Tài' : 'Xỉu';
    badge.className = 'result-badge show ' + result.toLowerCase();

    const won = userSide === result;
    round++;

    if (won) {
      balance += currentBet;
      pnl     += currentBet;
      msg.textContent = '✦ Thắng! +' + fmt(currentBet);
      msg.className   = 'outcome-msg show win';
    } else {
      balance -= currentBet;
      pnl     -= currentBet;
      msg.textContent = '✦ Thua! -' + fmt(currentBet);
      msg.className   = 'outcome-msg show lose';
    }

    addHistoryRow({ round, d1: r1, d2: r2, d3: r3, sum, result, choice: userSide, bet: currentBet, won });

    currentBet = 0;
    clearChips();

    if (balance === 0) {
      setTimeout(() => {
        msg.textContent = 'Out of funds — deposit to continue!';
        msg.className   = 'outcome-msg show warn';
      }, 600);
    }

    updateUI();
  }, 450);
}

updateUI();
