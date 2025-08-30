// ===== Data =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;

// ===== DOM Elements =====
const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const form = document.getElementById('transactionForm');
const transactionAnggotaInput = document.getElementById('transactionAnggotaInput');
const anggotaPopup = document.getElementById('anggotaPopup');
const newAnggotaInput = document.getElementById('newAnggota');
const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const checkAll = document.getElementById('checkAll');
const filterAnggota = document.getElementById('filterAnggota');
const applyFilterBtn = document.getElementById('applyFilter');
const toggleSaldo = document.getElementById('toggleSaldo');

const saldoCard = document.getElementById('card-saldo');
const pemasukanCard = document.getElementById('card-pemasukan');
const pengeluaranCard = document.getElementById('card-pengeluaran');

// Mobile Menu
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', ()=> navMenu.classList.toggle('show'));
navMenu.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=> navMenu.classList.remove('show'));
});

// Toggle Saldo
let saldoVisible = true;
toggleSaldo.addEventListener('click', ()=>{
  saldoVisible = !saldoVisible;
  updateSummary();
});

// ===== Helper =====
function formatRupiah(num){
  if(isNaN(num)) num = 0;
  return 'Rp '+ Number(num).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
}

// ===== Modal Form =====
showFormBtn.addEventListener('click', ()=> formModal.style.display='flex');
closeBtn.addEventListener('click', ()=> formModal.style.display='none');
document.getElementById('batalForm').addEventListener('click', ()=> formModal.style.display='none');
window.addEventListener('click', e=> { if(e.target===formModal) formModal.style.display='none'; });

// Tanggal otomatis
const transactionDate = document.getElementById('transactionDate');
transactionDate.value = new Date().toISOString().split('T')[0];

// ===== Anggota Dropdown =====
function renderAnggotaDropdown(){
  // Filter dropdown
  filterAnggota.innerHTML = '<option value="">Semua Anggota</option>';
  anggota.forEach(a=>{
    const opt = document.createElement('option'); opt.value=a; opt.textContent=a;
    filterAnggota.appendChild(opt);
  });
}

// Popup anggota
transactionAnggotaInput.addEventListener('click', ()=>{
  anggotaPopup.classList.toggle('hidden');
  renderPopupAnggota();
});

function renderPopupAnggota(){
  anggotaPopup.innerHTML='';
  anggota.forEach(a=>{
    const div = document.createElement('div');
    div.textContent = a;
    const x = document.createElement('span');
    x.textContent='✖'; x.className='hapusAnggota';
    x.addEventListener('click', e=>{
      e.stopPropagation();
      anggota = anggota.filter(name=>name!==a);
      renderPopupAnggota();
      renderAnggotaDropdown();
    });
    div.appendChild(x);
    div.addEventListener('click', ()=> {
      transactionAnggotaInput.value = a;
      anggotaPopup.classList.add('hidden');
    });
    anggotaPopup.appendChild(div);
  });
}

// ===== Summary =====
function calculateSaldo(){
  let pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  let pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  return pemasukan - pengeluaran;
}
function updateSummary(){
  let pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  let pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  saldoCard.textContent = saldoVisible ? formatRupiah(calculateSaldo()) : 'Saldo: ****';
  saldoCard.appendChild(toggleSaldo);
  pemasukanCard.textContent = 'Pemasukan: '+formatRupiah(pemasukan);
  pengeluaranCard.textContent = 'Pengeluaran: '+formatRupiah(pengeluaran);
}

// ===== Transactions Table =====
function renderTransactionsTable(){
  transactionsTableBody.innerHTML = '';
  const typeFilterVal = document.getElementById('filterType').value;
  const anggotaFilterVal = filterAnggota.value;
  const searchNoteVal = document.getElementById('searchNote').value.toLowerCase();

  transactions.forEach((t,i)=>{
    if(typeFilterVal && t.type!==typeFilterVal) return;
    if(anggotaFilterVal && t.anggota!==anggotaFilterVal) return;
    if(searchNoteVal && !t.note.toLowerCase().includes(searchNoteVal)) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="rowCheckbox" data-index="${i}"></td>
      <td>${i+1}</td>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.anggota}</td>
      <td>${t.sumberDana}</td>
      <td>${t.note}</td>
      <td>${formatRupiah(t.amount)}</td>
      <td>${t.deskripsi}</td>
      <td>
        <button class="editBtn">✎</button>
        <button class="statusBtn">Status</button>
      </td>
    `;
    transactionsTableBody.appendChild(tr);

    // Edit
    tr.querySelector('.editBtn').addEventListener('click', ()=>{
      editingIndex=i;
      formModal.style.display='flex';
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
      transactionDate.value = t.date;
      document.getElementById('deskripsi').value = t.deskripsi;
      document.getElementById('sumberDana').value = t.sumberDana;
      transactionAnggotaInput.value = t.anggota;
      newAnggotaInput.value='';
    });

    // Status
    tr.querySelector('.statusBtn').addEventListener('click', ()=>{
      alert(`Transaksi "${t.note}" terakhir diedit: ${t.lastEdited||'Belum Pernah Diedit'}`);
    });
  });

  // Checkbox logic
  const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
  rowCheckboxes.forEach(cb=>{
    cb.addEventListener('change', ()=> {
      deleteSelectedBtn.style.display = document.querySelectorAll('.rowCheckbox:checked').length>0?'inline-block':'none';
    });
  });
}

// Check all
checkAll.addEventListener('change', ()=>{
  const checked = checkAll.checked;
  document.querySelectorAll('.rowCheckbox').forEach(cb=> cb.checked = checked);
  deleteSelectedBtn.style.display = checked?'inline-block':'none';
});

// Apply filter
applyFilterBtn.addEventListener('click', e=>{
  e.preventDefault();
  renderTransactionsTable();
});

// Submit form
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  const date = transactionDate.value;
  const deskripsi = document.getElementById('deskripsi').value;
  const sumberDana = document.getElementById('sumberDana').value;
  let anggotaVal = transactionAnggotaInput.value;
  const newAnggotaVal = newAnggotaInput.value.trim();

  if(newAnggotaVal && !anggota.includes(newAnggotaVal)){
    anggota.push(newAnggotaVal);
    localStorage.setItem('anggota', JSON.stringify(anggota));
    renderAnggotaDropdown();
    anggotaVal = newAnggotaVal;
  }

  const transaction = {type, amount, note, date, deskripsi, sumberDana, anggota: anggotaVal, lastEdited: new Date().toLocaleString('id-ID')};
  if(editingIndex!==null){
    transactions[editingIndex] = transaction;
    editingIndex=null;
  } else transactions.push(transaction);

  localStorage.setItem('transactions', JSON.stringify(transactions));
  form.reset();
  transactionDate.value = new Date().toISOString().split('T')[0];
  transactionAnggotaInput.value='';
  renderTransactionsTable();
  updateSummary();
  formModal.style.display='none';
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

// ===== Chart.js =====
const ctx = document.getElementById('transactionChart').getContext('2d');
let chart;
function updateChart(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const data = { labels:['Pemasukan','Pengeluaran'], datasets:[{label:'Jumlah (Rp)', data:[pemasukan,pengeluaran], backgroundColor:['#4CAF50','#F44336']}] };
  if(chart) chart.destroy();
  chart = new Chart(ctx, { type:'bar', data:data, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, title:{display:true, text:'Grafik Transaksi'} } } });
}

// ===== Backup & Restore =====
const backupBtn = document.getElementById('backupBtn');
const restoreBtn = document.getElementById('restoreBtn');
backupBtn.addEventListener('click', ()=> alert('Popup Backup akan muncul (belum implement)'));
restoreBtn.addEventListener('click', ()=> alert('Popup Restore akan muncul (belum implement)'));

// ===== Init =====
document.querySelectorAll('main section').forEach(sec=>sec.style.display='none');
document.getElementById('home').style.display='block';
renderAnggotaDropdown();
renderTransactionsTable();
updateSummary();
updateChart();
