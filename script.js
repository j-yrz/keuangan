// Main script v2
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