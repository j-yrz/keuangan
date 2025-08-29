// Defensive JS with runtime error reporting for debugging
window.addEventListener("error", function(event) {
  try {
    const msg = event.message || "Unknown error";
    const src = event.filename || "";
    const line = event.lineno || "";
    alert("JavaScript error: " + msg + "\nAt: " + src + ":" + line);
  } catch(e) { console.error("Error handler failed", e); }
});

document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("DOM loaded - initializing script");

    // ===== Helper =====
    function formatRupiah(angka) {
      if (isNaN(angka) || angka === null) angka = 0;
      return "Rp " + Number(angka).toLocaleString("id-ID");
    }
    function getNow() {
      const now = new Date();
      return now.toLocaleDateString("id-ID") + " " + now.toLocaleTimeString("id-ID");
    }

    // ===== Data =====
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let editId = null;

    // ===== Elements (guarded) =====
    const el = id => document.getElementById(id);
    const incomeEl = el("income");
    const expenseEl = el("expense");
    const balanceEl = el("balance");
    const formSection = el("formSection");
    const homeSection = el("home");
    const historySection = el("historySection");
    const form = el("transactionForm");
    const typeEl = el("type");
    const memberEl = el("memberSelect");
    const descEl = el("desc");
    const amountEl = el("amount");
    const formTitle = el("formTitle");
    const selectAllEl = el("selectAll");
    const deleteSelectedBtn = el("deleteSelected");

    if (!form || !homeSection) {
      alert("Elemen penting tidak ditemukan di halaman. Pastikan file index.html belum diubah.");
      return;
    }

    // ===== Members Dummy =====
    const members = ["Jeri", "Andi", "Sinta", "Budi"];
    if (memberEl) {
      memberEl.innerHTML = "";
      members.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        memberEl.appendChild(opt);
      });
    }

    // ===== Render & Summary =====
    function updateSummary() {
      let income = 0, expense = 0;
      transactions.forEach(t => {
        if (t.type === "pemasukan") income += Number(t.amount) || 0;
        else expense += Number(t.amount) || 0;
      });
      if (incomeEl) incomeEl.textContent = formatRupiah(income);
      if (expenseEl) expenseEl.textContent = formatRupiah(expense);
      if (balanceEl) balanceEl.textContent = formatRupiah(income - expense);
    }

    function renderHistory() {
      const tbody = document.querySelector("#historyTable tbody");
      if (!tbody) return;
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
            <button class="btn-edit" data-id="${t.id}">✏️ Edit</button>
            <button class="btn-delete" data-id="${t.id}">🗑️ Hapus</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      bindRowChecks();
      // Attach delegation for edit/delete (safer than inline onclick)
      tbody.querySelectorAll(".btn-edit").forEach(b => {
        b.addEventListener("click", e => { window.editTransaction && window.editTransaction(b.dataset.id); });
      });
      tbody.querySelectorAll(".btn-delete").forEach(b => {
        b.addEventListener("click", e => { window.deleteTransaction && window.deleteTransaction(b.dataset.id); });
      });
    }

    function saveData() {
      localStorage.setItem("transactions", JSON.stringify(transactions));
      updateSummary();
      renderHistory();
    }

    // ===== CRUD =====
    form.addEventListener("submit", e => {
      e.preventDefault();
      const amt = Number(amountEl.value) || 0;
      const data = {
        id: editId || Date.now().toString(),
        date: getNow(),
        type: typeEl.value,
        member: memberEl.value,
        desc: descEl.value,
        amount: amt,
        status: editId ? "Diedit (" + getNow() + ")" : "Baru"
      };

      if (editId) {
        const idx = transactions.findIndex(t => t.id === editId);
        if (idx !== -1) transactions[idx] = data;
        editId = null;
      } else {
        transactions.push(data);
      }

      saveData();
      form.reset();
      formSection && formSection.classList.add("hidden");
      homeSection && homeSection.classList.remove("hidden");
    });

    window.editTransaction = function(id) {
      const t = transactions.find(tr => tr.id === id);
      if (!t) return alert("Transaksi tidak ditemukan");
      editId = id;
      formTitle.textContent = "Edit Transaksi";
      typeEl.value = t.type;
      memberEl.value = t.member;
      descEl.value = t.desc;
      amountEl.value = t.amount;
      formSection.classList.remove("hidden");
      homeSection.classList.add("hidden");
    }

    window.deleteTransaction = function(id) {
      if (!confirm("Hapus transaksi ini?")) return;
      transactions = transactions.filter(t => t.id !== id);
      saveData();
    }

    // ===== Multiple Delete =====
    function bindRowChecks() {
      const rowChecks = document.querySelectorAll(".rowCheck");
      rowChecks.forEach(chk => {
        chk.addEventListener("change", () => {
          const anyChecked = [...rowChecks].some(c => c.checked);
          if (deleteSelectedBtn) deleteSelectedBtn.classList.toggle("hidden", !anyChecked);
        });
      });
    }

    if (selectAllEl) {
      selectAllEl.addEventListener("change", () => {
        document.querySelectorAll(".rowCheck").forEach(c => c.checked = selectAllEl.checked);
        if (deleteSelectedBtn) deleteSelectedBtn.classList.toggle("hidden", !selectAllEl.checked);
      });
    }

    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener("click", () => {
        const selected = [...document.querySelectorAll(".rowCheck:checked")].map(c => c.dataset.id);
        transactions = transactions.filter(t => !selected.includes(t.id));
        saveData();
        deleteSelectedBtn.classList.add("hidden");
      });
    }

    // ===== Delete All =====
    const deleteAllBtn = el("deleteAll");
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener("click", () => {
        if (confirm("Hapus semua transaksi?")) {
          transactions = [];
          saveData();
        }
      });
    }

    // ===== Export =====
    const exportJSON = el("exportJSON"), exportCSV = el("exportCSV");
    if (exportJSON) {
      exportJSON.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(transactions, null, 2)], {type:"application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "transactions.json"; a.click();
      });
    }
    if (exportCSV) {
      exportCSV.addEventListener("click", () => {
        const header = ["Tanggal","Jenis","Anggota","Keterangan","Jumlah","Status"];
        const rows = transactions.map(t => [t.date,t.type,t.member,t.desc,t.amount,t.status]);
        const csv = [header, ...rows].map(r => r.map(v => '\"'+String(v).replace(/\"/g,'\"\"')+'\"').join(",")).join("\\n");
        const blob = new Blob([csv], {type:"text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "transactions.csv"; a.click();
      });
    }

    // ===== Navigation =====
    const addBtn = el("addBtn"), cancelForm = el("cancelForm"), openHistory = el("openHistory"), closeHistory = el("closeHistory"), menuBtn = el("menuBtn"), closeMenu = el("closeMenu");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        form.reset();
        editId = null;
        formTitle.textContent = "Tambah Transaksi";
        homeSection.classList.add("hidden");
        formSection.classList.remove("hidden");
      });
    }
    if (cancelForm) {
      cancelForm.addEventListener("click", () => {
        form.reset();
        formSection.classList.add("hidden");
        homeSection.classList.remove("hidden");
      });
    }
    if (openHistory) {
      openHistory.addEventListener("click", () => {
        historySection.classList.remove("hidden");
        homeSection.classList.add("hidden");
        el("sidebar") && el("sidebar").classList.add("hidden");
      });
    }
    if (closeHistory) {
      closeHistory.addEventListener("click", () => {
        historySection.classList.add("hidden");
        homeSection.classList.remove("hidden");
      });
    }
    if (menuBtn) {
      menuBtn.addEventListener("click", () => el("sidebar") && el("sidebar").classList.remove("hidden"));
    }
    if (closeMenu) {
      closeMenu.addEventListener("click", () => el("sidebar") && el("sidebar").classList.add("hidden"));
    }

    // ===== Init =====
    saveData();
    console.log("Initialization complete");
  } catch (err) {
    alert("Initialization error: " + (err.message || err));
    console.error(err);
  }
});