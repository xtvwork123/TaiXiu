let balance = 0;
let currentBet = 0;
let userSide = '';
let pnl = 0;

// Bet is considered "too high" if it's >= 50% of balance
const HIGH_BET_THRESHOLD = 0.5;

function fmt(n) {
  return '₫' + n.toLocaleString('vi-VN');
}

function updateUI() {
  document.getElementById('balance').textContent = fmt(balance);
  document.getElementById('betDisplay').textContent = fmt(currentBet);
  const pnlEl = document.getElementById('pnl');
  pnlEl.textContent = (pnl >= 0 ? '+' : '') + fmt(pnl);
  pnlEl.className = 'wallet-val' + (pnl > 0 ? ' green' : pnl < 0 ? ' red' : '');
}

function deposit() {
  const val = parseInt(document.getElementById('depositInput').value);
  const msg = document.getElementById('depMsg');
  if (!val || val < 1000) {
    msg.textContent = 'Enter at least ₫1,000';
    return;
  }
  balance += val;
  document.getElementById('depositInput').value = '';
  msg.textContent = fmt(val) + ' deposited!';
  setTimeout(() => { msg.textContent = ''; }, 2000);
  updateUI();
}

function clearChips() {
  ['chip1k', 'chip5k', 'chip10k', 'chip50k', 'chipAll'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
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

function roll() {
  const badge = document.getElementById('resultBadge');
  const msg = document.getElementById('outcomeMsg');
  badge.className = 'result-badge';
  msg.className = 'outcome-msg';

  if (balance === 0) {
    msg.textContent = 'Deposit funds to play!';
    msg.className = 'outcome-msg show warn';
    return;
  }
  if (currentBet === 0) {
    msg.textContent = 'Set a bet amount first!';
    msg.className = 'outcome-msg show warn';
    return;
  }
  if (!userSide) {
    msg.textContent = 'Choose Tài or Xỉu first!';
    msg.className = 'outcome-msg show warn';
    return;
  }

  ['d1', 'd2', 'd3'].forEach(id => {
    const d = document.getElementById(id);
    d.classList.remove('rolling');
    void d.offsetWidth;
    d.classList.add('rolling');
  });

  setTimeout(() => {
    let r1, r2, r3, sum, result;

    if (isHighBet()) {
      // Force a loss: pick dice that land on the opposite side
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
    if (won) {
      balance += currentBet;
      pnl += currentBet;
      msg.textContent = '✦ Thắng! +' + fmt(currentBet);
      msg.className = 'outcome-msg show win';
    } else {
      balance -= currentBet;
      pnl -= currentBet;
      msg.textContent = '✦ Thua! -' + fmt(currentBet);
      msg.className = 'outcome-msg show lose';
    }

    currentBet = 0;
    clearChips();

    if (balance === 0) {
      setTimeout(() => {
        msg.textContent = 'Out of funds — deposit to continue!';
        msg.className = 'outcome-msg show warn';
      }, 600);
    }

    updateUI();
  }, 450);
}

updateUI();
