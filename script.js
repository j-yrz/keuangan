// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dateInput");
  dateInput.value = new Date().toISOString().slice(0, 10);

  window.members = JSON.parse(localStorage.getItem("members")) || [];
  window.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  window.memberSelect = document.getElementById("memberSelect");

  renderMembers();
  renderDashboard();

  // Input jumlah otomatis format rupiah
  const amountInput = document.getElementById("amountInput");
  amountInput.addEventListener("input", function () {
    let cursorPos = this.selectionStart;
    let value = this.value.replace(/\D/g, "");
    this.value = value ? Number(value).toLocaleString("id-ID") : "";
    this.setSelectionRange(cursorPos, cursorPos);
  });

  // Tombol simpan transaksi
  document.getElementById("saveBtn").addEventListener("click", addTransaction);
});

// ================== MENU TOGGLE ==================
function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.style.left = menu.style.left === "0px" ? "-250px" : "0px";

  // Sembunyikan tombol tambah saat menu dibuka
  document.getElementById("addBtn").style.display =
    menu.style.left === "0px" ? "none" : "block";
}

// ================== MODALS ==================
function openForm(editIndex = null) {
  const modal = document.getElementById("formModal");
  modal.classList.add("show");

  // Sembunyikan tombol tambah di beranda
  document.getElementById("addBtn").style.display = "none";

  if (editIndex !== null) {
    const t = transactions[editIndex];
    document.getElementById("dateInput").value = t.date;
    document.getElementById("descInput").value = t.desc;
    document.getElementById("amountInput").value = t.amount.toLocaleString("id-ID");
    document.getElementById("typeInput").value = t.type;
    document.getElementById("memberSelect").value = t.member;

    document.getElementById("saveBtn").onclick = function () {
      updateTransaction(editIndex);
    };
  } else {
    clearForm();
    document.getElementById("saveBtn").onclick = addTransaction;
  }
}

function closeForm() {
  document.getElementById("formModal").classList.remove("show");
  document.getElementById("addBtn").style.display = "block"; // tampil lagi di home
}

function showHistory() {
  document.getElementById("historyContainer").classList.add("show");
  document.getElementById("addBtn").style.display = "none";
  renderHistory();
}
function closeHistory() {
  document.getElementById("historyContainer").classList.remove("show");
  document.getElementById("addBtn").style.display = "block";
}

function showChart() {
  document.getElementById("chartContainer").classList.add("show");
  document.getElementById("addBtn").style.display = "none";
  renderChart();
}
function closeChart() {
  document.getElementById("chartContainer").classList.remove("show");
  document.getElementById("addBtn").style.display = "block";
}

function showRestore() {
  document.getElementById("restoreContainer").classList.add("show");
  document.getElementById("addBtn").style.display = "none";
}
function closeRestore() {
  document.getElementById("restoreContainer").classList.remove("show");
  document.getElementById("addBtn").style.display = "block";
}

// ================== TRANSACTIONS ==================
function addTransaction() {
  const date = document.getElementById("dateInput").value;
  const desc = document.getElementById("descInput").value.trim();
  const amount = parseRupiah(document.getElementById("amountInput").value);
  const member = memberSelect.value;
  const type = document.getElementById("typeInput").value;

  if (!desc || amount <= 0) {
    alert("Isi semua field!");
    return;
  }

  transactions.push({
    date,
    desc,
    amount,
    member,
    type,
    edited: false,
  });

  saveData();
  renderDashboard();
  renderHistory();

  closeForm();
  alert("Transaksi tersimpan!");
}

function updateTransaction(index) {
  const t = transactions[index];
  t.date = document.getElementById("dateInput").value;
  t.desc = document.getElementById("descInput").value.trim();
  t.amount = parseRupiah(document.getElementById("amountInput").value);
  t.member = memberSelect.value;
  t.type = document.getElementById("typeInput").value;
  t.edited = true;

  saveData();
  renderDashboard();
  renderHistory();

  closeForm();
  alert("Transaksi berhasil diedit!");
}

// ================== MEMBERS ==================
function memberOptionChange() {
  const val = memberSelect.value;
  if (val === "+") {
    const name = prompt("Masukkan nama anggota baru:").trim();
    if (name && !members.includes(name)) {
      members.push(name);
      saveData();
      renderMembers();
    }
  } else if (val === "-") {
    if (members.length === 0) {
      alert("Tidak ada anggota!");
      return;
    }
    const name = prompt(`Pilih anggota untuk dihapus:\n${members.join(", ")}`);
    if (name && members.includes(name)) {
      if (confirm(`Hapus anggota "${name}"?`)) {
        members = members.filter((m) => m !== name);
        saveData();
        renderMembers();
      }
    }
  }
}

// ================== RENDER FUNCTIONS ==================
function renderDashboard() {
  let income = transactions
    .filter((t) => t.type === "pemasukan")
    .reduce((a, b) => a + b.amount, 0);
  let expense = transactions
    .filter((t) => t.type === "pengeluaran")
    .reduce((a, b) => a + b.amount, 0);
  let balance = income - expense;

  document.getElementById("incomeCard").innerText = formatRupiah(income);
  document.getElementById("expenseCard").innerText = formatRupiah(expense);
  document.getElementById("balanceCard").innerText = formatRupiah(balance);
}

function renderHistory() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";

  transactions.forEach((t, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" class="chkDel" data-index="${i}" onchange="toggleDeleteSelected()"></td>
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.member || ""}</td>
      <td>${t.type}</td>
      <td>${formatRupiah(t.amount)}</td>
      <td>${t.edited ? "✏️ Diedit" : "-"}</td>
      <td>
        <button onclick="openForm(${i})">✏️ Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  toggleDeleteSelected();
}

function renderMembers() {
  memberSelect.innerHTML =
    '<option value="" disabled selected>Pilih anggota</option>';
  members.forEach((m) => {
    memberSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });
  memberSelect.innerHTML += `
    <option value="+">+ Tambah Anggota</option>
    <option value="-">- Hapus Anggota</option>`;
}

function renderChart() {
  const totalIncome = transactions
    .filter((t) => t.type === "pemasukan")
    .reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "pengeluaran")
    .reduce((a, b) => a + b.amount, 0);

  document.getElementById(
    "incomeBar"
  ).style.width = `${Math.min(totalIncome / 1000, 100)}%`;
  document.getElementById(
    "expenseBar"
  ).style.width = `${Math.min(totalExpense / 1000, 100)}%`;
}

// ================== DELETE ==================
function toggleDeleteSelected() {
  const checked = document.querySelectorAll(".chkDel:checked").length;
  document.getElementById("deleteSelectedBtn").style.display =
    checked > 0 ? "inline-block" : "none";
}

function deleteSelected() {
  if (!confirm("Hapus transaksi terpilih?")) return;

  const checked = document.querySelectorAll(".chkDel:checked");
  let indexes = Array.from(checked).map((c) => Number(c.dataset.index));
  transactions = transactions.filter((_, i) => !indexes.includes(i));

  saveData();
  renderDashboard();
  renderHistory();
}

// ================== EXPORT CSV ==================
function exportCSV() {
  let csv =
    "Tanggal,Deskripsi,Anggota,Jenis,Pemasukan,Pengeluaran,Status\n";
  transactions.forEach((t) => {
    csv += `${t.date},${t.desc},${t.member || ""},${t.type},${
      t.type === "pemasukan" ? t.amount : ""
    },${t.type === "pengeluaran" ? t.amount : ""},${
      t.edited ? "Diedit" : "Original"
    }\n`;
  });
  let blob = new Blob([csv], { type: "text/csv" });
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "laporan_keuangan.csv";
  a.click();
}

// ================== HELPERS ==================
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
function clearForm() {
  document.getElementById("dateInput").value = new Date()
    .toISOString()
    .slice(0, 10);
  document.getElementById("descInput").value = "";
  document.getElementById("amountInput").value = "";
  document.getElementById("typeInput").value = "pemasukan";
  document.getElementById("memberSelect").selectedIndex = 0;
}
