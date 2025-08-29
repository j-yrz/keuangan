// ====== Data & Storage ======
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let members = JSON.parse(localStorage.getItem("members")) || ["Umum"];

const addBtn = document.getElementById("addBtn");
const addModal = document.getElementById("addModal");
const closeAdd = document.getElementById("closeAdd");
const saveBtn = document.getElementById("saveBtn");

const menuIcon = document.getElementById("menuIcon");
const sideMenu = document.getElementById("sideMenu");
const closeMenu = document.getElementById("closeMenu");
const openHistory = document.getElementById("openHistory");

const historyContainer = document.getElementById("historyContainer");
const closeHistory = document.getElementById("closeHistory");
const historyContent = document.getElementById("historyContent");

const typeSelect = document.getElementById("typeSelect");
const memberSelect = document.getElementById("memberSelect");
const amountInput = document.getElementById("amountInput");
const noteInput = document.getElementById("noteInput");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");
const modalTitle = document.getElementById("modalTitle");

let editIndex = null;

// ====== Helper ======
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("members", JSON.stringify(members));
}
function renderMembers() {
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>';
  members.forEach(m => {
    memberSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option>`;
  memberSelect.innerHTML += `<option value="-">- Hapus Anggota</option>`;
}

// ====== Update Ringkasan ======
function updateSummary() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });
  totalIncome.textContent = formatRupiah(income);
  totalExpense.textContent = formatRupiah(expense);
  balance.textContent = formatRupiah(income - expense);
}

// ====== Render History ======
function renderHistory() {
  if (transactions.length === 0) {
    historyContent.innerHTML = "<p>Belum ada transaksi</p>";
    return;
  }
  let html = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Jenis</th>
            <th>Anggota</th>
            <th>Jumlah</th>
            <th>Catatan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
  `;
  transactions.forEach((t, i) => {
    html += `
      <tr>
        <td>${t.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
        <td>${t.member}</td>
        <td>${formatRupiah(t.amount)}</td>
        <td>${t.note || "-"}</td>
        <td>${t.edited ? "✏️ Diedit" : "-"}</td>
        <td>
          <button onclick="editTransaction(${i})">✏️</button>
          <button onclick="deleteTransaction(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });
  html += "</tbody></table></div>";
  historyContent.innerHTML = html;
}

// ====== Tambah / Edit ======
function resetForm() {
  typeSelect.value = "";
  memberSelect.value = "";
  amountInput.value = "";
  noteInput.value = "";
}

function openAddModal(edit = false) {
  addModal.classList.add("show");
  if (!edit) {
    modalTitle.textContent = "Tambah Transaksi";
    editIndex = null;
    resetForm();
  }
}
function closeAddModal() {
  addModal.classList.remove("show");
}

function addOrEditTransaction() {
  const type = typeSelect.value;
  let member = memberSelect.value;
  const amount = parseInt(amountInput.value);
  const note = noteInput.value;

  if (!type || !member || !amount) {
    alert("Lengkapi semua field!");
    return;
  }

  if (member === "+") {
    const newMember = prompt("Masukkan nama anggota:");
    if (newMember) {
      members.push(newMember);
      saveData();
      renderMembers();
      member = newMember;
    } else return;
  }
  if (member === "-") {
    const delMember = prompt("Masukkan nama anggota yang ingin dihapus:");
    if (delMember && members.includes(delMember)) {
      members = members.filter(m => m !== delMember);
      saveData();
      renderMembers();
    } else {
      alert("Anggota tidak ditemukan!");
    }
    return;
  }

  if (editIndex !== null) {
    transactions[editIndex] = { type, member, amount, note, edited: true };
    editIndex = null;
  } else {
    transactions.push({ type, member, amount, note, edited: false });
  }

  saveData();
  updateSummary();
  renderHistory();
  closeAddModal();
  resetForm();
}

// ====== Edit & Hapus ======
window.editTransaction = function(i) {
  const t = transactions[i];
  openAddModal(true);
  modalTitle.textContent = "Edit Transaksi";
  typeSelect.value = t.type;
  memberSelect.value = t.member;
  amountInput.value = t.amount;
  noteInput.value = t.note;
  editIndex = i;
};
window.deleteTransaction = function(i) {
  if (confirm("Yakin ingin menghapus transaksi ini?")) {
    transactions.splice(i, 1);
    saveData();
    updateSummary();
    renderHistory();
  }
};

// ====== Event Listeners ======
addBtn.onclick = () => openAddModal();
closeAdd.onclick = closeAddModal;
saveBtn.onclick = addOrEditTransaction;

menuIcon.onclick = () => sideMenu.classList.add("show");
closeMenu.onclick = () => sideMenu.classList.remove("show");
openHistory.onclick = () => { historyContainer.classList.add("show"); renderHistory(); };
closeHistory.onclick = () => historyContainer.classList.remove("show");

// ====== Init ======
renderMembers();
updateSummary();
renderHistory();
