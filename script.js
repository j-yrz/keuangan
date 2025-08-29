// Main script + helper functions + toast + dashboard update + chart
document.addEventListener("DOMContentLoaded",()=>{
  const dateInput = document.getElementById("dateInput");
  dateInput.value = new Date().toISOString().slice(0,10);
  window.members = JSON.parse(localStorage.getItem("members"))||[];
  window.transactions = JSON.parse(localStorage.getItem("transactions"))||[];
  window.memberSelect = document.getElementById("memberSelect");
  renderMembers();
  
  // Event input jumlah
  const amountInput = document.getElementById("amountInput");
  amountInput.addEventListener("input",function(e){
    let cursorPos=this.selectionStart;
    let value=this.value.replace(/\D/g,'');
    this.value=value?Number(value).toLocaleString("id-ID"):"";
    this.setSelectionRange(cursorPos,cursorPos);
  });
  
  // Tombol simpan
  document.getElementById("saveBtn").addEventListener("click", addTransaction);
  updateDashboard();
  renderChart();
});

// Toggle side menu
function toggleMenu(){
  const menu=document.getElementById("sideMenu");
  if(menu.style.left==="0px") menu.style.left="-250px";
  else menu.style.left="0px";
}

// Modal and containers
function showHistory(){ document.getElementById("historyContainer").classList.add("show"); }
function closeHistory(){ document.getElementById("historyContainer").classList.remove("show"); }
function showChart(){ document.getElementById("chartContainer").classList.add("show"); }
function closeChart(){ document.getElementById("chartContainer").classList.remove("show"); }
function showRestore(){ document.getElementById("restoreContainer").classList.add("show"); }
function closeRestore(){ document.getElementById("restoreContainer").classList.remove("show"); }
function openForm(){ document.getElementById("formModal").classList.add("show"); }
function closeForm(){ document.getElementById("formModal").classList.remove("show"); }

// Helper functions
function formatRupiah(angka){ return "Rp "+angka.toLocaleString("id-ID"); }
function parseRupiah(str){ return Number(str.replace(/[^0-9]/g,""))||0; }
function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); localStorage.setItem("members", JSON.stringify(members)); }
function renderMembers(){ 
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>'; 
  members.forEach(m=>{ memberSelect.innerHTML += `<option value="${m}">${m}</option>`; }); 
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option><option value="-">- Hapus Anggota</option>`;
}

// Transactions
function addTransaction(){
  const date=document.getElementById("dateInput").value;
  const desc=document.getElementById("descInput").value.trim();
  const amount=parseRupiah(document.getElementById("amountInput").value);
  const member=memberSelect.value;
  if(!desc||amount<=0){ showToast("Isi semua field!"); return; }
  transactions.push({date,desc,amount,member,type:document.getElementById("typeInput").value,source:document.getElementById("sourceInput").value});
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

// Export CSV
function exportCSV(){
  let csv = "Tanggal,Deskripsi,Anggota,Sumber Dana,Pemasukan,Pengeluaran\n";
  transactions.forEach(t=>{
    csv += `${t.date},${t.desc},${t.member||""},${t.source||""},${t.type==="pemasukan"?t.amount:""},${t.type==="pengeluaran"?t.amount:""}\n`;
  });
  let blob = new Blob([csv], { type: "text/csv" });
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "laporan_keuangan.csv";
  a.click();
}

// Dashboard & Chart
function updateDashboard(){
  let income=0,expense=0;
  transactions.forEach(t=>{ if(t.type==="pemasukan") income+=t.amount; else if(t.type==="pengeluaran") expense+=t.amount; });
  document.getElementById("homeIncome").textContent=formatRupiah(income);
  document.getElementById("homeExpense").textContent=formatRupiah(expense);
  document.getElementById("homeBalance").textContent=formatRupiah(income-expense);
}

function renderHistory(){
  const tbody = document.getElementById("transactionTable");
  tbody.innerHTML="";
  transactions.forEach((t,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${i+1}</td><td>${t.date}</td><td>${t.desc}</td><td>${t.member||""}</td><td>${t.source||""}</td><td>${t.type==="pemasukan"?formatRupiah(t.amount):""}</td><td>${t.type==="pengeluaran"?formatRupiah(t.amount):""}</td><td class="statusCell">-</td><td><button onclick="deleteTransaction(${i})">Hapus</button></td>`;
    tbody.appendChild(tr);
  });
}

function deleteTransaction(index){ if(confirm("Hapus transaksi ini?")){ transactions.splice(index,1); saveData(); updateDashboard(); renderHistory(); renderChart(); } }

// Chart.js
let chartInstance=null;
function renderChart(){
  const ctx=document.getElementById("incomeExpenseChart").getContext("2d");
  const labels=transactions.map(t=>t.date);
  const dataIncome=transactions.map(t=>t.type==="pemasukan"?t.amount:0);
  const dataExpense=transactions.map(t=>t.type==="pengeluaran"?t.amount:0);
  if(chartInstance) chartInstance.destroy();
  chartInstance=new Chart(ctx,{type:"bar",data:{labels:labels,datasets:[{label:"Pemasukan",data:dataIncome,backgroundColor:"#28a745"},{label:"Pengeluaran",data:dataExpense,backgroundColor:"#dc3545"}]},options:{responsive:true,plugins:{legend:{position:"top"}}}});
}

// Toast
function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent=msg;
  toast.className="show-toast";
  setTimeout(()=>{ toast.className=""; },3000);
}
