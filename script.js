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
const newAnggotaInput = document.getElementById('newAnggota');
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

// ===== Menu Toggle Mobile =====
menuToggle.addEventListener('click', () => navMenu.classList.toggle('show'));

// ===== Navigasi Antar Section =====
menuItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const targetId = item.getAttribute('href').replace('#','');
    sections.forEach(sec => sec.style.display='none');
    document.getElementById(targetId).style.display='block';
    navMenu.classList.remove('show');
  });
});

// ===== Toggle Saldo =====
let saldoVisible = true;
function updateSummary(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  saldoCard.textContent = saldoVisible ? `Saldo: Rp ${pemasukan - pengeluaran}` : 'Saldo: ****';
  saldoCard.appendChild(toggleSaldo);
  pemasukanCard.textContent = `Pemasukan: Rp ${pemasukan}`;
  pengeluaranCard.textContent = `Pengeluaran: Rp ${pengeluaran}`;
}
toggleSaldo.addEventListener('click', () => {
  saldoVisible = !saldoVisible;
  updateSummary();
});

// ===== Modal Form =====
showFormBtn.addEventListener('click', () => formModal.style.display='flex');
closeBtn.addEventListener('click', () => formModal.style.display='none');
window.addEventListener('click', e => { if(e.target === formModal) formModal.style.display='none'; });

// ===== Tanggal Otomatis =====
const transactionDate = document.getElementById('transactionDate');
transactionDate.value = new Date().toISOString().split('T')[0];

// ===== Render Dropdown Anggota =====
function renderAnggotaDropdown(){
  transactionAnggota.innerHTML = '<option value="">Pilih Anggota</option>';
  anggota.forEach(a=>{
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    transactionAnggota.appendChild(opt);
  });

  filterAnggota.innerHTML = '<option value="">Semua Anggota</option>';
  anggota.forEach(a=>{
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    filterAnggota.appendChild(opt);
  });
}

// ===== Render Tabel Transaksi =====
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
      <td>Rp ${t.amount}</td>
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
      formModal.style.display='flex';
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
      document.getElementById('transactionDate').value = t.date;
      document.getElementById('deskripsi').value = t.deskripsi;
      document.getElementById('sumberDana').value = t.sumberDana;
      transactionAnggota.value = t.anggota;
      newAnggotaInput.value='';
    });

    // Status button dummy
    tr.querySelector('.statusBtn').addEventListener('click', ()=>{
      alert(`Transaksi: ${t.note} | Status tombol bisa di kembangkan`);
    });
  });

  // Checkbox logic
  const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
  rowCheckboxes.forEach(cb=>{
    cb.addEventListener('change', ()=>{
      deleteSelectedBtn.style.display = document.querySelectorAll('.rowCheckbox:checked').length > 0 ? 'inline-block':'none';
    });
  });
}

// ===== Submit Form =====
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
  transactionDate.value = new Date().toISOString().split('T')[0];
  renderTransactionsTable();
  updateSummary();
  updateChart();
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
  checkAll.checked=false;
});

// ===== Apply Filter =====
applyFilterBtn.addEventListener('click', e=>{
  e.preventDefault();
  renderTransactionsTable();
});

// ===== Export CSV =====
exportBtn.addEventListener('click', ()=> exportOptions.classList.toggle('hidden'));
exportOptions.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const type = btn.dataset.type;
    let csv = 'Tanggal,Jenis,Jumlah,Keterangan,Deskripsi,SumberDana,Anggota\n';
    transactions.forEach(t=>{
      csv += `${t.date},${t.type},${t.amount},${t.note},${t.deskripsi},${t.sumberDana},${t.anggota}\n`;
    });
    const blob = new Blob([csv], {type:'text/csv'});
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
  chart = new Chart(ctx, { type:'bar', data:data, options:{ responsive:true, plugins:{ legend:{display:false}, title:{display:true, text:'Grafik Transaksi'} } } });
}

// ===== Init =====
sections.forEach(sec=>sec.style.display='none');
document.getElementById('home').style.display='block';
renderAnggotaDropdown();
renderTransactionsTable();
updateSummary();
updateChart();
