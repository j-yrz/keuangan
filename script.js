// Main script v3
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
});

function toggleMenu(){
  const menu=document.getElementById("sideMenu");
  if(menu.style.left==="0px") menu.style.left="-250px";
  else menu.style.left="0px";
}

// Side menu functions
function showHistory(){ document.getElementById("historyContainer").classList.add("show"); }
function closeHistory(){ document.getElementById("historyContainer").classList.remove("show"); }

function showChart(){ document.getElementById("chartContainer").classList.add("show"); }
function closeChart(){ document.getElementById("chartContainer").classList.remove("show"); }

function showRestore(){ document.getElementById("restoreContainer").classList.add("show"); }
function closeRestore(){ document.getElementById("restoreContainer").classList.remove("show"); }

// Transaction functions
function openForm(){ document.getElementById("formModal").classList.add("show"); }
function closeForm(){ document.getElementById("formModal").classList.remove("show"); }
function addTransaction(){
  const date=document.getElementById("dateInput").value;
  const desc=document.getElementById("descInput").value.trim();
  const amount=parseRupiah(document.getElementById("amountInput").value);
  const member=memberSelect.value;
  if(!desc||amount<=0){ alert("Isi semua field!"); return; }
  transactions.push({date,desc,amount,member,type:document.getElementById("typeInput").value});
  saveData();
  alert("Transaksi tersimpan!");
  closeForm();
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