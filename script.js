// Menu toggle
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

// Data
let transactions = JSON.parse(localStorage.getItem('transactions')||'[]');
let anggota = JSON.parse(localStorage.getItem('anggota')||'[]');
let editingIndex = null;

// Elements
const form = document.getElementById('transactionForm');
const transactionsDiv = document.getElementById('transactions');
const searchNote = document.getElementById('searchNote');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const applyFilterBtn = document.getElementById('applyFilter');
const exportBtn = document.getElementById('exportBtn');
const exportOptions = document.getElementById('exportOptions');

const cardSaldo = document.getElementById('card-saldo');
const cardPemasukan = document.getElementById('card-pemasukan');
const cardPengeluaran = document.getElementById('card-pengeluaran');

// Anggota
const anggotaForm = document.getElementById('anggotaForm');
const anggotaList = document.getElementById('anggotaList');
const anggotaName = document.getElementById('anggotaName');

// Format number
const formatNumber = n=>Number(n).toLocaleString('id-ID');

// Render Functions
function updateSummary(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const saldo = pemasukan - pengeluaran;
  cardSaldo.textContent = `Saldo: Rp ${formatNumber(saldo)}`;
  cardPemasukan.textContent = `Pemasukan: Rp ${formatNumber(pemasukan)}`;
  cardPengeluaran.textContent = `Pengeluaran: Rp ${formatNumber(pengeluaran)}`;
}

function renderTransactions(){
  transactionsDiv.innerHTML='';
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
  const search = searchNote.value.toLowerCase();

  transactions.forEach((t,i)=>{
    const tDate = new Date(t.date);
    if(startDate && tDate<startDate) return;
    if(endDate && tDate>endDate) return;
    if(search && !t.note.toLowerCase().includes(search)) return;

    const tDiv = document.createElement('div'); tDiv.className='transaction';
    const header = document.createElement('div'); header.className='transaction-header';
    const span = document.createElement('span'); span.textContent = `${i+1}. ${t.type}: Rp ${formatNumber(t.amount)} - ${t.note} (${t.date})`;

    const actions = document.createElement('div'); actions.className='actions';
    const editBtn = document.createElement('span'); editBtn.className='edit'; editBtn.textContent='✎';
    editBtn.addEventListener('click', ()=>{
      editingIndex=i;
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
    });

    // Status edit button
    const statusBtn = document.createElement('button'); statusBtn.className='status-btn';
    statusBtn.textContent='Status';
    statusBtn.addEventListener('click', ()=>{
      if(t.history && t.history.length>0){
        alert(t.history.map(h=>`[${h.date}] ${h.type}: Rp ${formatNumber(h.amount)} - ${h.note}`).join('\n'));
      } else {
        alert('Belum diedit.');
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(statusBtn);

    header.appendChild(span); header.appendChild(actions);
    tDiv.appendChild(header);

    transactionsDiv.appendChild(tDiv);
  });
  updateSummary();
}

// Form Submit
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  const now = new Date().toLocaleString('id-ID');

  if(editingIndex!==null){
    if(!transactions[editingIndex].history) transactions[editingIndex].history=[];
    transactions[editingIndex].history.push({...transactions[editingIndex]});
    transactions[editingIndex] = {type, amount, note, date: now, history: transactions[editingIndex].history};
    editingIndex=null;
  } else {
    transactions.push({type, amount, note, date: now, history: []});
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  form.reset();
  renderTransactions();
  updateChart();
});

// Filter
applyFilterBtn.addEventListener('click', renderTransactions);

// Export
exportBtn.addEventListener('click', ()=> exportOptions.classList.toggle('hidden'));
exportOptions.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const type = btn.dataset.type;
    let csv = "Jenis,Jumlah,Keterangan,Tanggal\n";
    transactions.forEach(t=> csv+=`${t.type},${t.amount},"${t.note}",${t.date}\n`);
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`transaksi.${type}`; a.click();
    URL.revokeObjectURL(url);
    exportOptions.classList.add('hidden');
  });
});

// Anggota
function renderAnggota(){
  anggotaList.innerHTML='';
  anggota.forEach((a,i)=>{
    const li = document.createElement('li');
    li.textContent = a;
    const delBtn = document.createElement('button'); delBtn.textContent='×';
    delBtn.addEventListener('click', ()=>{
      anggota.splice(i,1);
      localStorage.setItem('anggota', JSON.stringify(anggota));
      renderAnggota();
    });
    li.appendChild(delBtn);
    anggotaList.appendChild(li);
  });
}

anggotaForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = anggotaName.value.trim();
  if(name){ anggota.push(name); localStorage.setItem('anggota', JSON.stringify(anggota)); anggotaName.value=''; renderAnggota(); }
});

// Chart.js
const ctx = document.getElementById('transactionChart').getContext('2d');
let chart;
function updateChart(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const data = { labels:['Pemasukan','Pengeluaran'], datasets:[{label:'Jumlah (Rp)', data:[pemasukan,pengeluaran], backgroundColor:['#4CAF50','#F44336']}] };
  if(chart) chart.destroy();
  chart = new Chart(ctx, { type:'bar', data:data, options:{ responsive:true, plugins:{ legend:{display:false}, title:{display:true, text:'Grafik Transaksi'} } } });
}

// Init
renderTransactions();
renderAnggota();
updateChart();
