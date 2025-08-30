// ===== Data =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;

// ===== DOM Elements =====
const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const form = document.getElementById('transactionForm');
const transactionDate = document.getElementById('transactionDate');
const typeInput = document.getElementById('type');
const transactionAnggotaInput = document.getElementById('transactionAnggotaInput');
const anggotaPopup = document.getElementById('anggotaPopup');
const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const filterAnggota = document.getElementById('filterAnggota');
const applyFilterBtn = document.getElementById('applyFilter');
const toggleSaldo = document.getElementById('toggleSaldo');
const sections = document.querySelectorAll('main section');

// Summary Cards
const saldoCard = document.getElementById('card-saldo');
const pemasukanCard = document.getElementById('card-pemasukan');
const pengeluaranCard = document.getElementById('card-pengeluaran');

// Menu
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

// Chart
const ctx = document.getElementById('transactionChart').getContext('2d');
let chart;

// ===== Helper =====
function formatRupiah(number){
  return "Rp " + Number(number).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
}

// ===== Mobile menu toggle =====
menuToggle.addEventListener('click', ()=> navMenu.classList.toggle('show'));

// ===== Toggle saldo visibility =====
let saldoVisible = true;
toggleSaldo.addEventListener('click', ()=>{
  saldoVisible = !saldoVisible;
  updateSummary();
});

// ===== Auto-set date =====
transactionDate.value = new Date().toISOString().split('T')[0];

// ===== Modal Form =====
function openForm(){ formModal.style.display='flex'; }
function closeForm(){ formModal.style.display='none'; }
showFormBtn.addEventListener('click', openForm);
closeBtn.addEventListener('click', closeForm);
document.getElementById('batalForm').addEventListener('click', closeForm);
window.addEventListener('click', e=>{
  if(e.target===formModal) closeForm();
});

// ===== Popup Anggota Minimalis ala pilih jenis =====
transactionAnggotaInput.addEventListener('click', e=>{
  e.stopPropagation();
  anggotaPopup.style.display = anggotaPopup.style.display==='block'?'none':'block';
  renderAnggotaPopup();
});

// Hide popup when clicking outside
document.addEventListener('click', e=>{
  if(!anggotaPopup.contains(e.target) && e.target!==transactionAnggotaInput){
    anggotaPopup.style.display='none';
  }
});

// Render anggota popup
function renderAnggotaPopup(){
  anggotaPopup.innerHTML='';
  anggota.forEach(a=>{
    const div = document.createElement('div');
    div.className='popupItem';
    div.textContent = a;
    const removeBtn = document.createElement('span');
    removeBtn.textContent = '✖';
    removeBtn.className='hapusAnggota';
    removeBtn.onclick = (e)=>{
      e.stopPropagation();
      anggota = anggota.filter(x=>x!==a);
      renderAnggotaPopup();
      renderAnggotaDropdown();
    };
    div.appendChild(removeBtn);
    div.addEventListener('click', ()=>{
      transactionAnggotaInput.value = a;
      anggotaPopup.style.display='none';
    });
    anggotaPopup.appendChild(div);
  });

  // Input tambah anggota baru
  const addDiv = document.createElement('div');
  addDiv.style.display='flex';
  addDiv.style.marginTop='5px';
  const input = document.createElement('input');
  input.placeholder='Tambah anggota baru';
  input.style.flex='1';
  const addBtn = document.createElement('button');
  addBtn.type='button';
  addBtn.textContent='Tambah';
  addBtn.onclick = ()=>{
    const val=input.value.trim();
    if(val && !anggota.includes(val)){
      anggota.push(val);
      input.value='';
      renderAnggotaPopup();
      renderAnggotaDropdown();
    }
  };
  addDiv.appendChild(input);
  addDiv.appendChild(addBtn);
  anggotaPopup.appendChild(addDiv);
}

// ===== Render Anggota Dropdown Filter =====
function renderAnggotaDropdown(){
  filterAnggota.innerHTML='<option value="">Semua Anggota</option>';
  anggota.forEach(a=>{
    const opt=document.createElement('option');
    opt.value=a; opt.textContent=a;
    filterAnggota.appendChild(opt);
  });
}

// ===== Summary =====
function calculateSaldo(){
  let pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  let pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  return pemasukan - pengeluaran;
}
function updateSummary(){
  const pemasukan = transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran = transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  saldoCard.textContent = saldoVisible ? `Saldo: ${formatRupiah(calculateSaldo())}` : 'Saldo: ****';
  saldoCard.appendChild(toggleSaldo);
  pemasukanCard.textContent = `Pemasukan: ${formatRupiah(pemasukan)}`;
  pengeluaranCard.textContent = `Pengeluaran: ${formatRupiah(pengeluaran)}`;
}

// ===== Render Transactions Table =====
function renderTransactionsTable(){
  transactionsTableBody.innerHTML='';
  const typeFilterVal=document.getElementById('filterType').value;
  const anggotaFilterVal=filterAnggota.value;
  const searchNoteVal=document.getElementById('searchNote').value.toLowerCase();

  transactions.forEach((t,i)=>{
    if(typeFilterVal && t.type!==typeFilterVal) return;
    if(anggotaFilterVal && t.anggota!==anggotaFilterVal) return;
    if(searchNoteVal && !t.note.toLowerCase().includes(searchNoteVal)) return;

    const tr=document.createElement('tr');
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
      openForm();
      typeInput.value=t.type;
      transactionDate.value=t.date;
      transactionAnggotaInput.value=t.anggota;
      document.getElementById('sumberDana').value=t.sumberDana;
      document.getElementById('note').value=t.note;
      document.getElementById('amount').value=t.amount;
      document.getElementById('deskripsi').value=t.deskripsi;
    });

    // Status
    tr.querySelector('.statusBtn').addEventListener('click', ()=>{
      alert(`Transaksi terakhir diedit pada: ${t.edited? t.edited:'Belum diedit'}\nKeterangan: ${t.note}`);
    });
  });

  // Checkbox logic
  document.querySelectorAll('.rowCheckbox').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      deleteSelectedBtn.style.display=document.querySelectorAll('.rowCheckbox:checked').length>0?'inline-block':'none';
    });
  });
}

// ===== Form Submit =====
form.addEventListener('submit', e=>{
  e.preventDefault();
  const type=typeInput.value;
  const date=transactionDate.value;
  const anggotaVal=transactionAnggotaInput.value.trim();
  const sumberDana=document.getElementById('sumberDana').value.trim();
  const note=document.getElementById('note').value.trim();
  const amount=document.getElementById('amount').value.trim();
  const deskripsi=document.getElementById('deskripsi').value.trim();

  if(!type || !anggotaVal || !amount) return alert("Lengkapi form!");

  const transaction={type,date,anggota:anggotaVal,sumberDana,note,amount,deskripsi,edited:null};
  if(editingIndex!==null){
    transaction.edited=new Date().toLocaleString();
    transactions[editingIndex]=transaction;
    editingIndex=null;
  } else transactions.push(transaction);

  localStorage.setItem('transactions',JSON.stringify(transactions));
  form.reset();
  transactionDate.value=new Date().toISOString().split('T')[0];
  closeForm();
  renderTransactionsTable();
  updateSummary();
  updateChart();
});

// ===== Chart =====
function updateChart(){
  const pemasukan=transactions.filter(t=>t.type==='Pemasukan').reduce((a,b)=>a+Number(b.amount),0);
  const pengeluaran=transactions.filter(t=>t.type==='Pengeluaran').reduce((a,b)=>a+Number(b.amount),0);
  const data={labels:['Pemasukan','Pengeluaran'],datasets:[{label:'Jumlah (Rp)',data:[pemasukan,pengeluaran],backgroundColor:['#4CAF50','#F44336']}]};
  if(chart) chart.destroy();
  chart=new Chart(ctx,{type:'bar',data:data,options:{responsive:true,plugins:{legend:{display:false},title:{display:true,text:'Grafik Transaksi'}}}});
}

// ===== Filters =====
applyFilterBtn.addEventListener('click', e=>{
  e.preventDefault();
  renderTransactionsTable();
});

// ===== Init =====
sections.forEach(s=>s.style.display='none');
document.getElementById('home').style.display='block';
renderAnggotaDropdown();
renderTransactionsTable();
updateSummary();
updateChart();
