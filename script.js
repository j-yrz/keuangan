/* ===================== */
/* INISIALISASI & HELPERS */
/* ===================== */
const dateInput = document.getElementById("dateInput");
dateInput.value = new Date().toISOString().slice(0,10);

let members = JSON.parse(localStorage.getItem("members")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const memberSelect = document.getElementById("memberSelect");
const tooltipDiv = document.getElementById("editTooltip");
const saveBtn = document.getElementById("saveBtn");

/* ===================== */
/* FORMAT & PARSE RUPIAH */
/* ===================== */
function formatRupiah(angka){ return "Rp "+angka.toLocaleString("id-ID"); }
function parseRupiah(str){ return Number(str.replace(/[^0-9]/g,""))||0; }

/* ===================== */
/* RENDER MEMBERS         */
/* ===================== */
function renderMembers(){
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>';
  members.forEach(m=>memberSelect.innerHTML+=`<option value="${m}">${m}</option>`);
  memberSelect.innerHTML+=`<option value="+">+ Tambah Anggota</option>`;
  memberSelect.innerHTML+=`<option value="-">- Hapus Anggota</option>`;
}

function memberOptionChange(){
  const val = memberSelect.value;
  if(val==="+"){
    const name = prompt("Masukkan nama anggota baru:").trim();
    if(name && !members.includes(name)){ members.push(name); saveData(); renderMembers(); }
  } else if(val==="-"){
    if(members.length===0){ alert("Tidak ada anggota tersisa!"); return; }
    const name = prompt(`Pilih anggota untuk dihapus:\n${members.join(", ")}`);
    if(name && members.includes(name)){
      if(confirm(`Hapus anggota "${name}"?`)){ members=members.filter(m=>m!==name); saveData(); renderMembers(); }
    }
  }
}

/* ===================== */
/* OPEN / CLOSE FORM MODAL */
/* ===================== */
function openForm(index=null){
  const modal = document.getElementById("formModal");
  modal.style.display="block";
  modal.classList.add("show");
  saveBtn.onclick = ()=>saveTransaction(index);
  if(index!==null){
    const t = transactions[index];
    document.getElementById("formTitle").innerText="Edit Transaksi";
    dateInput.value = t.date;
    document.getElementById("descInput").value = t.desc;
    document.getElementById("amountInput").value = t.amount.toLocaleString("id-ID");
    memberSelect.value = t.member || "";
    document.getElementById("sourceInput").value = t.source;
    document.getElementById("typeInput").value = t.type;
  } else {
    document.getElementById("formTitle").innerText="Tambah Transaksi";
    dateInput.value = new Date().toISOString().slice(0,10);
    document.getElementById("descInput").value = "";
    document.getElementById("amountInput").value = "";
    memberSelect.value = "";
    document.getElementById("sourceInput").value = "";
    document.getElementById("typeInput").value = "pemasukan";
  }
}
function closeForm(){ 
  const modal = document.getElementById("formModal");
  modal.style.display="none";
  modal.classList.remove("show");
}

/* ===================== */
/* TAMBAH / EDIT TRANSAKSI */
/* ===================== */
function saveTransaction(index=null){
  const date = dateInput.value;
  const desc = document.getElementById("descInput").value.trim();
  const amount = parseRupiah(document.getElementById("amountInput").value);
  const member = memberSelect.value;
  const source = document.getElementById("sourceInput").value.trim();
  const type = document.getElementById("typeInput").value;

  if(!desc || amount<=0){ alert("Isi semua field dengan benar!"); return; }

  if(index===null){
    transactions.push({date, desc, amount, type, member:(member==="+"||member==="-")?"":member, source, edited:false, editHistory:[]});
  } else {
    const t = transactions[index];
    const old = {...t};
    t.date=date; t.desc=desc; t.amount=amount; t.member=member; t.source=source; t.type=type; t.edited=true;
    // riwayat edit
    const changes=[];
    if(old.date!==date) changes.push(`Tanggal: ${old.date}→${date}`);
    if(old.desc!==desc) changes.push(`Deskripsi: ${old.desc}→${desc}`);
    if(old.amount!==amount) changes.push(`Jumlah: ${formatRupiah(old.amount)}→${formatRupiah(amount)}`);
    if(old.member!==member) changes.push(`Anggota: ${old.member}→${member}`);
    if(old.source!==source) changes.push(`Sumber: ${old.source}→${source}`);
    if(old.type!==type) changes.push(`Tipe: ${old.type}→${type}`);
    if(changes.length>0) t.editHistory.push({date:new Date().toLocaleString(), changes});
  }
  saveData(); updateHomeSummary(); renderTable(); closeForm();
}

/* ===================== */
/* SAVE & BACKUP          */
/* ===================== */
function saveData(){
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("members", JSON.stringify(members));
}
function backupDaily(){
  const today = new Date().toISOString().slice(0,10);
  const backupKey = `backup_${today}`;
  const backupData = {transactions, members, timestamp: new Date().toLocaleString()};
  localStorage.setItem(backupKey, JSON.stringify(backupData));
}
backupDaily();
setInterval(backupDaily,24*60*60*1000);

/* ===================== */
/* RESTORE BACKUP         */
function showRestore(){
  const container = document.getElementById("restoreContainer");
  container.style.display="block"; container.classList.add("show");
  const select = document.getElementById("backupSelect"); select.innerHTML="";
  for(let key in localStorage){
    if(key.startsWith("backup_")) select.innerHTML+=`<option value="${key}">${key.replace("backup_","")}</option>`;
  }
}
function closeRestore(){
  const container = document.getElementById("restoreContainer");
  container.style.display="none"; container.classList.remove("show");
}
function restoreBackupUI(){
  const key=document.getElementById("backupSelect").value;
  if(!key){ alert("Pilih backup!"); return; }
  const backup = JSON.parse(localStorage.getItem(key));
  if(!backup){ alert("Backup tidak ditemukan!"); return; }
  if(confirm(`Restore backup tanggal ${key.replace("backup_","")}? Data sekarang akan diganti.`)){
    transactions=backup.transactions; members=backup.members;
    saveData(); renderMembers(); updateHomeSummary(); renderTable(); alert("Restore berhasil!");
  }
}

/* ===================== */
/* SIDE MENU              */
function toggleMenu(){
  const menu=document.getElementById("sideMenu");
  menu.style.left=(menu.style.left==="0px")?"-250px":"0px";
}
function showHistory(){ document.getElementById("historyContainer").classList.add("show"); }
function closeHistory(){ document.getElementById("historyContainer").classList.remove("show"); }
function showChart(){ document.getElementById("chartContainer").classList.add("show"); }
function closeChart(){ document.getElementById("chartContainer").classList.remove("show"); }

/* ===================== */
/* HOME SUMMARY & CHART  */
function updateHomeSummary(){
  const income=transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+b.amount,0);
  const expense=transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+b.amount,0);
  document.getElementById("homeIncome").innerText=formatRupiah(income);
  document.getElementById("homeExpense").innerText=formatRupiah(expense);
  document.getElementById("homeBalance").innerText=formatRupiah(income-expense);
  updateChart();
}
function updateChart(){
  const income=transactions.filter(t=>t.type==='pemasukan').reduce((a,b)=>a+b.amount,0);
  const expense=transactions.filter(t=>t.type==='pengeluaran').reduce((a,b)=>a+b.amount,0);
  const total=income+expense||1;
  document.querySelector(".incomeBar").style.width=(income/total*100)+"%";
  document.querySelector(".expenseBar").style.width=(expense/total*100)+"%";
}

/* ===================== */
/* HISTORY TABLE          */
function renderTable(){
  const table=document.getElementById("transactionTable");
  table.innerHTML="";
  transactions.forEach((t,i)=>{
    const statusHTML=t.edited ? `<span class="statusCell" onmouseenter="showTooltip(event,${i})" onmouseleave="hideTooltip()" onclick="openForm(${i})">(diedit)</span>` : "";
    table.innerHTML+=`<tr>
      <td>${i+1}</td>
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.member}</td>
      <td>${t.source}</td>
      <td>${t.type==='pemasukan'?formatRupiah(t.amount):''}</td>
      <td>${t.type==='pengeluaran'?formatRupiah(t.amount):''}</td>
      <td>${statusHTML}</td>
      <td><button onclick="openForm(${i})">✏️ Edit</button></td>
    </tr>`;
  });
}

/* ===================== */
/* TOOLTIP                */
function showTooltip(e,index){
  const t=transactions[index];
  if(!t.editHistory||t.editHistory.length===0) return;
  let html="<strong>Riwayat Edit:</strong><br>";
  t.editHistory.forEach(h=>{ html+=`<em>${h.date}</em><br>`; h.changes.forEach(c=>{ html+=`&nbsp;&nbsp;- ${c}<br>`; }); });
  tooltipDiv.innerHTML=html;
  tooltipDiv.style.display="block"; tooltipDiv.style.opacity="1";
  const rect=e.target.getBoundingClientRect();
  tooltipDiv.style.top=rect.bottom+window.scrollY+5+"px";
  tooltipDiv.style.left=rect.left+window.scrollX+"px";
}
function hideTooltip(){ tooltipDiv.style.opacity="0"; setTimeout(()=>tooltipDiv.style.display="none",300); }

/* ===================== */
/* EXPORT CSV             */
function exportCSV(){
  let csv="Tanggal,Deskripsi,Anggota,Sumber Dana,Pemasukan,Pengeluaran\n";
  transactions.forEach(t=>{
    csv+=`${t.date},${t.desc},${t.member},${t.source},${t.type==='pemasukan'?t.amount:'',}${t.type==='pengeluaran'?t.amount:''}\n`;
  });
  const blob=new Blob([csv],{type:"text/csv"});
  const url=window.URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="laporan_keuangan.csv"; a.click();
}

/* ===================== */
/* INIT                   */
renderMembers();
updateHomeSummary();
renderTable();
