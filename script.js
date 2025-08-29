const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', ()=> navMenu.classList.toggle('show'));
document.querySelectorAll('nav a').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({behavior:'smooth'});
    navMenu.classList.remove('show');
  });
});

const form = document.getElementById('transactionForm');
const transactionsDiv = document.getElementById('transactions');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const filterType = document.getElementById('filterType');
const applyFilterBtn = document.getElementById('applyFilter');
const exportBtn = document.getElementById('exportCSV');
const saldoDiv = document.getElementById('saldo');
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let editingIndex = null;

function formatNumber(num){ return Number(num).toLocaleString('id-ID'); }

function updateSaldo(){
  let saldo = transactions.reduce((acc,t)=> t.type==='Pemasukan'? acc+Number(t.amount) : acc-Number(t.amount),0);
  saldoDiv.textContent = `Saldo: Rp ${formatNumber(saldo)}`;
}

function renderTransactions(){
  transactionsDiv.innerHTML='';
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
  const typeFilterVal = filterType.value;

  transactions.forEach((t,i)=>{
    const tDate = new Date(t.date);
    if(startDate && tDate < startDate) return;
    if(endDate && tDate > endDate) return;
    if(typeFilterVal && t.type !== typeFilterVal) return;

    const tDiv = document.createElement('div'); tDiv.className='transaction';
    if(Number(t.amount) > 5000000) tDiv.classList.add('highlight');

    const header = document.createElement('div'); header.className='transaction-header';
    const span = document.createElement('span');
    span.textContent = `${t.type}: Rp ${formatNumber(t.amount)} - ${t.note} (${t.date})`;

    const actions = document.createElement('div'); actions.className='actions';
    const editBtn = document.createElement('span'); editBtn.className='edit'; editBtn.textContent='✎';
    const delBtn = document.createElement('span'); delBtn.className='delete'; delBtn.textContent='×';

    editBtn.addEventListener('click', ()=>{
      editingIndex=i;
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
    });

    delBtn.addEventListener('click', ()=>{
      transactions.splice(i,1);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      renderTransactions();
      updateChart();
      updateSaldo();
    });

    actions.appendChild(editBtn); actions.appendChild(delBtn);
    header.appendChild(span); header.appendChild(actions);
    tDiv.appendChild(header);

    if(t.history && t.history.length>0){
      const hDiv = document.createElement('div'); hDiv.className='history';
      hDiv.innerHTML = t.history.map(h=>`[${h.date}] ${h.type}: Rp ${formatNumber(h.amount)} - ${h.note}`).join('<br>');
      tDiv.appendChild(hDiv);
    }

    transactionsDiv.appendChild(tDiv);
  });
}

form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  const now = new Date().toLocaleString('id-ID');

  if(editingIndex!==null){
    if(!transactions[editingIndex].history) transactions[editingIndex].history=[];
    transactions[editingIndex].history.push({
      type: transactions[editingIndex].type,
      amount: transactions[editingIndex].amount,
      note: transactions[editingIndex].note,
      date: transactions[editingIndex].date
    });
    transactions[editingIndex].type = type;
    transactions[editingIndex].amount = amount;
    transactions[editingIndex].note = note;
    editingIndex = null;
  } else {
    transactions.push({type, amount, note, date: now, history: []});
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  form.reset();
  renderTransactions();
  updateChart();
  updateSaldo();
});

applyFilterBtn.addEventListener('click', renderTransactions);

exportBtn.addEventListener('click', ()=>{
  let csv = "Jenis, Jumlah, Keterangan, Tanggal\n";
  transactions.forEach(t=>{
    csv += `${t.type},${t.amount},"${t.note}",${t.date}\n`;
  });
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download='transaksi.csv'; a.click();
  URL.revokeObjectURL(url);
});

// Chart.js
const ctx = document.getElementById('transactionChart').getContext('2d');
let chart;
function updateChart(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const data = { labels:['Pemasukan','Pengeluaran'], datasets:[{ label:'Jumlah (Rp)', data:[pemasukan,pengeluaran], backgroundColor:['#4CAF50','#F44336'] }] };
  if(chart) chart.destroy();
  chart = new Chart(ctx,{ type:'bar', data:data, options:{ responsive:true, plugins:{ legend:{ display:false }, title:{ display:true, text:'Grafik Transaksi' } } } });
}

renderTransactions();
updateSaldo();
updateChart();
