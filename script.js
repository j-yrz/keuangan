// Menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', ()=> navMenu.classList.toggle('show'));
document.querySelectorAll('nav a').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    document.querySelectorAll('main section').forEach(sec=>sec.style.display='none');
    if(target) target.style.display='block';
    target.scrollIntoView({behavior:'smooth'});
    navMenu.classList.remove('show');
    if(link.getAttribute('href') === '#grafik') updateChart();
  });
});

// Data
let transactions = JSON.parse(localStorage.getItem('transactions')||'[]');
let anggota = JSON.parse(localStorage.getItem('anggota')||'[]');
let editingIndex = null;

// Elements
const form = document.getElementById('transactionForm');
const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const searchNote = document.getElementById('searchNote');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const applyFilterBtn = document.getElementById('applyFilter');
const exportBtn = document.getElementById('exportBtn');
const exportOptions = document.getElementById('exportOptions');

const cardSaldo = document.getElementById('card-saldo');
const cardPemasukan = document.getElementById('card-pemasukan');
const cardPengeluaran = document.getElementById('card-pengeluaran');

const transactionAnggota = document.getElementById('transactionAnggota');
const anggotaForm = document.getElementById('anggotaForm');
const anggotaList = document.getElementById('anggotaList');
const anggotaName = document.getElementById('anggotaName');

// Format number
const formatNumber = n=>Number(n).toLocaleString('id-ID');

// Render summary
function updateSummary(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const saldo = pemasukan - pengeluaran;
  cardSaldo.textContent = `Saldo: Rp ${formatNumber(saldo)}`;
  cardPemasukan.textContent = `Pemasukan: Rp ${formatNumber(pemasukan)}`;
  cardPengeluaran.textContent = `Pengeluaran: Rp ${formatNumber(pengeluaran)}`;
}

// Render Transactions Table
function renderTransactionsTable(){
  transactionsTableBody.innerHTML='';
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
  const search = searchNote.value.toLowerCase();

  transactions.forEach((t,i)=>{
    const tDate = new Date(t.date);
    if(startDate && tDate<startDate) return;
    if(endDate && tDate>endDate) return;
    if(search && !t.note.toLowerCase().includes(search)) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>Rp ${formatNumber(t.amount)}</td>
      <td>${t.note}</td>
      <td>${t.deskripsi}</td>
      <td>${t.sumberDana}</td>
      <td>${t.anggota}</td>
      <td>
        <button class="editBtn">✎</button>
        <button class="statusBtn">Status</button>
      </td>
    `;
    transactionsTableBody.appendChild(tr);

    tr.querySelector('.editBtn').addEventListener('click', ()=>{
      editingIndex = i;
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
      document.getElementById('transactionDate').value = t.date.split(',')[0];
      document.getElementById('deskripsi').value = t.deskripsi;
      document.getElementById('sumberDana').value = t.sumberDana;
      transactionAnggota.value = t.anggota;
      window.scrollTo({top:0, behavior:'smooth'});
    });

    tr.querySelector('.statusBtn').addEventListener('click', ()=>{
      if(t.history && t.history.length>0){
        alert(t.history.map(h=>`[${h.date}] ${h.type}: Rp ${formatNumber(h.amount)} - ${h.note}`).join('\n'));
      } else alert('Belum diedit.');
    });
  });
  updateSummary();
}

// Form Submit
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  const date = document.getElementById('transactionDate').value;
  const deskripsi = document.getElementById('deskripsi').value;
  const sumberDana = document.getElementById('sumberDana').value;
  const anggotaSelected = transactionAnggota.value;
  const now = new Date().toLocaleString('id-ID');

  if(editingIndex!==null){
    if(!transactions[editingIndex].history) transactions[editingIndex].history=[];
    transactions[editingIndex].history.push({...transactions[editingIndex]});
    transactions[editingIndex] = {type, amount, note, date, deskripsi, sumberDana, anggota: anggotaSelected, history: transactions[editingIndex].history};
    editingIndex=null;
  } else {
    transactions.push({type, amount, note, date, deskripsi, sumberDana, anggota: anggotaSelected, history: []});
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  form.reset();
  renderTransactionsTable();
  updateChart();
});

// Filter
applyFilterBtn.addEventListener('click', renderTransactionsTable);

// Export
exportBtn.addEventListener('click', ()=> exportOptions.classList.toggle('hidden'));
exportOptions.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const type = btn.dataset.type;
    let csv = "Jenis,Jumlah,Keterangan,Anggota,Tanggal,Deskripsi,Sumber Dana\n";
    transactions.forEach(t=> csv+=`${t.type},${t.amount},"${t.note}","${t.anggota}",${t.date},"${t.deskripsi}","${t.sumberDana}"\n`);
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
  transactionAnggota.innerHTML = '<option value="">Pilih Anggota</option>';
  anggota.forEach((a,i)=>{
    const opt = document.createElement('option'); opt.value = a; opt.textContent=a; transactionAnggota.appendChild(opt);
    const li = document.createElement('li'); li.textContent = a;
    const delBtn = document.createElement('button'); delBtn.textContent='×';
    delBtn.addEventListener('click', ()=>{
      anggota.splice(i,1);
      localStorage.setItem('anggota', JSON.stringify(anggota));
      renderAnggota();
    });
    li.appendChild(delBtn); anggotaList.appendChild(li);
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
document.querySelectorAll('main section').forEach(sec=>sec.style.display='none');
document.getElementById('home').style.display='block';
renderTransactionsTable();
renderAnggota();
updateChart();
