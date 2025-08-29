// ==================== Data ====================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let members = JSON.parse(localStorage.getItem("members")) || ["Umum"];
let editingIndex = null;

// ==================== Elemen ====================
const addBtn = document.getElementById("addBtn");
const addModal = document.getElementById("addModal");
const historyContainer = document.getElementById("historyContainer");
const chartContainer = document.getElementById("chartContainer");
const restoreContainer = document.getElementById("restoreContainer");
const menuIcon = document.getElementById("menuIcon");
const sideMenu = document.getElementById("sideMenu");
const memberSelect = document.getElementById("memberSelect");
const historyTable = document.getElementById("historyTable").querySelector("tbody");

const pemasukanEl = document.getElementById("pemasukan");
const pengeluaranEl = document.getElementById("pengeluaran");
const saldoEl = document.getElementById("saldo");

// ==================== Helper ====================
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
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>';
  members.forEach(m => {
    memberSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option>`;
  memberSelect.innerHTML += `<option value="-">- Hapus Anggota</option>`;
}

// ==================== Update Dashboard ====================
function updateDashboard() {
  let pemasukan = 0, pengeluaran = 0;
  transactions.forEach(t => {
    if (t.type === "pemasukan") pemasukan += t.amount;
    else pengeluaran += t.amount;
  });
  let saldo = pemasukan - pengeluaran;
  pemasukanEl.textContent = formatRupiah(pemasukan);
  pengeluaranEl.textContent = formatRupiah(pengeluaran);
  saldoEl.textContent = formatRupiah(saldo);
}

// ==================== Render History ====================
function renderHistory() {
  historyTable.innerHTML = "";
  transactions.forEach((t, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input type="checkbox" class="rowCheck" data-index="${i}"></td>
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.member}</td>
      <td>${t.type}</td>
      <td>${formatRupiah(t.amount)}</td>
      <td>
        <button class="btn-edit" data-index="${i}">✏️</button>
      </td>
      <td>${t.edited ? "✎ Edited" : ""}</td>
    `;

    historyTable.appendChild(tr);
  });

  // event edit
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      editingIndex = btn.dataset.index;
      openEditModal(editingIndex);
    });
  });

  // cekbox
  document.querySelectorAll(".rowCheck").forEach(chk => {
    chk.addEventListener("change", toggleDeleteSelectedBtn);
  });
}

// ==================== Add Transaction ====================
function openAddModal() {
  addModal.style.display = "block";
  document.getElementById("transactionForm").reset();
  editingIndex = null;
  addBtn.style.display = "none"; // sembunyikan tombol utama
}
function closeAddModal() {
  addModal.style.display = "none";
  addBtn.style.display = "block"; // tampilkan lagi tombol di beranda
}
document.getElementById("cancelBtn").addEventListener("click", closeAddModal);

document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();
  const desc = document.getElementById("desc").value;
  const member = memberSelect.value;
  const amount = parseInt(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const date = new Date().toLocaleString();

  if (editingIndex === null) {
    transactions.push({ desc, member, amount, type, date, edited: false });
  } else {
    transactions[editingIndex] = { desc, member, amount, type, date, edited: true };
  }

  saveData();
  updateDashboard();
  renderHistory();
  closeAddModal();
});

// ==================== Edit Transaction ====================
function openEditModal(index) {
  const t = transactions[index];
  addModal.style.display = "block";
  document.getElementById("desc").value = t.desc;
  memberSelect.value = t.member;
  document.getElementById("amount").value = t.amount;
  document.getElementById("type").value = t.type;
  editingIndex = index;
  addBtn.style.display = "none";
}

// ==================== History Modal ====================
document.getElementById("historyBtn").addEventListener("click", () => {
  historyContainer.style.display = "block";
  renderHistory();
  addBtn.style.display = "none";
});
document.getElementById("closeHistory").addEventListener("click", () => {
  historyContainer.style.display = "none";
  addBtn.style.display = "block";
});

// ==================== Delete Selected ====================
function toggleDeleteSelectedBtn() {
  const anyChecked = document.querySelectorAll(".rowCheck:checked").length > 0;
  document.getElementById("deleteSelected").style.display = anyChecked ? "inline-block" : "none";
}
document.getElementById("deleteSelected").addEventListener("click", () => {
  const checked = document.querySelectorAll(".rowCheck:checked");
  if (!checked.length) return;
  if (!confirm("Apakah Anda sudah melakukan export sebelum menghapus?")) return;
  const indexes = [...checked].map(c => parseInt(c.dataset.index)).sort((a, b) => b - a);
  indexes.forEach(i => transactions.splice(i, 1));
  saveData();
  updateDashboard();
  renderHistory();
  toggleDeleteSelectedBtn();
});

// ==================== Menu ====================
menuIcon.addEventListener("click", () => {
  sideMenu.classList.toggle("active");
  addBtn.style.display = sideMenu.classList.contains("active") ? "none" : "block";
});

// ==================== Chart & Restore (opsional) ====================
document.getElementById("closeChart").addEventListener("click", () => {
  chartContainer.style.display = "none";
  addBtn.style.display = "block";
});
document.getElementById("closeRestore").addEventListener("click", () => {
  restoreContainer.style.display = "none";
  addBtn.style.display = "block";
});

// ==================== Init ====================
renderMembers();
updateDashboard();
renderHistory();
