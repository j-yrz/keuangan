document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dateInput");
  dateInput.value = new Date().toISOString().slice(0,10);

  window.members = JSON.parse(localStorage.getItem("members"))||[];
  window.transactions = JSON.parse(localStorage.getItem("transactions"))||[];
  window.editIndex = null;

  window.memberSelect = document.getElementById("memberSelect");
  renderMembers();
  renderSummary();

  // Input jumlah format
  document.getElementById("amountInput").addEventListener("input", function(){
    let value=this.value.replace(/\D/g,'');
    this.value=value?Number(value).toLocaleString("id-ID"):"";
  });

  document.getElementById("saveBtn").addEventListener("click", saveTransaction);
});

// ----------------- MENU -------------------
function toggleMenu(){
  const menu=document.getElementById("sideMenu");
  menu.style.left = (menu.style.left==="0px") ? "-250px" : "0px";
  toggleAddBtn(false);
}
function toggleAddBtn(show){
  document.getElementById("addNoteBtn").style.display = show?"block":"none";
}

// ----------------- FORM -------------------
function openForm(editIdx=null){
  document.getElementById("formModal").classList.add("show");
  toggleAddBtn(false);
  document.getElementById("formTitle").innerText = editIdx===null?"Tambah Transaksi":"Edit Transaksi";
  if(editIdx!==null){
    let t=transactions[editIdx];
    document.getElementById("dateInput").value=t.date;
    document.getElementById("descInput").value=t.desc;
    document.getElementById("amountInput").value=t.amount.toLocaleString("id-ID");
    document.getElementById("typeInput").value=t.type;
    document.getElementById("memberSelect").value=t.member;
    editIndex=editIdx;
  } else {
    document.getElementById("descInput").value="";
    document.getElementById("amountInput").value="";
    editIndex=null;
  }
}
function closeForm(){
  document.getElementById("formModal").classList.remove("show");
  toggleAddBtn(true);
}
function saveTransaction(){
  const date=document.getElementById("dateInput").value;
  const desc=document.getElementById("descInput").value.trim();
  const amount=parseRupiah(document.getElementById("amountInput").value);
  const type=document.getElementById("typeInput").value;
  const member=memberSelect.value;

  if(!desc||amount<=0){ alert("Isi semua field!"); return; }

  if(editIndex!==null){
    transactions[editIndex]={...transactions[editIndex],date,desc,amount,member,type,status:"Edited"};
  } else {
    transactions.push({date,desc,amount,member,type,status:"Baru"});
  }

  saveData();
  renderHistory();
  renderSummary();
  alert("Transaksi tersimpan!");
  closeForm();
}

// ----------------- HISTORY ----------------
function showHistory(){
  document.getElementById("historyContainer").classList.add("show");
  toggleAddBtn(false);
  renderHistory();
}
function closeHistory(){
  document.getElementById("historyContainer").classList.remove("show");
  toggleAddBtn(true);
}
function renderHistory(){
  const tbody=document.getElementById("historyTable");
  tbody.innerHTML="";
  transactions.forEach((t,i)=>{
    let row=document.createElement("tr");
    row.innerHTML=`
      <td><input type="checkbox" class="rowCheck" data-index="${i}"></td>
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.member||""}</td>
      <td>${formatRupiah(t.amount)}</td>
      <td>${t.type}</td>
      <td class="statusCell">${t.status||""}</td>
      <td><button onclick="openForm(${i})">✏️</button></td>
    `;
    tbody.appendChild(row);
  });

  document.querySelectorAll(".rowCheck").forEach(chk=>{
    chk.addEventListener("change",updateDeleteBtnVisibility);
  });
  document.getElementById("checkAll").addEventListener("change",function(){
    document.querySelectorAll(".rowCheck").forEach(c=>c.checked=this.checked);
    updateDeleteBtnVisibility();
  });
}
function updateDeleteBtnVisibility(){
  const anyChecked=[...document.querySelectorAll(".rowCheck")].some(c=>c.checked);
  document.getElementById("deleteSelectedBtn").style.display=anyChecked?"block":"none";
}
function deleteSelected(){
  let selected=[...document.querySelectorAll(".rowCheck:checked")].map(c=>+c.dataset.index);
  if(selected.length===0) return;
  if(!confirm("Yakin hapus transaksi terpilih?")) return;
  transactions=transactions.filter((_,i)=>!selected.includes(i));
  saveData();
  renderHistory();
  renderSummary();
}

// ----------------- CHART ------------------
function showChart(){ document.getElementById("chartContainer").classList.add("show"); toggleAddBtn(false); renderChart(); }
function closeChart(){ document.getElementById("chartContainer").classList.remove("show"); toggleAddBtn(true); }
function renderChart(){
  let inc=transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+b.amount,0);
  let exp=transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+b.amount,0);
  document.getElementById("incomeBar").style.width=Math.min(100,inc/(inc+exp||1)*100)+"%";
  document.getElementById("expenseBar").style.width=Math.min(100,exp/(inc+exp||1)*100)+"%";
}

// ----------------- RESTORE ----------------
function showRestore(){ document.getElementById("restoreContainer").classList.add("show"); toggleAddBtn(false); }
function closeRestore(){ document.getElementById("restoreContainer").classList.remove("show"); toggleAddBtn(true); }
function restoreAll(){ alert("Fitur restore belum diimplementasi"); }
function deleteAll(){
  if(transactions.length===0) return;
  if(!confirm("Sebelum hapus semua, lakukan export data dulu.\nLanjutkan hapus?")) return;
  transactions=[];
  saveData();
  renderHistory();
  renderSummary();
}

// ----------------- UTIL -------------------
function renderSummary(){
  let inc=transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+b.amount,0);
  let exp=transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+b.amount,0);
  document.getElementById("totalIncome").innerText=formatRupiah(inc);
  document.getElementById("totalExpense").innerText=formatRupiah(exp);
  document.getElementById("balance").innerText=formatRupiah(inc-exp);
}
function formatRupiah(angka){ return "Rp "+angka.toLocaleString("id-ID"); }
function parseRupiah(str){ return Number(str.replace(/[^0-9]/g,""))||0; }
function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); localStorage.setItem("members", JSON.stringify(members)); }
function renderMembers(){ 
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>'; 
  members.forEach(m=>{ memberSelect.innerHTML += `<option value="${m}">${m}</option>`; }); 
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option><option value="-">- Hapus Anggota</option>`;
}
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
    if(members.length===0){ alert("Tidak ada anggota!"); return; }
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

// ----------------- EXPORT -----------------
function exportCSV(){
  let csv = "Tanggal,Deskripsi,Anggota,Pemasukan,Pengeluaran,Status\n";
  transactions.forEach(t=>{
    let pemasukan=t.type==="pemasukan"?t.amount:"";
    let pengeluaran=t.type==="pengeluaran"?t.amount:"";
    csv += `${t.date},${t.desc},${t.member},${pemasukan},${pengeluaran},${t.status||""}\n`;
  });
  let blob=new Blob([csv],{type:"text/csv"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="transaksi.csv";
  a.click();
}
