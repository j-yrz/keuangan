// Main script
document.addEventListener("DOMContentLoaded",()=>{
  const dateInput = document.getElementById("dateInput");
  dateInput.value = new Date().toISOString().slice(0,10);

  window.members = JSON.parse(localStorage.getItem("members"))||[];
  window.transactions = JSON.parse(localStorage.getItem("transactions"))||[];
  window.memberSelect = document.getElementById("memberSelect");

  renderMembers();
  updateDashboard();
  renderHistory();
  renderChart();

  // Input jumlah format rupiah
  const amountInput = document.getElementById("amountInput");
  amountInput.addEventListener("input",function(e){
    let cursorPos=this.selectionStart;
    let value=this.value.replace(/\D/g,'');
    this.value=value?Number(value).toLocaleString("id-ID"):"";
    this.setSelectionRange(cursorPos,cursorPos);
  });

  document.getElementById("saveBtn").addEventListener("click", addTransaction);
});

// Toggle side menu
function toggleMenu(){
  const menu=document.getElementById("sideMenu");
  const btnAdd=document.getElementById("btnAddNote");
  if(menu.style.left==="0px"){ 
    menu.style.left="-250px"; 
    btnAdd.style.display="block";
  } else { 
    menu.style.left="0px"; 
    btnAdd.style.display="none";
  }
}

// Modal form
function openForm(){ 
  document.getElementById("formModal").classList.add("show"); 
  document.getElementById("btnAddNote").style.display="none";
}
function closeForm(){ 
  document.getElementById("formModal").classList.remove("show"); 
  document.getElementById("btnAddNote").style.display="block";
  // Reset form
  document.getElementById("descInput").value="";
  document.getElementById("amountInput").value="";
  document.getElementById("sourceInput").value="";
  document.getElementById("memberSelect").selectedIndex=0;
}

// Show containers
function showHistory(){ 
  document.getElementById("historyContainer").classList.add("show"); 
  document.getElementById("btnAddNote").style.display="none";
}
function closeHistory(){ 
  document.getElementById("historyContainer").classList.remove("show"); 
  document.getElementById("btnAddNote").style.display="block";
}
function showChart(){ document.getElementById("chartContainer").classList.add("show"); document.getElementById("btnAddNote").style.display="none"; }
function closeChart(){ document.getElementById("chartContainer").classList.remove("show"); document.getElementById("btnAddNote").style.display="block"; }
function showRestore(){ document.getElementById("restoreContainer").classList.add("show"); document.getElementById("btnAddNote").style.display="none"; }
function closeRestore(){ document.getElementById("restoreContainer").classList.remove("show"); document.getElementById("btnAddNote").style.display="block"; }

// Helper
function formatRupiah(angka){ return "Rp "+angka.toLocaleString("id-ID"); }
function parseRupiah(str){ return Number(str.replace(/[^0-9]/g,""))||0; }
function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); localStorage.setItem("members", JSON.stringify(members)); }

function renderMembers(){ 
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>'; 
  members.forEach(m=>{ memberSelect.innerHTML += `<option value="${m}">${m}</option>`; }); 
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option><option value="-">- Hapus Anggota</option>`;
}

// Transaction functions
function addTransaction(){
  const date=document.getElementById("dateInput").value;
  const desc=document.getElementById("descInput").value.trim();
  const amount=parseRupiah(document.getElementById("amountInput").value);
  const member=memberSelect.value;
  const source=document.getElementById("sourceInput").value;

  if(!desc||amount<=0){ showToast("Isi semua field!"); return; }

  transactions.push({
    date, desc, amount, member, source,
    type:document.getElementById("typeInput").value
  });
  saveData();
  showToast("Transaksi tersimpan!");
  closeForm();
  updateDashboard();
  renderHistory();
  renderChart();
}

// Member handling
function memberOptionChange(){
  const val = memberSelect.value;
  if(val === "+"){
    const name = prompt("Masukkan nama anggota baru:").trim();
    if(name && !members.includes(name)){
      members.push(name);
      saveData();
      renderMembers();
    }
  } else if(val === "-"){
    if(members.length===0){ showToast("Tidak ada anggota!"); return; }
    const name = prompt(`Pilih anggota untuk dihapus:\n${members.join(", ")}`);
    if(name && members.includes(name)){
      if(confirm(`Hapus anggota "${name}"?`)){
        members = members.filter(m => m!==name);
        saveData();
        renderMembers();
      }
    }
  }
}

// Dashboard update
function updateDashboard(){
  let income=0,expense=0;
  transactions.forEach(t=>{
    if(t.type==="pemasukan") income+=t.amount;
    else if(t.type==="pengeluaran") expense+=t.amount;
  });
  document.getElementById("homeIncome").textContent=formatRupiah(income);
  document.getElementById("homeExpense").textContent=formatRupiah(expense);
  document.getElementById("homeBalance").textContent=formatRupiah(income-expense);
}

// Render History
function renderHistory(){
  const tbody = document.getElementById("transactionTable");
  tbody.innerHTML="";
  transactions.forEach((t,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td><input type="checkbox" class="rowCheck"></td>
      <td>${i+1}</td>
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.member||""}</td>
      <td>${t.source||""}</td>
      <td>${t.type==="pemasukan"?formatRupiah(t.amount):""}</td>
      <td>${t.type==="pengeluaran"?formatRupiah(t.amount):""}</td>
      <td><button onclick="editTransaction(${i})">✏️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Checkbox select all
function toggleSelectAll(ele){
  const checks=document.querySelectorAll(".rowCheck");
  checks.forEach(c=>c.checked=ele.checked);
}

// Delete selected transactions
function deleteSelected(){
  const checks=document.querySelectorAll(".rowCheck");
  const selectedIndexes=[];
  checks.forEach((c,i)=>{ if(c.checked) selectedIndexes.push(i); });

  if(selectedIndexes.length===0){ showToast("Pilih transaksi untuk dihapus!"); return; }

  if(selectedIndexes.length===transactions.length){
    if(!confirm("Anda akan menghapus semua transaksi! Lakukan export terlebih dahulu. Tetap lanjut?")) return;
  } else {
    if(!confirm("Hapus transaksi terpilih?")) return;
  }

  // Hapus dari akhir untuk index benar
  selectedIndexes.sort((a,b)=>b-a).forEach(idx=>transactions.splice(idx,1));
  saveData();
  updateDashboard();
  renderHistory();
  renderChart();
}

// Edit transaction
function editTransaction(index){
  const t = transactions[index];
  openForm();
  document.getElementById("dateInput").value=t.date;
  document.getElementById("descInput").value=t.desc;
  document.getElementById("amountInput").value=t.amount.toLocaleString("id-ID");
  document.getElementById("sourceInput").value=t.source;
  document.getElementById("memberSelect").value=t.member;
  document.getElementById("typeInput").value=t.type;

  // Update tombol simpan
  const saveBtn=document.getElementById("saveBtn");
  saveBtn.onclick=function(){
    t.date=document.getElementById("dateInput").value;
    t.desc=document.getElementById("descInput").value.trim();
    t.amount=parseRupiah(document.getElementById("amountInput").value);
    t.member=document.getElementById("memberSelect").value;
    t.source=document.getElementById("sourceInput").value;
    t.type=document.getElementById("typeInput").value;

    saveData();
    showToast("Transaksi diperbarui!");
    closeForm();
    updateDashboard();
    renderHistory();
    renderChart();
    // reset tombol
    saveBtn.onclick=addTransaction;
  };
}

// Export CSV
function exportCSV(){
  let csv="Tanggal,Deskripsi,Anggota,Sumber Dana,Pemasukan,Pengeluaran\n";
  transactions.forEach(t=>{
    csv+=`${t.date},${t.desc},${t.member||""},${t.source||""},${t.type==="pemasukan"?t.amount:""},${t.type==="pengeluaran"?t.amount:""}\n`;
  });
  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="laporan_keuangan.csv";
  a.click();
}

// Chart.js
let chartInstance=null;
function renderChart(){
  const canvas=document.getElementById("incomeExpenseChart");
  if(!canvas) return;
  const ctx=canvas.getContext("2d");
  const labels=transactions.map(t=>t.date);
  const dataIncome=transactions.map(t=>t.type==="pemasukan"?t.amount:0);
  const dataExpense=transactions.map(t=>t.type==="pengeluaran"?t.amount:0);
  if(chartInstance) chartInstance.destroy();
  chartInstance=new Chart(ctx,{
    type:"bar",
    data:{
      labels:labels,
      datasets:[
        {label:"Pemasukan", data:dataIncome, backgroundColor:"#28a745"},
        {label:"Pengeluaran", data:dataExpense, backgroundColor:"#dc3545"}
      ]
    },
    options:{responsive:true, plugins:{legend:{position:"top"}}}
  });
}

// Toast notification
function showToast(msg){
  const toast=document.getElementById("toast");
  toast.textContent=msg;
  toast.className="show-toast";
  setTimeout(()=>{ toast.className=""; },3000);
}
