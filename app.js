document.addEventListener("DOMContentLoaded", () => {

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
  let members = JSON.parse(localStorage.getItem("members")) || ["Jeri", "Andi", "Sinta", "Budi"];
  let editId = null;

  // ===== Elements =====
  const el = id => document.getElementById(id);
  const incomeEl = el("income");
  const expenseEl = el("expense");
  const balanceEl = el("balance");
  const formSection = el("formSection");
  const homeSection = el("home");
  const historySection = el("historySection");
  const chartSection = el("chartSection");
  const form = el("transactionForm");
  const typeEl = el("type");
  const memberEl = el("memberSelect");
  const descEl = el("desc");
  const amountEl = el("amount");
  const formTitle = el("formTitle");

  // ===== Members Dropdown =====
  function renderMembers() {
    memberEl.innerHTML = "";
    members.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m; opt.textContent = m;
      memberEl.appendChild(opt);
    });
    const filterMember = el("filterMember");
    if(filterMember){
      filterMember.innerHTML = `<option value="">Semua Anggota</option>`;
      members.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m; opt.textContent = m;
        filterMember.appendChild(opt);
      });
    }
  }
  renderMembers();

  el("addMember").addEventListener("click", () => {
    const name = prompt("Nama anggota baru:");
    if(name) { members.push(name); renderMembers(); localStorage.setItem("members", JSON.stringify(members)); }
  });
  el("removeMember").addEventListener("click", () => {
    const name = memberEl.value;
    if(name && confirm(`Hapus anggota "${name}"?`)){
      members = members.filter(m => m!==name); renderMembers(); localStorage.setItem("members", JSON.stringify(members));
    }
  });

  // ===== CRUD Functions =====
  function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateSummary(); renderHistory();
  }

  function updateSummary() {
    let income=0, expense=0;
    transactions.forEach(t => { if(t.type==="pemasukan") income+=Number(t.amount)||0; else expense+=Number(t.amount)||0; });
    incomeEl.textContent = formatRupiah(income);
    expenseEl.textContent = formatRupiah(expense);
    balanceEl.textContent = formatRupiah(income-expense);
  }

  function renderHistory(filtered=transactions) {
    const tbody = document.querySelector("#historyTable tbody"); if(!tbody) return;
    tbody.innerHTML = "";
    filtered.forEach((t,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
      <td>${i+1}</td>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.member}</td>
      <td>${t.desc}</td>
      <td>${formatRupiah(t.amount)}</td>
      <td><button class="statusBtn" data-id="${t.id}">${t.status||'-'}</button></td>
      <td><button class="btn-edit" data-id="${t.id}">✏️ Edit</button></td>`;
      tbody.appendChild(tr);
    });
    bindRowChecks();
    tbody.querySelectorAll(".btn-edit").forEach(b=>b.addEventListener("click",()=>editTransaction(b.dataset.id)));
    tbody.querySelectorAll(".statusBtn").forEach(b=>b.addEventListener("click",()=>showStatus(b.dataset.id)));
  }

  function editTransaction(id){
    const t = transactions.find(tr=>tr.id===id); if(!t) return;
    editId=id; formTitle.textContent="Edit Transaksi";
    typeEl.value=t.type; memberEl.value=t.member; descEl.value=t.desc; amountEl.value=t.amount;
    formSection.classList.remove("hidden"); homeSection.classList.add("hidden");
  }

  function showStatus(id){
    const t = transactions.find(tr=>tr.id===id); if(!t) return;
    alert(t.status || "Baru");
  }

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const amt = Number(amountEl.value.replace(/\D/g,'')) || 0;
    const data = {
      id:editId||Date.now().toString(),
      date:getNow(),
      type:typeEl.value,
      member:memberEl.value,
      desc:descEl.value,
      amount:amt,
      status: editId ? `Diedit (${getNow()})`:"Baru"
    };
    if(editId){
      const idx = transactions.findIndex(t=>t.id===editId); if(idx!==-1) transactions[idx]=data; editId=null;
    }else transactions.push(data);
    saveData(); form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden");
  });

  // ===== Row Checkbox =====
  const deleteSelectedBtn = el("deleteSelected");
  function bindRowChecks(){
    const rowChecks = document.querySelectorAll(".rowCheck");
    rowChecks.forEach(chk=>{
      chk.addEventListener("change", ()=>{
        const anyChecked = [...rowChecks].some(c=>c.checked);
        deleteSelectedBtn.classList.toggle("hidden",!anyChecked);
      });
    });
  }
  el("selectAll")?.addEventListener("change",()=>{
    document.querySelectorAll(".rowCheck").forEach(c=>c.checked=el("selectAll").checked);
    deleteSelectedBtn.classList.toggle("hidden",!el("selectAll").checked);
  });
  deleteSelectedBtn?.addEventListener("click",()=>{
    const selected=[...document.querySelectorAll(".rowCheck:checked")].map(c=>c.dataset.id);
    transactions = transactions.filter(t=>!selected.includes(t.id));
    saveData(); deleteSelectedBtn.classList.add("hidden");
  });

  // ===== Init =====
  saveData();

});
