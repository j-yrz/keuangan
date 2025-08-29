let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let members = JSON.parse(localStorage.getItem("members")) || ["Umum"];

const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const addBtn = document.getElementById("addBtn");
const formSection = document.getElementById("formSection");
const transactionForm = document.getElementById("transactionForm");
const historySection = document.getElementById("historySection");
const historyTable = document.querySelector("#historyTable tbody");
const deleteSelectedBtn = document.getElementById("deleteSelected");
const deleteAllBtn = document.getElementById("deleteAll");
const exportBtn = document.getElementById("exportData");
const closeHistoryBtn = document.getElementById("closeHistory");
const memberSelect = document.getElementById("memberSelect");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenu");
const openHistoryBtn = document.getElementById("openHistory");
const cancelFormBtn = document.getElementById("cancelForm");
const selectAll = document.getElementById("selectAll");

function formatRupiah(angka){ return "Rp "+angka.toLocaleString("id-ID"); }
function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); localStorage.setItem("members", JSON.stringify(members)); }

function renderMembers(){
  memberSelect.innerHTML = '';
  members.forEach(m=>{ memberSelect.innerHTML += `<option value="${m}">${m}</option>`; });
}

function renderSummary(){
  let income = transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+b.amount,0);
  let expense = transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+b.amount,0);
  incomeEl.textContent = formatRupiah(income);
  expenseEl.textContent = formatRupiah(expense);
  balanceEl.textContent = formatRupiah(income-expense);
}

function renderHistory(){
  historyTable.innerHTML = "";
  transactions.forEach((t,i)=>{
    let row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="rowCheck" data-idx="${i}"></td>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.member}</td>
      <td>${t.desc}</td>
      <td>${formatRupiah(t.amount)}</td>
      <td>${t.edited ? "✏️ Diedit" : ""}</td>
      <td>
        <button onclick="editTransaction(${i})">✏️</button>
      </td>`;
    historyTable.appendChild(row);
  });
}

transactionForm.addEventListener("submit", e=>{
  e.preventDefault();
  let type = document.getElementById("type").value;
  let member = memberSelect.value;
  let desc = document.getElementById("desc").value;
  let amount = Number(document.getElementById("amount").value);
  let date = new Date().toLocaleString("id-ID");

  transactions.push({type, member, desc, amount, date, edited:false});
  saveData(); renderSummary(); renderHistory();

  transactionForm.reset();
  formSection.classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  addBtn.classList.remove("hidden");
});

function editTransaction(i){
  let t = transactions[i];
  formSection.classList.remove("hidden");
  historySection.classList.add("hidden");
  document.getElementById("type").value = t.type;
  memberSelect.value = t.member;
  document.getElementById("desc").value = t.desc;
  document.getElementById("amount").value = t.amount;

  transactionForm.onsubmit = function(e){
    e.preventDefault();
    t.type = document.getElementById("type").value;
    t.member = memberSelect.value;
    t.desc = document.getElementById("desc").value;
    t.amount = Number(document.getElementById("amount").value);
    t.date = new Date().toLocaleString("id-ID");
    t.edited = true;
    saveData(); renderSummary(); renderHistory();
    transactionForm.reset();
    formSection.classList.add("hidden");
    transactionForm.onsubmit = null;
  };
}

deleteSelectedBtn.addEventListener("click", ()=>{
  document.querySelectorAll(".rowCheck:checked").forEach(chk=>{
    let idx = chk.dataset.idx;
    transactions.splice(idx,1);
  });
  saveData(); renderSummary(); renderHistory();
  deleteSelectedBtn.classList.add("hidden");
});

deleteAllBtn.addEventListener("click", ()=>{
  if(confirm("Sebelum hapus semua, export dulu ya! Sudah export?")){
    transactions = [];
    saveData(); renderSummary(); renderHistory();
  }
});

exportBtn.addEventListener("click", ()=>{
  let blob = new Blob([JSON.stringify(transactions)], {type:"application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json";
  a.click();
});

historyTable.addEventListener("change", ()=>{
  let checked = document.querySelectorAll(".rowCheck:checked").length;
  if(checked>0) deleteSelectedBtn.classList.remove("hidden");
  else deleteSelectedBtn.classList.add("hidden");
});

selectAll.addEventListener("change", e=>{
  document.querySelectorAll(".rowCheck").forEach(chk=>chk.checked=e.target.checked);
  historyTable.dispatchEvent(new Event("change"));
});

addBtn.addEventListener("click", ()=>{
  formSection.classList.remove("hidden");
  document.getElementById("home").classList.add("hidden");
  addBtn.classList.add("hidden");
});

cancelFormBtn.addEventListener("click", ()=>{
  formSection.classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  addBtn.classList.remove("hidden");
});

menuBtn.addEventListener("click", ()=> sidebar.classList.remove("hidden"));
closeMenuBtn.addEventListener("click", ()=> sidebar.classList.add("hidden"));
openHistoryBtn.addEventListener("click", ()=>{
  historySection.classList.remove("hidden");
  document.getElementById("home").classList.add("hidden");
  formSection.classList.add("hidden");
  addBtn.classList.add("hidden");
  sidebar.classList.add("hidden");
});
closeHistoryBtn.addEventListener("click", ()=>{
  historySection.classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  addBtn.classList.remove("hidden");
});

renderMembers(); renderSummary(); renderHistory();
