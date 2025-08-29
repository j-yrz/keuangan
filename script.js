document.addEventListener("DOMContentLoaded", () => {

  // ===== Helper =====
  const el = id => document.getElementById(id);
  function formatRupiah(angka){ return "Rp " + Number(angka||0).toLocaleString("id-ID"); }
  function getNow(){ return new Date().toLocaleString("id-ID"); }
  function parseAmount(val){ return Number(val.replace(/\D/g,''))||0; }

  // ===== Data =====
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let members = JSON.parse(localStorage.getItem("members")) || ["Jeri","Andi","Sinta","Budi"];
  let editId = null;

  // ===== Elements =====
  const incomeEl = el("income"), expenseEl = el("expense"), balanceEl = el("balance");
  const formSection = el("formSection"), homeSection = el("home"), historySection = el("historySection"), chartSection = el("chartSection");
  const form = el("transactionForm"), typeEl = el("type"), memberEl = el("memberSelect"), descEl = el("desc"), amountEl = el("amount"), formTitle = el("formTitle");
  const searchKeyword = el("searchKeyword"), filterMember = el("filterMember"), filterType = el("filterType");
  const applyFilter = el("applyFilter"), resetFilter = el("resetFilter");
  const selectAllEl = el("selectAll"), deleteSelectedBtn = el("deleteSelected");
  const exportBtn = el("exportBtn"), exportOptions = el("exportOptions");
  const pieChartEl = el("pieChart"), lineChartEl = el("lineChart");
  let pieChart, lineChart;

  // ===== Initialize Members Dropdown =====
  function renderMembers(){
    memberEl.innerHTML = "";
    filterMember.innerHTML = '<option value="">Semua Anggota</option>';
    members.forEach(m=>{
      const opt = document.createElement("option"); opt.value=opt.textContent=m;
      memberEl.appendChild(opt);
      const fopt = document.createElement("option"); fopt.value=fopt.textContent=m;
      filterMember.appendChild(fopt);
    });
    localStorage.setItem("members", JSON.stringify(members));
  }
  renderMembers();

  el("addMember").addEventListener("click", ()=>{
    const name = prompt("Nama anggota baru:"); if(!name) return;
    if(!members.includes(name)){ members.push(name); renderMembers(); }
    else alert("Anggota sudah ada!");
  });
  el("removeMember").addEventListener("click", ()=>{
    const name = memberEl.value;
    if(!name) return alert("Pilih anggota dulu!");
    if(confirm(`Hapus anggota ${name}?`)){
      members = members.filter(m=>m!==name);
      transactions = transactions.filter(t=>t.member!==name);
      renderMembers(); saveData();
    }
  });

  // ===== Summary =====
  function updateSummary(){
    let income=0, expense=0;
    transactions.forEach(t=>t.type==="pemasukan"? income+=Number(t.amount):expense+=Number(t.amount));
    incomeEl.textContent = formatRupiah(income);
    expenseEl.textContent = formatRupiah(expense);
    balanceEl.textContent = formatRupiah(income-expense);
  }

  // ===== Render History =====
  function renderHistory(data=transactions){
    const tbody = document.querySelector("#historyTable tbody");
    tbody.innerHTML = "";
    data.forEach((t,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
        <td>${i+1}</td>
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td>${t.member}</td>
        <td>${t.desc}</td>
        <td>${formatRupiah(t.amount)}</td>
        <td><button class="status-btn" title="Klik untuk detail" data-status="${t.status}">${t.status || '-'}</button></td>
        <td><button class="btn-edit" data-id="${t.id}">✏️</button></td>
      `;
      tbody.appendChild(tr);
    });
    bindRowChecks();
    // Bind edit buttons
    tbody.querySelectorAll(".btn-edit").forEach(btn=>{
      btn.addEventListener("click", ()=> editTransaction(btn.dataset.id));
    });
    // Bind status button
    tbody.querySelectorAll(".status-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        alert(btn.dataset.status || "Tidak ada info edit");
      });
    });
  }

  // ===== Charts =====
  function renderCharts(){
    const totalIncome = transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+Number(b.amount),0);
    const totalExpense = transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+Number(b.amount),0);

    if(pieChart) pieChart.destroy();
    pieChart = new Chart(pieChartEl,{ type:'pie', data:{
      labels:['Pemasukan','Pengeluaran'],
      datasets:[{data:[totalIncome,totalExpense], backgroundColor:['#2d7d2d','#d32f2f'] }]
    }});

    if(lineChart) lineChart.destroy();
    let balance=0, labels=[], balances=[];
    transactions.forEach(t=>{ t.type==="pemasukan"? balance+=Number(t.amount): balance-=Number(t.amount); labels.push(t.date); balances.push(balance); });
    lineChart = new Chart(lineChartEl,{ type:'line', data:{ labels:labels, datasets:[{label:'Saldo', data:balances, borderColor:'#2d7d2d', fill:false}] } });
  }

  // ===== CRUD =====
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const amt = parseAmount(amountEl.value);
    const data = { id:editId||Date.now().toString(), date:getNow(), type:typeEl.value, member:memberEl.value, desc:descEl.value, amount:amt, status:editId?"Diedit ("+getNow()+")":"Baru" };
    if(editId){ const idx=transactions.findIndex(t=>t.id===editId); if(idx!==-1) transactions[idx]=data; editId=null; } else transactions.push(data);
    saveData(); form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden");
  });

  function editTransaction(id){
    const t=transactions.find(tr=>tr.id===id); if(!t) return;
    editId=id; formTitle.textContent="Edit Transaksi"; typeEl.value=t.type; memberEl.value=t.member; descEl.value=t.desc; amountEl.value=Number(t.amount).toLocaleString("id-ID");
    formSection.classList.remove("hidden"); homeSection.classList.add("hidden"); historySection.classList.add("hidden"); chartSection.classList.add("hidden");
  }

  // ===== Checkbox & Delete =====
  function bindRowChecks(){
    const rowChecks = document.querySelectorAll(".rowCheck");
    deleteSelectedBtn.classList.add("hidden");
    rowChecks.forEach(chk=>chk.addEventListener("change", ()=>{
      deleteSelectedBtn.classList.toggle("hidden", ![...rowChecks].some(c=>c.checked));
    }));
  }

  deleteSelectedBtn.addEventListener("click", ()=>{
    if(confirm("Hapus transaksi terpilih?")){
      const sel = [...document.querySelectorAll(".rowCheck:checked")].map(c=>c.dataset.id);
      transactions = transactions.filter(t=>!sel.includes(t.id));
      saveData(); deleteSelectedBtn.classList.add("hidden"); selectAllEl.checked=false;
    }
  });

  selectAllEl.addEventListener("change", ()=>{
    document.querySelectorAll(".rowCheck").forEach(c=>c.checked=selectAllEl.checked);
    deleteSelectedBtn.classList.toggle("hidden", !selectAllEl.checked);
  });

  // ===== Filters =====
  function applyFilters(){
    let data = [...transactions];
    const keyword = searchKeyword.value.toLowerCase();
    if(keyword) data=data.filter(t=>[t.date,t.type,t.member,t.desc,t.amount].some(v=>String(v).toLowerCase().includes(keyword)));
    if(filterMember.value) data=data.filter(t=>t.member===filterMember.value);
    if(filterType.value) data=data.filter(t=>t.type===filterType.value);
    renderHistory(data);
  }
  applyFilter.addEventListener("click",applyFilters);
  resetFilter.addEventListener("click",()=>{
    searchKeyword.value=""; filterMember.value=""; filterType.value="";
    renderHistory();
  });

  // ===== Export =====
  exportBtn.addEventListener("click",()=>{ exportOptions.classList.toggle("hidden"); });
  exportOptions.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const type = btn.dataset.type;
      let blob, filename;
      if(type==="json"){ blob = new Blob([JSON.stringify(transactions,null,2)],{type:"application/json"}); filename="transactions.json"; }
      else if(type==="csv"){ 
        const header=["Tanggal","Jenis","Anggota","Keterangan","Jumlah","Status"];
        const rows=transactions.map(t=>[t.date,t.type,t.member,t.desc,t.amount,t.status]);
        const csv=[header,...rows].map(r=>r.map(v=>'"'+v.toString().replace(/"/g,'""')+'"').join(",")).join("\n");
        blob=new Blob([csv],{type:"text/csv"}); filename="transactions.csv";
      }
      else if(type==="xlsx"){
        let table="<table><tr><th>Tanggal</th><th>Jenis</th><th>Anggota</th><th>Keterangan</th><th>Jumlah</th><th>Status</th></tr>";
        transactions.forEach(t=>{ table+=`<tr><td>${t.date}</td><td>${t.type}</td><td>${t.member}</td><td>${t.desc}</td><td>${t.amount}</td><td>${t.status}</td></tr>`; });
        table+="</table>"; blob=new Blob([table],{type:"application/vnd.ms-excel"}); filename="transactions.xls";
      }
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); exportOptions.classList.add("hidden");
    });
  });

  // ===== Navigation =====
  const closeAllMenus = ()=>{
    historySection.classList.add("hidden");
    chartSection.classList.add("hidden");
    formSection.classList.add("hidden");
    el("sidebar")?.classList.remove("show");
  }

  el("addBtn").addEventListener("click",()=>{ form.reset(); editId=null; formTitle.textContent="Tambah Transaksi"; homeSection.classList.add("hidden"); formSection.classList.remove("hidden"); });
  el("cancelForm").addEventListener("click",()=>{ form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden"); });

  el("menuBtn").addEventListener("click", ()=>{
    const sidebar = el("sidebar");
    sidebar.classList.toggle("show");
  });

  el("closeMenu").addEventListener("click", ()=> el("sidebar")?.classList.remove("show"));

  el("openHistory").addEventListener("click", ()=>{
    closeAllMenus(); historySection.classList.remove("hidden"); el("sidebar")?.classList.remove("show");
  });

  el("closeHistory").addEventListener("click", ()=>{ historySection.classList.add("hidden"); homeSection.classList.remove("hidden"); });

  el("openChartSidebar").addEventListener("click", ()=>{
    closeAllMenus(); chartSection.classList.remove("hidden"); el("sidebar")?.classList.remove("show"); renderCharts();
  });

  el("closeChart").addEventListener("click", ()=>{ chartSection.classList.add("hidden"); homeSection.classList.remove("hidden"); });

  el("themeToggle").addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    el("themeToggle").textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });

  // ===== Save & Init =====
  function saveData(){
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateSummary(); renderHistory(); renderCharts();
  }
  saveData();

});
