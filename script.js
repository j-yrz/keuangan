// ===== Data transaksi & anggota =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;
let selectedAnggota = "";

// ===== DOM Elements =====
const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const form = document.getElementById('transactionForm');
const transactionDate = document.getElementById('transactionDate');
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

// Dropdown anggota
const anggotaBtn = document.getElementById('anggotaBtn');
const anggotaList = document.getElementById('anggotaList');
const newAnggotaInput = document.getElementById('newAnggotaInput');
const addAnggotaBtn = document.getElementById('addAnggotaBtn');

// ===== Toggle Menu Mobile =====
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', ()=> navMenu.classList.toggle('show'));

// ===== Toggle Saldo =====
let saldoVisible = true;
toggleSaldo.addEventListener('click', ()=>{
  saldoVisible = !saldoVisible;
  saldoCard.textContent = saldoVisible ? `Saldo: Rp ${calculateSaldo()}` : 'Saldo: ****';
  saldoCard.appendChild(toggleSaldo);
});

// ===== Modal Form =====
showFormBtn.addEventListener('click', ()=> openForm());
closeBtn.addEventListener('click', ()=> closeForm());
document.getElementById('cancelBtn').addEventListener('click', ()=> closeForm());
window.addEventListener('click', e=> { if(e.target===formModal) closeForm(); });

function openForm(){
  form.reset();
  transactionDate.value = new Date().toISOString().split('T')[0];
  selectedAnggota = "";
  anggotaBtn.textContent = "Pilih Anggota ▼";
  anggotaList.innerHTML = "";
  renderAnggotaDropdown();
  editingIndex = null;
  formModal.style.display='flex';
}

function closeForm(){
  formModal.style.display='none';
}

// ===== Tanggal otomatis =====
transactionDate.value = new Date().toISOString().split('T')[0];

// ===== Render Dropdown Anggota =====
function renderAnggotaDropdown(){
  anggotaList.innerHTML = "";
  anggota.forEach((a, idx)=>{
    const li = document.createElement('li');
    li.classList.add('dropdown-item');
    li.innerHTML = `<span>${a}</span> <span class="hapusAnggota" data-index="${idx}">❌</span>`;
    anggotaList.appendChild(li);

    // Pilih anggota
    li.querySelector('span:first-child').addEventListener('click', ()=>{
      selectedAnggota = a;
      anggotaBtn.textContent = a + " ▼";
      anggotaList.classList.remove('show');
    });

    // Hapus anggota dari dropdown (tidak hapus history)
    li.querySelector('.hapusAnggota').addEventListener('click', (e)=>{
      e.stopPropagation();
      anggota.splice(idx,1);
      localStorage.setItem('anggota', JSON.stringify(anggota));
      renderAnggotaDropdown();
    });
  });
}

// Toggle dropdown
anggotaBtn.addEventListener('click', ()=>{
  anggotaList.classList.toggle('show');
});

// Tambah anggota baru
addAnggotaBtn.addEventListener('click', ()=>{
  const val = newAnggotaInput.value.trim();
  if(val && !anggota.includes(val)){
    anggota.push(val);
    localStorage.setItem('anggota', JSON.stringify(anggota));
    renderAnggotaDropdown();
    newAnggotaInput.value='';
  }
});

// ===== Calculate Summary =====
function calculateSaldo(){
  let pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  let pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  return pemasukan - pengeluaran;
}

function updateSummary(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  saldoCard.textContent = saldoVisible ? `Saldo: Rp ${calculateSaldo()}` : 'Saldo: ****';
  saldoCard.appendChild(toggleSaldo);
  pemasukanCard.textContent = `Pemasukan: Rp ${pemasukan}`;
  pengeluaranCard.textContent = `Pengeluaran: Rp ${pengeluaran}`;
}

// ===== Render Table =====
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
      </td>
    `;
    transactionsTableBody.appendChild(tr);

    // Edit
    tr.querySelector('.editBtn').addEventListener('click', ()=>{
      editingIndex = i;
      openForm();
      document.getElementById('type').value = t.type;
      document.getElementById('amount').value = t.amount;
      document.getElementById('note').value = t.note;
      transactionDate.value = t.date;
      document.getElementById('deskripsi').value = t.deskripsi;
      document.getElementById('sumberDana').value = t.sumberDana;
      selectedAnggota = t.anggota;
      anggotaBtn.textContent = t.anggota + " ▼";
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

// ===== Submit Form =====
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const note = document.getElementById('note').value;
  const date = transactionDate.value;
  const deskripsi = document.getElementById('deskripsi').value;
  const sumberDana = document.getElementById('sumberDana').value;
  const anggotaVal = selectedAnggota;

  if(!anggotaVal){ alert("Pilih anggota"); return; }

  const transaction = {type, amount, note, date, deskripsi, sumberDana, anggota: anggotaVal};
  if(editingIndex!==null){
    transactions[editingIndex] = transaction;
    editingIndex = null;
  } else transactions.push(transaction);

  localStorage.setItem('transactions', JSON.stringify(transactions));
  closeForm();
  form.reset();
  transactionDate.value = new Date().toISOString().split('T')[0];
  selectedAnggota = "";
  anggotaBtn.textContent = "Pilih Anggota ▼";

  renderTransactionsTable();
  updateSummary();
  updateChart();
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

// ===== Select All Checkbox =====
checkAll.addEventListener('change', ()=>{
  const checked = checkAll.checked;
  document.querySelectorAll('.rowCheckbox').forEach(cb=>cb.checked = checked);
  deleteSelectedBtn.style.display = checked ? 'inline-block':'none';
});

// ===== Apply Filter =====
applyFilterBtn.addEventListener('click', e=>{
  e.preventDefault();
  renderTransactionsTable();
});

// ===== Export =====
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
document.querySelectorAll('main section').forEach(sec=>sec.style.display='none');
document.getElementById('home').style.display='block';
renderAnggotaDropdown();
renderTransactionsTable();
updateSummary();
updateChart();
