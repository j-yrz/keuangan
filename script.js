// ===== Helper =====
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}
function getNow() {
  const now = new Date();
  return now.toLocaleDateString("id-ID") + " " + now.toLocaleTimeString("id-ID");
}

// ===== Data =====
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;

// ===== Elements =====
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const formSection = document.getElementById("formSection");
const homeSection = document.getElementById("home");
const historySection = document.getElementById("historySection");
const form = document.getElementById("transactionForm");
const typeEl = document.getElementById("type");
const memberEl = document.getElementById("memberSelect");
const descEl = document.getElementById("desc");
const amountEl = document.getElementById("amount");
const formTitle = document.getElementById("formTitle");
const selectAllEl = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelected");

// ===== Members Dummy =====
const members = ["Jeri", "Andi", "Sinta", "Budi"];
members.forEach(m => {
  const opt = document.createElement("option");
  opt.value = m;
  opt.textContent = m;
  memberEl.appendChild(opt);
});

// ===== Render & Summary =====
function updateSummary() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === "pemasukan") income += t.amount;
    else expense += t.amount;
  });
  incomeEl.textContent = formatRupiah(income);
  expenseEl.textContent = formatRupiah(expense);
  balanceEl.textContent = formatRupiah(income - expense);
}

function renderHistory() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";
  transactions.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.member}</td>
      <td>${t.desc}</td>
      <td>${formatRupiah(t.amount)}</td>
      <td>${t.status || "-"}</td>
      <td>
        <button onclick="editTransaction('${t.id}')">✏️ Edit</button>
        <button onclick="deleteTransaction('${t.id}')">🗑️ Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  bindRowChecks();
}

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateSummary();
  renderHistory();
}

// ===== CRUD =====
form.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    id: editId || Date.now().toString(),
    date: getNow(),
    type: typeEl.value,
    member: memberEl.value,
    desc: descEl.value,
    amount: parseInt(amountEl.value),
    status: editId ? "Diedit (" + getNow() + ")" : "Baru"
  };

  if (editId) {
    const idx = transactions.findIndex(t => t.id === editId);
    transactions[idx] = data;
    editId = null;
  } else {
    transactions.push(data);
  }

  saveData();
  form.reset();
  formSection.classList.add("hidden");
  homeSection.classList.remove("hidden");
});

function editTransaction(id) {
  const t = transactions.find(tr => tr.id === id);
  if (!t) return;
  editId = id;
  formTitle.textContent = "Edit Transaksi";
  typeEl.value = t.type;
  memberEl.value = t.member;
  descEl.value = t.desc;
  amountEl.value = t.amount;
  formSection.classList.remove("hidden");
  homeSection.classList.add("hidden");
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
}

// ===== Multiple Delete =====
function bindRowChecks() {
  const rowChecks = document.querySelectorAll(".rowCheck");
  rowChecks.forEach(chk => {
    chk.addEventListener("change", () => {
      const anyChecked = [...rowChecks].some(c => c.checked);
      deleteSelectedBtn.classList.toggle("hidden", !anyChecked);
    });
  });
}

selectAllEl.addEventListener("change", () => {
  document.querySelectorAll(".rowCheck").forEach(c => c.checked = selectAllEl.checked);
  deleteSelectedBtn.classList.toggle("hidden", !selectAllEl.checked);
});

deleteSelectedBtn.addEventListener("click", () => {
  const selected = [...document.querySelectorAll(".rowCheck:checked")].map(c => c.dataset.id);
  transactions = transactions.filter(t => !selected.includes(t.id));
  saveData();
  deleteSelectedBtn.classList.add("hidden");
});

// ===== Delete All =====
document.getElementById("deleteAll").addEventListener("click", () => {
  if (confirm("Hapus semua transaksi?")) {
    transactions = [];
    saveData();
  }
});

// ===== Export =====
document.getElementById("exportJSON").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "transactions.json"; a.click();
});

document.getElementById("exportCSV").addEventListener("click", () => {
  const header = ["Tanggal","Jenis","Anggota","Keterangan","Jumlah","Status"];
  const rows = transactions.map(t => [t.date,t.type,t.member,t.desc,t.amount,t.status]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "transactions.csv"; a.click();
});

// ===== Navigation =====
document.getElementById("addBtn").addEventListener("click", () => {
  form.reset();
  editId = null;
  formTitle.textContent = "Tambah Transaksi";
  homeSection.classList.add("hidden");
  formSection.classList.remove("hidden");
});

document.getElementById("cancelForm").addEventListener("click", () => {
  form.reset();
  formSection.classList.add("hidden");
  homeSection.classList.remove("hidden");
});

document.getElementById("openHistory").addEventListener("click", () => {
  historySection.classList.remove("hidden");
  homeSection.classList.add("hidden");
  document.getElementById("sidebar").classList.add("hidden");
});

document.getElementById("closeHistory").addEventListener("click", () => {
  historySection.classList.add("hidden");
  homeSection.classList.remove("hidden");
});

// Sidebar
document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("hidden");
});
document.getElementById("closeMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.add("hidden");
});

// ===== Init =====
saveData();