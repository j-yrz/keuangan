// ===== Data & DOM =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;

const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const form = document.getElementById('transactionForm');
const transactionDate = document.getElementById('transactionDate');
const typeInput = document.getElementById('type');
const transactionAnggotaInput = document.getElementById('transactionAnggotaInput');
const anggotaPopup = document.getElementById('anggotaPopup');
const newAnggotaInput = document.getElementById('newAnggota');
const sumberDanaInput = document.getElementById('sumberDana');
const noteInput = document.getElementById('note');
const amountInput = document.getElementById('amount');
const deskripsiInput = document.getElementById('deskripsi');
const batalFormBtn = document.getElementById('batalForm');

const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const checkAll = document.getElementById('checkAll');
const filterType = document.getElementById('filterType');
const filterAnggota = document.getElementById('filterAnggota');
const applyFilterBtn = document.getElementById('applyFilter');

const saldoCard = document.getElementById('card-saldo');
const pemasukanCard = document.getElementById('card-pemasukan');
const pengeluaranCard = document.getElementById('card-pengeluaran');
const toggleSaldo = document.getElementById('toggleSaldo');

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

const backupBtn = document.getElementById('backupBtn');

// Backup & Restore Elements
const backupModal = document.getElementById('backupModal');
const restoreModal = document.getElementById('restoreModal');
const backupAnggotaSelect = document.getElementById('backupAnggota');
const backupRange = document.getElementById('backupRange');
const backupFormat = document.getElementById('backupFormat');
const backupNowBtn = document.getElementById('backupNow');
const backupCancelBtn = document.getElementById('backupCancel');
const restoreFileInput = document.getElementById('restoreFile');
const restoreBox = document.getElementById('restoreBox');
const restoreNowBtn = document.getElementById('restoreNow');
const restoreCancelBtn = document.getElementById('restoreCancel');

let saldoVisible = true;
let chart;

// ===== Utilities =====
function formatRupiah(number){
  return 'Rp '+Number(number).toLocaleString('id-ID',{minimumFractionDigits:2, maximumFractionDigits:2});
}

// ===== Menu Toggle =====
menuToggle.addEventListener('click', ()=>navMenu.classList.toggle('show'));
navMenu.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=>navMenu.classList.remove('show'));
});

// ===== Toggle Saldo =====
toggleSaldo.addEventListener('click', ()=>{
  saldoVisible = !saldoVisible;
  updateSummary();
});

// ===== Modal Form =====
showFormBtn.addEventListener('click', ()=> formModal.style.display='flex');
closeBtn.addEventListener('click', ()=> formModal.style.display='none');
batalFormBtn.addEventListener('click', ()=> formModal.style.display='none');
window.addEventListener('click', e=>{ if(e.target===formModal) formModal.style.display='none'; });

// Tanggal default
transactionDate.value = new Date().toISOString().split('T')[0];

// ===== Render Anggota =====
function renderAnggotaPopup(){
  anggotaPopup.innerHTML='';
  anggota.forEach(a=>{
    const div = document.createElement('div');
    div.textContent=a;
    const del = document.createElement('span'); del.textContent='✖'; del.className='hapusAnggota';
    del.addEventListener('click', (e)=>{ e.stopPropagation(); anggotaPopup.removeChild(div); });
    div.appendChild(del);
    div.addEventListener('click', ()=>{ transactionAnggotaInput.value=a; anggotaPopup.classList.add('hidden'); });
    anggotaPopup.appendChild(div);
  });
}
transactionAnggotaInput.addEventListener('click', ()=>{
  anggotaPopup.classList.toggle('hidden');
  renderAnggotaPopup();
});

// ===== Summary =====
function calculateSaldo(){
  let pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  let pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  return pemasukan - pengeluaran;
}
function updateSummary(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  saldoCard.textContent = saldoVisible ? formatRupiah(calculateSaldo()) : 'Saldo: ****';
  saldoCard.appendChild(toggleSaldo);
  pemasukanCard.textContent = 'Pemasukan: '+formatRupiah(pemasukan);
  pengeluaranCard.textContent = 'Pengeluaran: '+formatRupiah(pengeluaran);
}

// ===== Render Table =====
function renderTransactionsTable(){
  transactionsTableBody.innerHTML='';
  const typeVal = filterType.value;
  const anggotaVal = filterAnggota.value;
  const searchVal = document.getElementById('searchNote').value.toLowerCase();

  transactions.forEach((t,i)=>{
    if(typeVal && t.type!==typeVal) return;
    if(anggotaVal && t.anggota!==anggotaVal) return;
    if(searchVal && !t.note.toLowerCase().includes(searchVal)) return;

    const tr = document.createElement('tr');
    tr.innerHTML=`
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
      transactionDate.value=t.date;
      typeInput.value=t.type;
      transactionAnggotaInput.value=t.anggota;
      sumberDanaInput.value=t.sumberDana;
      noteInput.value=t.note;
      amountInput.value=t.amount;
      deskripsiInput.value=t.deskripsi;
      newAnggotaInput.value='';
    });

    // Status
    tr.querySelector('.statusBtn').addEventListener('click', ()=>{
      alert(t.lastEdited ? 'Terakhir di edit: '+t.lastEdited : 'Belum pernah diedit');
    });
  });

  // Checkbox
  const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
  rowCheckboxes.forEach(cb=>{
    cb.addEventListener('change', ()=>{
      deleteSelectedBtn.style.display = document.querySelectorAll('.rowCheckbox:checked').length>0 ? 'inline-block':'none';
    });
  });
}

// ===== Form Submit =====
form.addEventListener('submit', e=>{
  e.preventDefault();
  let anggotaVal = transactionAnggotaInput.value;
  const newAnggotaVal = newAnggotaInput.value.trim();
  if(newAnggotaVal && !anggota.includes(newAnggotaVal)){ anggota.push(newAnggotaVal); anggotaVal=newAnggotaVal; }
  const transaction = {
    date: transactionDate.value,
    type: typeInput.value,
    anggota: anggotaVal,
    sumberDana: sumberDanaInput.value,
    note: noteInput.value,
    amount: amountInput.value,
    deskripsi: deskripsiInput.value,
    lastEdited: new Date().toLocaleString('id-ID')
  };
  if(editingIndex!==null){ transactions[editingIndex]=transaction; editingIndex=null; } else transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('anggota', JSON.stringify(anggota));
  form.reset();
  transactionDate.value = new Date().toISOString().split('T')[0];
  renderTransactionsTable();
  updateSummary();
  updateChart();
  formModal.style.display='none';
});

// ===== Delete Selected =====
deleteSelectedBtn.addEventListener('click', ()=>{
  const indexes = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb=>parseInt(cb.dataset.index));
  transactions = transactions.filter((_,i)=>!indexes.includes(i));
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactionsTable();
  updateSummary();
  deleteSelectedBtn.style.display='none';
  checkAll.checked=false;
});

// ===== Filter =====
applyFilterBtn.addEventListener('click', e=>{ e.preventDefault(); renderTransactionsTable(); });

// ===== Chart =====
const ctx = document.getElementById('transactionChart').getContext('2d');
function updateChart(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const data={labels:['Pemasukan','Pengeluaran'], datasets:[{label:'Jumlah (Rp)', data:[pemasukan,pengeluaran], backgroundColor:['#4CAF50','#F44336']}]};
  if(chart) chart.destroy();
  chart = new Chart(ctx,{type:'bar', data:data, options:{responsive:true, plugins:{legend:{display:false}, title:{display:true,text:'Grafik Transaksi'}}}});
}

// ===== Init =====
document.querySelectorAll('main section').forEach(s=>s.style.display='none');
document.getElementById('home').style.display='block';
renderAnggotaPopup();
renderTransactionsTable();
updateSummary();
updateChart();

// ===== Backup & Restore =====
// Backup
backupBtn.addEventListener('click', ()=>{
  backupModal.style.display='flex';
  backupAnggotaSelect.innerHTML='<option value="">Semua Anggota</option>';
  anggota.forEach(a=>{ const opt=document.createElement('option'); opt.value=a; opt.textContent=a; backupAnggotaSelect.appendChild(opt); });
});
document.querySelector('.closeBackup').addEventListener('click', ()=> backupModal.style.display='none');
backupCancelBtn.addEventListener('click', ()=> backupModal.style.display='none');
window.addEventListener('click', e=>{ if(e.target===backupModal) backupModal.style.display='none'; });

// Backup Action
backupNowBtn.addEventListener('click', ()=>{
  let dataToBackup = [...transactions];
  const selAnggota = backupAnggotaSelect.value;
  if(selAnggota) dataToBackup = dataToBackup.filter(t=>t.anggota===selAnggota);
  const csv='Tanggal,Jenis,Anggota,Sumber Dana,Keterangan,Jumlah,Deskripsi\n'+dataToBackup.map(t=>`${t.date},${t.type},${t.anggota},${t.sumberDana},${t.note},${t.amount},${t.deskripsi}`).join('\n');
  const blob=new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='backup_transaksi.csv'; a.click();
  URL.revokeObjectURL(url);
  backupModal.style.display='none';
});

// Restore
document.querySelector('.closeRestore').addEventListener('click', ()=> restoreModal.style.display='none');
restoreCancelBtn.addEventListener('click', ()=> restoreModal.style.display='none');
restoreBox.addEventListener('click', ()=> restoreFileInput.click());
let restoreData = null;
restoreFileInput.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    const text = evt.target.result;
    const lines = text.split('\n').slice(1);
    restoreData = lines.map(line=>{
      const [date,type,anggota,sumberDana,note,amount,deskripsi] = line.split(',');
      return {date,type,anggota,sumberDana,note,amount,deskripsi,lastEdited:new Date().toLocaleString('id-ID')};
    });
  };
  reader.readAsText(file);
});
restoreNowBtn.addEventListener('click', ()=>{
  if(!restoreData){ alert('Silahkan pilih file!'); return; }
  transactions = restoreData;
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactionsTable();
  updateSummary();
  updateChart();
  restoreModal.style.display='none';
  restoreData=null;
});
