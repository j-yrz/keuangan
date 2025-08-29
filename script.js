// Saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dateInput");
  dateInput.value = new Date().toISOString().slice(0, 10);

  window.members = JSON.parse(localStorage.getItem("members")) || [];
  window.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  window.memberSelect = document.getElementById("memberSelect");

  renderMembers();
  renderDashboard();

  // Format input jumlah
  const amountInput = document.getElementById("amountInput");
  amountInput.addEventListener("input", function () {
    let cursorPos = this.selectionStart;
    let value = this.value.replace(/\D/g, "");
    this.value = value ? Number(value).toLocaleString("id-ID") : "";
    this.setSelectionRange(cursorPos, cursorPos);
  });

  // Tombol simpan
  document.getElementById("saveBtn").addEventListener("click", addTransaction);
});

// === Fungsi UI dasar ===
function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  if (menu.style.left === "0px") menu.style.left = "-250px";
  else menu.style.left = "0px";
}

// Modal form tambah transaksi
function openForm() {
  document.getElementById("formModal").classList.add("show");
  document.getElementById("addBtn").style.display = "none"; // sembunyikan tombol tambah
}
function closeForm() {
  document.getElementById("formModal").classList.remove("show");
  document.getElementById("addBtn").style.display = "block"; // tampilkan lagi tombol tambah
  clearForm();
}
function clearForm() {
  document.getElementById("descInput").value = "";
  document.getElementById("amountInput").value = "";
  document.getElementById("typeInput").value = "pemasukan";
  document.getElementById("memberSelect").value = "";
}

// Side menu sections
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

// === Transaksi ===
function addTransaction() {
  const date = document.getElementById("dateInput").value;
  const desc = document.getElementById("descInput").value.trim();
  const amount = parseRupiah(document.getElementById("amountInput").value);
  const member = memberSelect.value;
  const type = document.getElementById("typeInput").value;

  if (!desc || amount <= 0 || !member) {
    alert("Isi semua field!");
    return;
  }

  transactions.push({ date, desc, amount, member, type, edited: false });
  saveData();
  renderDashboard();

  alert("Transaksi tersimpan!");
  closeForm();
}

// Edit transaksi
function editTransaction(index) {
  const t = transactions[index];
  document.getElementById("dateInput").value = t.date;
  document.getElementById("descInput").value = t.desc;
  document.getElementById("amountInput").value = t.amount.toLocaleString("id-ID");
  document.getElementById("memberSelect").value = t.member;
  document.getElementById("typeInput").value = t.type;

  openForm();

  // Override tombol simpan
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.onclick = () => {
    t.date = document.getElementById("dateInput").value;
    t.desc = document.getElementById("descInput").value.trim();
    t.amount = parseRupiah(document.getElementById("amountInput").value);
    t.member = document.getElementById("memberSelect").value;
    t.type = document.getElementById("typeInput").value;
    t.edited = true;
    saveData();
    renderDashboard();
    renderHistory();
    closeForm();

    // kembalikan fungsi normal
    saveBtn.onclick = addTransaction;
  };
}

// === History ===
function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  transactions.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="selectBox" data-index="${i}"></td>
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.member || ""}</td>
      <td>${t.type === "pemasukan" ? formatRupiah(t.amount) : ""}</td>
      <td>${t.type === "pengeluaran" ? formatRupiah(t.amount) : ""}</td>
      <td>${t.edited ? "✏️ Diedit" : "-"}</td>
      <td>
        <button onclick="editTransaction(${i})">✏️</button>
      </td>
    `;
    list.appendChild(row);
  });

  // tampilkan tombol hapus hanya jika ada checklist
  document.querySelectorAll(".selectBox").forEach(cb => {
    cb.addEventListener("change", () => {
      const anyChecked = document.querySelectorAll(".selectBox:checked").length > 0;
      document.getElementById("deleteSelectedBtn").style.display = anyChecked ? "inline-block" : "none";
    });
  });
}

// === Chart sederhana ===
function renderChart() {
  let totalIncome = transactions.filter(t => t.type === "pemasukan").reduce((a, b) => a + b.amount, 0);
  let totalExpense = transactions.filter(t => t.type === "pengeluaran").reduce((a, b) => a + b.amount, 0);

  document.getElementById("incomeBar").style.width = totalIncome / 10 + "px";
  document.getElementById("expenseBar").style.width = totalExpense / 10 + "px";
}

// === Members ===
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
        members = members.filter(m => m !== name);
        saveData();
        renderMembers();
      }
    }
  }
}
function renderMembers() {
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>';
  members.forEach(m => {
    memberSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option><option value="-">- Hapus Anggota</option>`;
}

// === Export / Hapus ===
function exportCSV() {
  let csv = "Tanggal,Deskripsi,Anggota,Pemasukan,Pengeluaran\n";
  transactions.forEach(t => {
    csv += `${t.date},${t.desc},${t.member || ""},${t.type === "pemasukan" ? t.amount : ""},${t.type === "pengeluaran" ? t.amount : ""}\n`;
  });
  let blob = new Blob([csv], { type: "text/csv" });
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "laporan_keuangan.csv";
  a.click();
}

function deleteSelected() {
  const selected = [...document.querySelectorAll(".selectBox:checked")].map(cb => parseInt(cb.dataset.index));
  if (selected.length === 0) return;

  if (!confirm("Apakah Anda sudah melakukan export sebelum menghapus?")) {
    alert("Lakukan export terlebih dahulu sebelum hapus!");
    return;
  }

  if (confirm("Hapus transaksi terpilih?")) {
    transactions = transactions.filter((_, i) => !selected.includes(i));
    saveData();
    renderHistory();
    renderDashboard();
  }
}

// === Dashboard ===
function renderDashboard() {
  let income = transactions.filter(t => t.type === "pemasukan").reduce((a, b) => a + b.amount, 0);
  let expense = transactions.filter(t => t.type === "pengeluaran").reduce((a, b) => a + b.amount, 0);
  let balance = income - expense;

  document.getElementById("totalIncome").textContent = formatRupiah(income);
  document.getElementById("totalExpense").textContent = formatRupiah(expense);
  document.getElementById("totalBalance").textContent = formatRupiah(balance);
}

// === Helper ===
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
