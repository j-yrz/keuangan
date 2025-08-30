// ===== Data Transaksi & Anggota =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;

// ===== DOM Elements =====
const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const form = document.getElementById('transactionForm');
const transactionAnggota = document.getElementById('transactionAnggota');
const newAnggotaInput = document.getElementById('newAnggotaInput');
const addAnggotaBtn = document.getElementById('addAnggotaBtn');
const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const checkAll = document.getElementById('checkAll');
const filterAnggota = document.getElementById('filterAnggota');
const applyFilterBtn = document.getElementById('applyFilter');
const exportBtn = document.getElementById('exportBtn');
const exportOptions = document.getElementById('exportOptions');
const toggleSaldo = document.getElementById('toggleSaldo');

const saldoCard = document.getElementById('card-saldo');
const pemasukanCard = document.getElementById('card-pemasukan');
const pengeluaranCard = document.getElementById('card-pengeluaran');

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const menuItems = document.querySelectorAll('.menuItem');
const sections = document.querySelectorAll('main section');

// ===== Helper: Format Rupiah =====
function formatRupiah(number) {
  return Number(number).toLocaleString('id-ID');
}

// ===== Menu Toggle Mobile =====
menuToggle.addEventListener('click', () => navMenu.classList.toggle('show'));

// ===== Navigasi Antar Section =====
menuItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const targetId = item.getAttribute('href').replace('#', '');
    sections.forEach(sec => sec.style.display = 'none');
    document.getElementById(targetId).style.display = 'block';
    navMenu.classList.remove('show');
  });
});

// ===== Toggle Saldo =====
let saldoVisible = true;
toggleSaldo.textContent = '👁';
toggleSaldo.addEventListener('click', () => {
  saldoVisible = !saldoVisible;
  updateSummary();
});

// ===== Update Summary =====
function updateSummary() {
  const pemasukan = transactions.filter(t => t.type === 'Pemasukan').reduce((a, b) => a + Number(b.amount), 0);
  const pengeluaran = transactions.filter(t => t.type === 'Pengeluaran').reduce((a, b) => a + Number(b.amount), 0);
  saldoCard.textContent = saldoVisible ? `Saldo: Rp ${formatRupiah(pemasukan - pengeluaran)}` : 'Saldo: ****';
  saldoCard.appendChild(toggleSaldo);
  pemasukanCard.textContent = `Pemasukan: Rp ${formatRupiah(pemasukan)}`;
  pengeluaranCard.textContent = `Pengeluaran: Rp ${formatRupiah(pengeluaran)}`;
}

// ===== Render Anggota Dropdown dengan tombol hapus =====
function renderAnggotaDropdown() {
  transactionAnggota.innerHTML = '';
  anggota.forEach(a => {
    const option = document.createElement('option');
    option.value = a;
    option.textContent = a;
    transactionAnggota.appendChild(option);
  });

  filterAnggota.innerHTML = '<option value="">Semua Anggota</option>';
  anggota.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    filterAnggota.appendChild(opt);
  });
}

// ===== Reset Form =====
function resetForm() {
  form.reset();
  document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
  newAnggotaInput.value = '';
  editingIndex = null;
  renderAnggotaDropdown();
}

// ===== Modal Form =====
showFormBtn.addEventListener('click', () => { resetForm(); formModal.style.display = 'flex'; });
closeBtn.addEventListener('click', () => formModal.style.display = 'none');
window.addEventListener('click', e => { if(e.target === formModal) formModal.style.display = 'none'; });
document.getElementById('cancelBtn').addEventListener('click', () => formModal.style.display = 'none');

// ===== Tambah Anggota =====
addAnggotaBtn.addEventListener('click', ()=>{
  const newName = newAnggotaInput.value.trim();
  if(newName && !anggota.includes(newName)){
    anggota.push(newName);
    localStorage.setItem('anggota', JSON.stringify(anggota));
    renderAnggotaDropdown();
    newAnggotaInput.value = '';
  }
});

// ===== Render Transactions Table =====
function renderTransactionsTable() {
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
      <td>Rp ${formatRupiah(t.amount)}</td>
      <td>${t.note}</td>
      <td>${t.deskripsi}</td>
      <td>${t.sumberDana}</td>
      <td>${t.anggota}</td>
      <td><button class="editBtn">✎</button></td>
    `;
    transactionsTableBody.appendChild(tr);

    // ===== Edit Transaction =====
    tr.querySelector('.editBtn').addEventListener('click', ()=>{
      editingIndex = i;
      formModal.style.display='flex';
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
      document.getElementById('transactionDate').value = t.date;
      document.getElementById('deskripsi').value = t.deskripsi;
      document.getElementById('sumberDana').value = t.sumberDana;
      transactionAnggota.value = t.anggota;
    });
  });

  // Checkbox logic
  const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
  rowCheckboxes.forEach(cb=>{
    cb.addEventListener('change', ()=> {
      deleteSelectedBtn.style.display = document.querySelectorAll('.rowCheckbox:checked').length>0?'inline-block':'none';
      checkAll.checked = document.querySelectorAll('.rowCheckbox:checked').length === rowCheckboxes.length;
    });
  });
}

// ===== Checkbox "Check All" =====
checkAll.addEventListener('change', ()=>{
  const checked = checkAll.checked;
  document.querySelectorAll('.rowCheckbox').forEach(cb => cb.checked = checked);
  deleteSelectedBtn.style.display = checked ? 'inline-block' : 'none';
});

// ===== Form Submit =====
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  const date = document.getElementById('transactionDate').value;
  const deskripsi = document.getElementById('deskripsi').value;
  const sumberDana = document.getElementById('sumberDana').value;
  const anggotaVal = transactionAnggota.value;

  const transaction = { type, amount, note, date, deskripsi, sumberDana, anggota: anggotaVal };
  if(editingIndex!==null){
    transactions[editingIndex] = transaction;
    editingIndex = null;
  } else transactions.push(transaction);

  localStorage.setItem('transactions', JSON.stringify(transactions));
  resetForm();
  renderTransactionsTable();
  updateSummary();
  formModal.style.display='none';
});

// ===== Delete Selected =====
deleteSelectedBtn.addEventListener('click', ()=>{
  const checkedIndexes = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb=>parseInt(cb.dataset.index));
  transactions = transactions.filter((_,i)=>!checkedIndexes.includes(i));
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactionsTable();
  updateSummary();
  deleteSelectedBtn.style.display='none';
  checkAll.checked = false;
});

// ===== Apply Filter =====
applyFilterBtn.addEventListener('click', e=>{ e.preventDefault(); renderTransactionsTable(); });

// ===== Export CSV =====
exportBtn.addEventListener('click', ()=> exportOptions.classList.toggle('hidden'));
exportOptions.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const type = btn.dataset.type;
    let csv = 'Tanggal,Jenis,Jumlah,Keterangan,Deskripsi,SumberDana,Anggota\n';
    transactions.forEach(t=>{
      csv += `${t.date},${t.type},${t.amount},${t.note},${t.deskripsi},${t.sumberDana},${t.anggota}\n`;
    });
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`transaksi.${type}`; a.click();
    URL.revokeObjectURL(url);
    exportOptions.classList.add('hidden');
  });
});

// ===== Chart.js =====
const ctx = document.getElementById('transactionChart').getContext('2d');
let chart;
function updateChart(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const data = { labels:['Pemasukan','Pengeluaran'], datasets:[{label:'Jumlah (Rp)', data:[pemasukan,pengeluaran], backgroundColor:['#4CAF50','#F44336']}] };
  if(chart) chart.destroy();
  chart = new Chart(ctx,{ type:'bar', data:data, options:{ responsive:true, plugins:{ legend:{display:false}, title:{display:true,text:'Grafik Transaksi'} } } });
}

// ===== Init =====
sections.forEach(sec => sec.style.display='none');
document.getElementById('home').style.display='block';
resetForm();
renderTransactionsTable();
updateSummary();
updateChart();
