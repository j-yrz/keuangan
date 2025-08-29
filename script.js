// =======================
// Variabel global
// =======================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let members = JSON.parse(localStorage.getItem("members")) || ["Umum"];
let editingIndex = null;

// Elemen DOM
const addBtn = document.getElementById("addBtn");
const addModal = document.getElementById("addModal");
const closeAdd = document.getElementById("closeAdd");
const saveBtn = document.getElementById("saveBtn");

const sideMenu = document.getElementById("sideMenu");
const menuIcon = document.getElementById("menuIcon");
const closeMenu = document.getElementById("closeMenu");

const historyContainer = document.getElementById("historyContainer");
const historyContent = document.getElementById("historyContent");
const closeHistory = document.getElementById("closeHistory");

const memberSelect = document.getElementById("memberSelect");
const typeSelect = document.getElementById("typeSelect");
const amountInput = document.getElementById("amountInput");
const noteInput = document.getElementById("noteInput");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

// =======================
// Helper functions
// =======================
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function parseRupiah(str) {
  return Number(str.replace(/[^0-9]/g, "")) || 0;
}

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("members", JSON.stringify(members));
}

function renderMembers() {
  memberSelect.innerHTML =
    '<option value="" disabled selected>Pilih anggota</option>';
  members.forEach((m) => {
    memberSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });
  memberSelect.innerHTML +=
    `<option value="+">+ Tambah Anggota</option>` +
    `<option value="-">- Hapus Anggota</option>`;
}

// =======================
// Summary
// =======================
function updateSummary() {
  let income = 0,
    expense = 0;
  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });
  totalIncome.textContent = formatRupiah(income);
  totalExpense.textContent = formatRupiah(expense);
  balance.textContent = formatRupiah(income - expense);
}

// =======================
// Modal
// =======================
function openModal() {
  addModal.classList.add("show");
}

function closeModal() {
  addModal.classList.remove("show");
  clearForm();
  editingIndex = null;
}

function clearForm() {
  typeSelect.value = "";
  memberSelect.value = "";
  amountInput.value = "";
  noteInput.value = "";
}

// =======================
// Transaksi
// =======================
function addTransaction() {
  const type = typeSelect.value;
  const member = memberSelect.value;
  const amount = parseRupiah(amountInput.value);
  const note = noteInput.value.trim();

  if (!type || !member || !amount) {
    alert("Lengkapi semua field!");
    return;
  }

  if (member === "+") {
    const newMember = prompt("Nama anggota baru:");
    if (newMember) {
      members.push(newMember);
      saveData();
      renderMembers();
    }
    return;
  } else if (member === "-") {
    const delMember = prompt("Nama anggota yang ingin dihapus:");
    if (delMember && members.includes(delMember)) {
      members = members.filter((m) => m !== delMember);
      saveData();
      renderMembers();
    }
    return;
  }

  const transaction = {
    type,
    member,
    amount,
    note,
    date: new Date().toLocaleString("id-ID"),
    edited: false,
  };

  if (editingIndex !== null) {
    transaction.edited = true;
    transactions[editingIndex] = transaction;
  } else {
    transactions.push(transaction);
  }

  saveData();
  updateSummary();
  renderHistory();
  closeModal();
}

// =======================
// History
// =======================
function renderHistory() {
  if (!historyContent) return;
  historyContent.innerHTML = "";
  if (transactions.length === 0) {
    historyContent.innerHTML = "<p>Belum ada transaksi</p>";
    return;
  }

  let table = `<div class="table-container"><table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tanggal</th>
          <th>Jenis</th>
          <th>Anggota</th>
          <th>Jumlah</th>
          <th>Catatan</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>`;

  transactions.forEach((t, i) => {
    table += `
      <tr>
        <td><input type="checkbox" class="deleteCheck" data-index="${i}"></td>
        <td>${t.date}</td>
        <td>${t.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
        <td>${t.member}</td>
        <td>${formatRupiah(t.amount)}</td>
        <td>${t.note || "-"}</td>
        <td>${t.edited ? "✏️ Edit" : "-"}</td>
        <td>
          <button onclick="editTransaction(${i})">✏️</button>
        </td>
      </tr>
    `;
  });

  table += "</tbody></table></div>";
  historyContent.innerHTML = table;
}

// =======================
// Edit transaksi
// =======================
function editTransaction(index) {
  const t = transactions[index];
  if (!t) return;

  editingIndex = index;
  typeSelect.value = t.type;
  memberSelect.value = t.member;
  amountInput.value = t.amount;
  noteInput.value = t.note;

  openModal();
}

// =======================
// Event Listeners
// =======================
document.addEventListener("DOMContentLoaded", () => {
  renderMembers();
  updateSummary();
  renderHistory();
});

if (addBtn) addBtn.addEventListener("click", openModal);
if (closeAdd) closeAdd.addEventListener("click", closeModal);
if (saveBtn) saveBtn.addEventListener("click", addTransaction);

if (menuIcon) {
  menuIcon.addEventListener("click", () => {
    sideMenu.classList.add("show");
  });
}
if (closeMenu) {
  closeMenu.addEventListener("click", () => {
    sideMenu.classList.remove("show");
  });
}

if (historyContainer) {
  if (closeHistory) {
    closeHistory.addEventListener("click", () => {
      historyContainer.classList.remove("show");
    });
  }
}
