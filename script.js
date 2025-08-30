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
const showFormBtn = document.getElementById('showFormBtn');
const toggleSaldo = document.getElementById('toggleSaldo');
const newAnggotaInput = document.getElementById('newAnggota');
const checkAll = document.getElementById('checkAll');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const filterAnggota = document.getElementById('filterAnggota');
const filterSumberDana = document.getElementById('filterSumberDana');
const filterType = document.getElementById('filterType');

// Format number
const formatNumber = n=>Number(n).toLocaleString('id-ID');

// Toggle form
showFormBtn.addEventListener('click', ()=>{
  if(form.style.display==='none'){
    form.style.display='flex';
    form.scrollIntoView({behavior:'smooth'});
  } else form.style.display='none';
});

// Toggle saldo
let saldoVisible = true;
toggleSaldo.addEventListener('click', ()=>{
  saldoVisible = !saldoVisible;
  updateSummary();
});

// Render anggota dropdown
function renderAnggotaDropdown(){
  transactionAnggota.innerHTML = '<option value="">Pilih Anggota</option>';
  anggota.forEach(a=>{
    const opt = document.createElement('option'); opt.value=a; opt.textContent=a;
    transactionAnggota.appendChild(opt);
  });
  filterAnggota.innerHTML = '<option value="">Semua Anggota</option>';
  anggota.forEach(a=>{
    const opt = document.createElement('option'); opt.value=a; opt.textContent=a;
    filterAnggota.appendChild(opt);
  });
}

// Update summary
function updateSummary(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const saldo = pemasukan - pengeluaran;
  cardSaldo.textContent = saldoVisible ? `Saldo: Rp ${formatNumber(saldo)}` : 'Saldo: •••';
  cardSaldo.appendChild(toggleSaldo);
  cardPemasukan.textContent = `Pemasukan: Rp ${formatNumber(pemasukan)}`;
  cardPengeluaran.textContent = `Pengeluaran: Rp ${formatNumber(pengeluaran)}`;
}

// Render transactions
function renderTransactionsTable(){
  transactionsTableBody.innerHTML='';
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
  const search = searchNote.value.toLowerCase();
  const filterAnggotaVal = filterAnggota.value;
  const filterSumberDanaVal = filterSumberDana.value.toLowerCase();
  const filterTypeVal = filterType.value;

  transactions.forEach((t,i)=>{
    const tDate = new Date(t.date);
    if(startDate && tDate<startDate) return;
    if(endDate && tDate>endDate) return;
    if(search && !t.note.toLowerCase().includes(search)) return;
    if(filterAnggotaVal && t.anggota!==filterAnggotaVal) return;
    if(filterSumberDanaVal && !t.sumberDana.toLowerCase().includes(filterSumberDanaVal)) return;
    if(filterTypeVal && t.type!==filterTypeVal) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="rowCheckbox" data-index="${i}"></td>
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

    // Edit
    tr.querySelector('.editBtn').addEventListener('click', ()=>{
      editingIndex = i;
      form.style.display='flex';
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
      document.getElementById('transactionDate').value = t.date;
      document.getElementById('deskripsi').value = t.deskripsi;
      document.getElementById('sumberDana').value = t.sumberDana;
      transactionAnggota.value = t.anggota;
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  // Checkbox logic
  const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
  rowCheckboxes.forEach(cb=>{
    cb.addEventListener('change', ()=> {
      deleteSelectedBtn.style.display = document.querySelectorAll('.rowCheckbox:checked').length > 0 ? 'inline-block':'none';
    });
  });
}

// Submit form
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  const date = document.getElementById('transactionDate').value;
  const deskripsi = document.getElementById('deskripsi').value;
  const sumberDana = document.getElementById('sumberDana').value;
  let anggotaVal = transactionAnggota.value;
  const newAnggotaVal = newAnggotaInput.value.trim();

  if(newAnggotaVal && !anggota.includes(newAnggotaVal)){
    anggota.push(newAnggotaVal);
    localStorage.setItem('anggota', JSON.stringify(anggota));
    renderAnggotaDropdown();
    anggotaVal = newAnggotaVal;
  }

  const transaction = {type, amount, note, date, deskripsi, sumberDana, anggota: anggotaVal};
  if(editingIndex!==null){
    transactions[editingIndex] = transaction;
    editingIndex = null;
  } else transactions.push(transaction);

  localStorage.setItem('transactions', JSON.stringify(transactions));
  form.reset();
  renderTransactionsTable();
  updateSummary();
});

// Delete selected
deleteSelectedBtn.addEventListener('click', ()=>{
  const checkedIndexes = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb=>parseInt(cb.dataset.index));
  transactions = transactions.filter((_,i)=>!checkedIndexes.includes(i));
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactionsTable();
  updateSummary();
  deleteSelectedBtn.style.display='none';
  checkAll.checked=false;
});

// Apply filter
applyFilterBtn.addEventListener('click', e=>{
  e.preventDefault();
  renderTransactionsTable();
});

// Export CSV
exportBtn.addEventListener('click', ()=> exportOptions.classList.toggle('hidden'));
exportOptions.querySelector('button[data-type="csv"]').addEventListener('click', ()=>{
  let csv = 'Tanggal,Jenis,Jumlah,Keterangan,Deskripsi,SumberDana,Anggota\n';
  transactions.forEach(t=>{
    csv += `${t.date},${t.type},${t.amount},${t.note},${t.deskripsi},${t.sumberDana},${t.anggota}\n`;
  });
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='transaksi.csv'; a.click();
  URL.revokeObjectURL(url);
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
renderAnggotaDropdown();
updateSummary();
