// ===== Data & DOM =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;

const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('transactionForm');

const transactionDate = document.getElementById('transactionDate');
const typeInput = document.getElementById('type');
const amountInput = document.getElementById('amount');
const noteInput = document.getElementById('note');
const deskripsiInput = document.getElementById('deskripsi');
const sumberDanaInput = document.getElementById('sumberDana');

const saldoCard = document.getElementById('card-saldo');
const pemasukanCard = document.getElementById('card-pemasukan');
const pengeluaranCard = document.getElementById('card-pengeluaran');
const toggleSaldo = document.getElementById('toggleSaldo');

const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const checkAll = document.getElementById('checkAll');

const filterType = document.getElementById('filterType');
const filterAnggotaSelect = document.getElementById('filterAnggota');
const searchNoteInput = document.getElementById('searchNote');
const applyFilterBtn = document.getElementById('applyFilter');

const exportBtn = document.getElementById('exportBtn');
const exportOptions = document.getElementById('exportOptions');

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

const anggotaDropdown = document.getElementById('anggotaDropdown');
const anggotaList = document.getElementById('anggotaList');
const newAnggotaInput = document.getElementById('newAnggotaInput');
const addAnggotaBtn = document.getElementById('addAnggotaBtn');

// ===== Menu Toggle =====
menuToggle.addEventListener('click', ()=> navMenu.classList.toggle('show'));

// ===== Saldo Toggle =====
let saldoVisible = true;
toggleSaldo.addEventListener('click', ()=>{
  saldoVisible = !saldoVisible;
  updateSummary();
});

// ===== Modal Form =====
showFormBtn.addEventListener('click', ()=> openForm());
closeBtn.addEventListener('click', ()=> closeForm());
cancelBtn.addEventListener('click', ()=> closeForm());
window.addEventListener('click', e=> { if(e.target===formModal) closeForm(); });

function openForm() {
  form.reset();
  transactionDate.value = new Date().toISOString().split('T')[0];
  editingIndex = null;
  renderAnggotaDropdown();
  formModal.style.display = 'flex';
}

function closeForm() {
  formModal.style.display = 'none';
}

// ===== Render Dropdown Anggota =====
function renderAnggotaDropdown(selected='') {
  anggotaList.innerHTML = '';
  anggota.forEach((a, idx)=>{
    const div = document.createElement('div');
    div.className='dropdown-item';
    const span = document.createElement('span');
    span.textContent = a;
    if(a===selected) span.classList.add('selected');
    span.addEventListener('click', ()=>{
      document.querySelectorAll('#anggotaList span').forEach(s=>s.classList.remove('selected'));
      span.classList.add('selected');
    });
    const delBtn = document.createElement('button');
    delBtn.type='button';
    delBtn.textContent='❌';
    delBtn.addEventListener('click', ()=>{
      anggota.splice(idx,1);
      localStorage.setItem('anggota',JSON.stringify(anggota));
      renderAnggotaDropdown(selected);
    });
    div.appendChild(span);
    div.appendChild(delBtn);
    anggotaList.appendChild(div);
  });
}

// Ambil anggota yang dipilih
function getSelectedAnggota() {
  const sel = document.querySelector('#anggotaList span.selected');
  return sel ? sel.textContent : '';
}

// Tambah anggota baru
addAnggotaBtn.addEventListener('click', ()=>{
  const val = newAnggotaInput.value.trim();
  if(val && !anggota.includes(val)){
    anggota.push(val);
    localStorage.setItem('anggota', JSON.stringify(anggota));
    newAnggotaInput.value='';
    renderAnggotaDropdown();
  }
});

// ===== Summary =====
function calculateSaldo(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
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
function renderTransactionsTable() {
  transactionsTableBody.innerHTML = '';
  const typeFilterVal = filterType.value;
  const anggotaFilterVal = filterAnggotaSelect.value;
  const searchVal = searchNoteInput.value.toLowerCase();

  transactions.forEach((t,i)=>{
    if(typeFilterVal && t.type!==typeFilterVal) return;
    if(anggotaFilterVal && t.anggota!==anggotaFilterVal) return;
    if(searchVal && !t.note.toLowerCase().includes(searchVal)) return;

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
      <td><button class="editBtn">✎</button></td>
    `;
    transactionsTableBody.appendChild(tr);

    tr.querySelector('.editBtn').addEventListener('click', ()=>{
      editingIndex = i;
      formModal.style.display='flex';
      typeInput.value=t.type;
      amountInput.value=t.amount;
      noteInput.value=t.note;
      transactionDate.value=t.date;
      deskripsiInput.value=t.deskripsi;
      sumberDanaInput.value=t.sumberDana;
      renderAnggotaDropdown(t.anggota);
    });
  });

  document.querySelectorAll('.rowCheckbox').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      deleteSelectedBtn.style.display = document.querySelectorAll('.rowCheckbox:checked').length>0 ? 'inline-block':'none';
    });
  });
}

// ===== Form Submit =====
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type = typeInput.value;
  const amount = amountInput.value;
  const note = noteInput.value;
  const date = transactionDate.value;
  const deskripsi = deskripsiInput.value;
  const sumberDana = sumberDanaInput.value;
  const anggotaVal = getSelectedAnggota();

  if(!anggotaVal){ alert('Pilih anggota'); return; }

  const transaction = {type, amount, note, date, deskripsi, sumberDana, anggota:anggotaVal};

  if(editingIndex!==null){
    transactions[editingIndex] = transaction;
    editingIndex = null;
  } else transactions.push(transaction);

  localStorage.setItem('transactions',JSON.stringify(transactions));
  form.reset();
  transactionDate.value=new Date().toISOString().split('T')[0];
  renderTransactionsTable();
  updateSummary();
  updateChart();
  closeForm();
});

// ===== Delete Selected =====
deleteSelectedBtn.addEventListener('click', ()=>{
  const checkedIndexes = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb=>parseInt(cb.dataset.index));
  transactions = transactions.filter((_,i)=>!checkedIndexes.includes(i));
  localStorage.setItem('transactions',JSON.stringify(transactions));
  renderTransactionsTable();
  updateSummary();
  deleteSelectedBtn.style.display='none';
  checkAll.checked=false;
});

// ===== Check All =====
checkAll.addEventListener('change', ()=>{
  document.querySelectorAll('.rowCheckbox').forEach(cb=>cb.checked=checkAll.checked);
  deleteSelectedBtn.style.display = checkAll.checked ? 'inline-block':'none';
});

// ===== Filter =====
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
    const a=document.createElement('a'); a.href=url; a.download=`transaksi.${type}`; a.click();
    URL.revokeObjectURL(url);
    exportOptions.classList.add('hidden');
  });
});

// ===== Chart =====
const ctx = document.getElementById('transactionChart').getContext('2d');
let chart;
function updateChart(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const data = {
    labels:['Pemasukan','Pengeluaran'],
    datasets:[{label:'Jumlah (Rp)', data:[pemasukan,pengeluaran], backgroundColor:['#4CAF50','#F44336']}]
  };
  if(chart) chart.destroy();
  chart = new Chart(ctx,{
    type:'bar',
    data:data,
    options:{ responsive:true, plugins:{ legend:{display:false}, title:{display:true, text:'Grafik Transaksi'} } }
  });
}

// ===== Init =====
document.querySelectorAll('main section').forEach(sec=>sec.style.display='none');
document.getElementById('home').style.display='block';
renderAnggotaDropdown();
renderTransactionsTable();
updateSummary();
updateChart();
