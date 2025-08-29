// Data
let members = JSON.parse(localStorage.getItem("members")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
transactions = transactions.map(t => ({...t, amount: Number(t.amount)||0}));

// Init
const dateInput = document.getElementById("dateInput");
dateInput.value = new Date().toISOString().slice(0,10);

const memberSelect = document.getElementById("memberSelect");
renderMembers();

function renderMembers(){
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>';
  members.forEach(m => memberSelect.innerHTML += `<option value="${m}">${m}</option>`);
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option>`;
}

function openForm(){ document.getElementById("formModal").style.display="flex"; }
function closeForm(){ document.getElementById("formModal").style.display="none"; }

function addTransaction(){
  const date = dateInput.value;
  const desc = document.getElementById("descInput").value.trim();
  const amount = Number(document.getElementById("amountInput").value.replace(/\D/g,""))||0;
  const member = memberSelect.value;
  const source = document.getElementById("sourceInput").value.trim();
  const type = document.getElementById("typeInput").value;

  if(!desc || amount<=0){ alert("Isi semua field dengan benar!"); return; }

  transactions.push({date, desc, amount, member, source, type});
  localStorage.setItem("transactions", JSON.stringify(transactions));
  alert("Transaksi berhasil ditambahkan!");
  closeForm();
}

function toggleMenu(){
  const menu = document.getElementById("sideMenu");
  menu.style.left = menu.style.left==="0px" ? "-250px" : "0px";
}

function showHistory(){
  document.getElementById("historyContainer").style.display="block";
  renderTable();
}
function closeHistory(){ document.getElementById("historyContainer").style.display="none"; }

function renderTable(){
  const table = document.getElementById("transactionTable");
  table.innerHTML = "";
  transactions.forEach((t,i)=>{
    table.innerHTML += `<tr>
      <td>${i+1}</td>
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.member||""}</td>
      <td>${t.source||""}</td>
      <td>${t.type==="pemasukan"?t.amount:""}</td>
      <td>${t.type==="pengeluaran"?t.amount:""}</td>
    </tr>`;
  });
}

function showChart(){
  document.getElementById("chartContainer").style.display="block";
  let incomeTotal = transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+b.amount,0);
  let expenseTotal = transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+b.amount,0);
  const total = incomeTotal +
