document.addEventListener("DOMContentLoaded", () => {
  const el = id => document.getElementById(id);
  const formatRupiah = num => { num=Number(String(num).replace(/[^0-9]/g,''))||0; return 'Rp '+num.toLocaleString('id-ID'); };
  const getNow = () => new Date().toLocaleString('id-ID');

  let transactions = JSON.parse(localStorage.getItem('transactions'))||[];
  let members = JSON.parse(localStorage.getItem('members'))||["Jeri","Andi","Sinta","Budi"];
  let editId = null;

  const incomeEl = el("income"), expenseEl = el("expense"), balanceEl = el("balance");
  const formSection = el("formSection"), homeSection = el("home"), historySection = el("historySection");
  const form = el("transactionForm"), typeEl = el("type"), memberEl = el("memberSelect"), descEl = el("desc"), amountEl = el("amount"), formTitle = el("formTitle");
  const addBtn = el("addBtn"), cancelForm = el("cancelForm");

  function renderMembersDropdown(){
    if(!memberEl) return;
    memberEl.innerHTML="";
    members.forEach(m => {
      const opt = document.createElement('option'); opt.value = m; opt.textContent = m;
      memberEl.appendChild(opt);
    });
  }
  renderMembersDropdown();

  function updateSummary(){
    let income=0, expense=0;
    transactions.forEach(t => t.type==="pemasukan"?income+=Number(t.amount):expense+=Number(t.amount));
    if(incomeEl) incomeEl.textContent=formatRupiah(income);
    if(expenseEl) expenseEl.textContent=formatRupiah(expense);
    if(balanceEl) balanceEl.textContent=formatRupiah(income-expense);
  }

  function saveData(){
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('members', JSON.stringify(members));
    updateSummary();
  }

  addBtn?.addEventListener("click", () => {
    form.reset(); editId=null; formTitle.textContent="Tambah Transaksi";
    homeSection.classList.add("hidden"); formSection.classList.remove("hidden");
  });

  cancelForm?.addEventListener("click", () => {
    form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden");
  });

  form?.addEventListener("submit", e => {
    e.preventDefault();
    const amt = Number(String(amountEl.value).replace(/[^0-9]/g,''))||0;
    if(!typeEl.value||!memberEl.value||!descEl.value||amt<=0){ alert("Semua field harus diisi!"); return; }
    const data = { id: editId||Date.now().toString(), date: getNow(), type: typeEl.value, member: memberEl.value, desc: descEl.value, amount: amt, status: editId?`Diedit (${getNow()})`:null };
    if(editId){ const idx = transactions.findIndex(t=>t.id===editId); if(idx!==-1) transactions[idx]=data; editId=null; }
    else transactions.push(data);
    form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden");
    saveData();
  });

  window.appData = { transactions, members, renderMembersDropdown, saveData };
});
