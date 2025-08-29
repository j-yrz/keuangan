document.addEventListener("DOMContentLoaded", () => {

  // ===== Helper =====
  function formatRupiah(angka){
    if(!angka) angka=0;
    return "Rp " + Number(angka).toLocaleString("id-ID");
  }
  function getNow(){ return new Date().toLocaleString("id-ID"); }

  // ===== Data =====
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let editId = null;

  // ===== Elements =====
  const el = id => document.getElementById(id);
  const incomeEl = el("income"), expenseEl = el("expense"), balanceEl = el("balance");
  const formSection = el("formSection"), homeSection = el("home"), historySection = el("historySection");
  const form = el("transactionForm"), typeEl = el("type"), memberEl = el("memberSelect");
  const categoryEl = el("categorySelect"), descEl = el("desc"), amountEl = el("amount"), formTitle = el("formTitle");
  const selectAllEl = el("selectAll"), deleteSelectedBtn = el("deleteSelected");
  const filterMember = el("filterMember"), filterType = el("filterType");
  const searchKeyword = el("searchKeyword"), filterStart = el("filterStart"), filterEnd = el("filterEnd");
  const applyFilter = el("applyFilter"), resetFilter = el("resetFilter");
  const pieChartEl = el("pieChart"), lineChartEl = el("lineChart");
  let pieChart, lineChart;

  // ===== Members & Categories =====
  const members = ["Jeri","Andi","Sinta","Budi"];
  const categories = ["Makan","Transportasi","Belanja","Hiburan","Lainnya"];
  members.forEach(m=>{ 
    const opt = document.createElement("option"); opt.value=opt.textContent=m; memberEl.appendChild(opt);
    const fopt = document.createElement("option"); fopt.value=fopt.textContent=m; filterMember.appendChild(fopt);
  });
  categories.forEach(c=>{ const opt = document.createElement("option"); opt.value=opt.textContent=c; categoryEl.appendChild(opt); });

  // ===== Format Input =====
  amountEl.addEventListener("input", e => { 
    let val = e.target.value.replace(/\D/g,''); 
    e.target.value = val ? Number(val).toLocaleString("id-ID") : ''; 
  });
  function parseAmount(val){ return Number(val.replace(/\./g,'')) || 0; }

  // ===== Render Summary & History =====
  function updateSummary(){
    let income=0, expense=0;
    transactions.forEach(t=>t.type==="pemasukan"? income+=Number(t.amount):expense+=Number(t.amount));
    incomeEl.textContent = formatRupiah(income);
    expenseEl.textContent = formatRupiah(expense);
    balanceEl.textContent = formatRupiah(income-expense);
  }

  function renderHistory(data=transactions){
    const tbody = document.querySelector("#historyTable tbody"); tbody.innerHTML="";
    data.forEach(t=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td>${t.member}</td>
        <td>${t.category}</td>
        <td>${t.desc}</td>
        <td>${formatRupiah(t.amount)}</td>
        <td>${t.status||'-'}</td>
        <td>
          <button class="btn-edit" data-id="${t.id}">✏️</button>
          <button class="btn-delete" data-id="${t.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ===== Charts =====
  function renderCharts(){
    const totalIncome = transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+Number(b.amount),0);
    const totalExpense = transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+Number(b.amount),0);

    // Pie Chart
    if(pieChart) pieChart.destroy();
    pieChart = new Chart(pieChartEl, {
      type:'pie',
      data:{
        labels:['Pemasukan','Pengeluaran'],
        datasets:[{data:[totalIncome,totalExpense], backgroundColor:['#2d7d2d','#d32f2f'] }]
      }
    });

    // Line Chart (saldo per transaksi)
    if(lineChart) lineChart.destroy();
    let balance=0, labels=[], balances=[];
    transactions.forEach(t=>{
      t.type==="pemasukan"? balance+=Number(t.amount) : balance-=Number(t.amount);
      labels.push(t.date); balances.push(balance);
    });
    lineChart = new Chart(lineChartEl,{
      type:'line',
      data:{ labels:labels, datasets:[{label:'Saldo', data:balances, borderColor:'#2d7d2d', fill:false}]}
    });
  }

  // ===== CRUD =====
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const amt=parseAmount(amountEl.value);
    const data = {
      id:editId||Date.now().toString(),
      date:getNow(),
      type:typeEl.value,
      member:memberEl.value,
      category:categoryEl.value,
      desc:descEl.value,
      amount:amt,
      status:editId?"Diedit":"Baru"
    };
    if(editId){ const idx=transactions.findIndex(t=>t.id===editId); if(idx!==-1) transactions[idx]=data; editId=null;}
    else transactions.push(data);
    saveData(); form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden");
  });

  function editTransaction(id){
    const t=transactions.find(tr=>tr.id===id); if(!t) return;
    editId=id; formTitle.textContent="Edit Transaksi"; typeEl.value=t.type; memberEl.value=t.member; categoryEl.value=t.category;
    descEl.value=t.desc; amountEl.value=Number(t.amount).toLocaleString("id-ID");
    formSection.classList.remove("hidden"); homeSection.classList.add("hidden");
  }
  function deleteTransaction(id){ if(confirm("Hapus transaksi ini?")){ transactions=transactions.filter(t=>t.id!==id); saveData(); } }

  // ===== History Table Delegation =====
  document.querySelector("#historyTable tbody").addEventListener("click", e=>{
    if(e.target.classList.contains("btn-edit")) editTransaction(e.target.dataset.id);
    if(e.target.classList.contains("btn-delete")) deleteTransaction(e.target.dataset.id);
  });

  // ===== Multiple Delete =====
  function bindRowChecks(){ const rowChecks=document.querySelectorAll(".rowCheck"); deleteSelectedBtn.classList.add("hidden");
    rowChecks.forEach(chk=>chk.addEventListener("change", ()=>{ deleteSelectedBtn.classList.toggle("hidden", ![...rowChecks].some(c=>c.checked)); })); 
  }
  setInterval(bindRowChecks,500);
  if(selectAllEl) selectAllEl.addEventListener("change", ()=>{ document.querySelectorAll(".rowCheck").forEach(c=>c.checked=selectAllEl.checked); deleteSelectedBtn.classList.toggle("hidden", !selectAllEl.checked); });
  if(deleteSelectedBtn) deleteSelectedBtn.addEventListener("click", ()=>{ const sel=[...document.querySelectorAll(".rowCheck:checked")].map(c=>c.dataset.id); transactions=transactions.filter(t=>!sel.includes(t.id)); saveData(); deleteSelectedBtn.classList.add("hidden"); });

  // ===== Delete All =====
  el("deleteAll").addEventListener("click", ()=>{ if(confirm("Hapus semua transaksi?")){ transactions=[]; saveData(); } });

  // ===== Export =====
  el("exportJSON").addEventListener("click", ()=>{ const blob=new Blob([JSON.stringify(transactions,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="transactions.json"; a.click(); });
  el("exportCSV").addEventListener("click", ()=>{ 
    const header=["Tanggal","Jenis","Anggota","Kategori","Keterangan","Jumlah","Status"];
    const rows=transactions.map(t=>[t.date,t.type,t.member,t.category,t.desc,t.amount,t.status]);
    const csv=[header,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="transactions.csv"; a.click();
  });
  el("exportXLSX").addEventListener("click", ()=>{
    let table="<table><tr><th>Tanggal</th><th>Jenis</th><th>Anggota</th><th>Kategori</th><th>Keterangan</th><th>Jumlah</th><th>Status</th></tr>";
    transactions.forEach(t=>{ table+=`<tr><td>${t.date}</td><td>${t.type}</td><td>${t.member}</td><td>${t.category}</td><td>${t.desc}</td><td>${t.amount}</td><td>${t.status}</td></tr>`; });
    table+="</table>";
    const blob=new Blob([table],{type:"application/vnd.ms-excel"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="transactions.xls"; a.click();
  });

  // ===== Navigation =====
  el("addBtn").addEventListener("click",()=>{ form.reset(); editId=null; formTitle.textContent="Tambah Transaksi"; homeSection.classList.add("hidden"); formSection.classList.remove("hidden"); });
  el("cancelForm").addEventListener("click",()=>{ form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden"); });
  el("openHistory").addEventListener("click",()=>{ historySection.classList.remove("hidden"); homeSection.classList.add("hidden"); el("sidebar")?.classList.add("hidden"); });
  el("closeHistory").addEventListener("click",()=>{ historySection.classList.add("hidden"); homeSection.classList.remove("hidden"); });
  el("menuBtn").addEventListener("click",()=>el("sidebar")?.classList.remove("hidden"));
  el("closeMenu").addEventListener("click",()=>el("sidebar")?.classList.add("hidden"));

  // ===== Filter & Search =====
  function applyFilters(){
    let data = [...transactions];
    if(searchKeyword.value) data=data.filter(t=>t.desc.toLowerCase().includes(searchKeyword.value.toLowerCase()));
    if(filterMember.value) data=data.filter(t=>t.member===filterMember.value);
    if(filterType.value) data=data.filter(t=>t.type===filterType.value);
    if(filterStart.value) data=data.filter(t=>new Date(t.date)>=new Date(filterStart.value));
    if(filterEnd.value) data=data.filter(t=>new Date(t.date)<=new Date(filterEnd.value));
    renderHistory(data);
  }
  applyFilter.addEventListener("click",applyFilters);
  resetFilter.addEventListener("click",()=>{ searchKeyword.value=""; filterMember.value=""; filterType.value=""; filterStart.value=""; filterEnd.value=""; renderHistory(); });

  // ===== Dark Mode =====
  const themeToggle = el("themeToggle");
  themeToggle.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });

  // ===== Init =====
  function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); updateSummary(); renderHistory(); renderCharts(); }
  saveData();

});
