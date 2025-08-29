document.addEventListener("DOMContentLoaded", () => {

  // ===== Helper =====
  const el = id => document.getElementById(id);
  const formatRupiah = num => {
    num = Number(String(num).replace(/[^0-9]/g, '')) || 0;
    return 'Rp ' + num.toLocaleString('id-ID');
  };
  const getNow = () => new Date().toLocaleString('id-ID');

  // ===== Data =====
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let members = JSON.parse(localStorage.getItem('members')) || ["Jeri","Andi","Sinta","Budi"];
  let editId = null;

  // ===== Elements =====
  const incomeEl = el("income"), expenseEl = el("expense"), balanceEl = el("balance");
  const formSection = el("formSection"), homeSection = el("home"), historySection = el("historySection"), chartSection = el("chartSection");
  const form = el("transactionForm"), typeEl = el("type"), memberEl = el("memberSelect"), descEl = el("desc"), amountEl = el("amount"), formTitle = el("formTitle");
  const addBtn = el("addBtn"), cancelForm = el("cancelForm");
  const selectAllEl = el("selectAll"), deleteSelectedBtn = el("deleteSelected");
  const searchKeyword = el("searchKeyword"), filterMember = el("filterMember"), filterType = el("filterType"), applyFilter = el("applyFilter"), resetFilter = el("resetFilter");
  const exportBtn = el("exportBtn"), exportOptions = el("exportOptions");
  const themeToggle = el("themeToggle"), menuBtn = el("menuBtn"), closeMenu = el("closeMenu");
  const sidebar = el("sidebar"), openHistoryBtn = el("openHistory"), openChartSidebar = el("openChartSidebar");
  const pieCtx = document.getElementById('pieChart'), lineCtx = document.getElementById('lineChart');
  const addMemberBtn = el("addMember"), removeMemberBtn = el("removeMember");

  // ===== Init Members Dropdown =====
  function renderMembersDropdown() {
    memberEl.innerHTML = "";
    filterMember.innerHTML = '<option value="">Semua Anggota</option>';
    members.forEach(m => {
      const opt = document.createElement('option'); opt.value = m; opt.textContent = m;
      memberEl.appendChild(opt);
      const opt2 = opt.cloneNode(true);
      filterMember.appendChild(opt2);
    });
  }
  renderMembersDropdown();

  // ===== Summary =====
  function updateSummary(){
    let income=0,expense=0;
    transactions.forEach(t=>t.type==="pemasukan"?income+=Number(t.amount):expense+=Number(t.amount));
    incomeEl.textContent=formatRupiah(income);
    expenseEl.textContent=formatRupiah(expense);
    balanceEl.textContent=formatRupiah(income-expense);
  }

  // ===== Render History =====
  function renderHistory(){
    const tbody = document.querySelector("#historyTable tbody");
    tbody.innerHTML="";
    transactions.forEach((t,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
        <td>${i+1}</td>
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td>${t.member}</td>
        <td>${t.desc}</td>
        <td>${formatRupiah(t.amount)}</td>
        <td>${t.status?'<button class="status-btn" title="'+t.status+'">Diedit</button>':'Baru'}</td>
        <td><button class="btn-edit" data-id="${t.id}">✏️ Edit</button></td>
      `;
      tbody.appendChild(tr);
    });
    bindRowChecks();
    tbody.querySelectorAll(".btn-edit").forEach(b=>b.addEventListener("click",()=>editTransaction(b.dataset.id)));
  }

  // ===== Save Data =====
  function saveData(){
    localStorage.setItem('transactions',JSON.stringify(transactions));
    localStorage.setItem('members',JSON.stringify(members));
    updateSummary(); renderHistory(); renderCharts(); renderMembersDropdown();
  }

  // ===== CRUD =====
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const amt = Number(String(amountEl.value).replace(/[^0-9]/g,'')) || 0;
    const data = {
      id: editId || Date.now().toString(),
      date: getNow(),
      type: typeEl.value,
      member: memberEl.value,
      desc: descEl.value,
      amount: amt,
      status: editId?`Diedit (${getNow()})`:null
    };
    if(editId){
      const idx=transactions.findIndex(t=>t.id===editId);
      if(idx!==-1) transactions[idx]=data;
      editId=null;
    }else transactions.push(data);
    form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden");
    saveData();
  });

  function editTransaction(id){
    const t=transactions.find(tr=>tr.id===id); if(!t) return;
    editId=id; formTitle.textContent="Edit Transaksi"; typeEl.value=t.type; memberEl.value=t.member; descEl.value=t.desc; amountEl.value=t.amount;
    formSection.classList.remove("hidden"); homeSection.classList.add("hidden");
  }

  // ===== Delete Selected =====
  function bindRowChecks(){
    const rowChecks=document.querySelectorAll(".rowCheck");
    rowChecks.forEach(c=>c.addEventListener("change",()=>{
      const anyChecked=[...rowChecks].some(x=>x.checked);
      deleteSelectedBtn.classList.toggle("hidden",!anyChecked);
    }));
  }
  selectAllEl?.addEventListener("change",()=>{document.querySelectorAll(".rowCheck").forEach(c=>c.checked=selectAllEl.checked); deleteSelectedBtn.classList.toggle("hidden",!selectAllEl.checked);});
  deleteSelectedBtn?.addEventListener("click",()=>{
    const selected=[...document.querySelectorAll(".rowCheck:checked")].map(c=>c.dataset.id);
    transactions=transactions.filter(t=>!selected.includes(t.id)); saveData(); deleteSelectedBtn.classList.add("hidden");
  });

  // ===== Filter & Search =====
  applyFilter?.addEventListener("click",()=>{
    const keyword=searchKeyword.value.toLowerCase();
    const mem=filterMember.value;
    const typ=filterType.value;
    const tbody=document.querySelector("#historyTable tbody"); tbody.innerHTML="";
    transactions.forEach((t,i)=>{
      if((!mem||t.member===mem)&&(!typ||t.type===typ)&&(!keyword||(t.desc.toLowerCase().includes(keyword)||t.member.toLowerCase().includes(keyword)||t.date.toLowerCase().includes(keyword)||t.amount.toString().includes(keyword)))){
        const tr=document.createElement("tr");
        tr.innerHTML=`
          <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
          <td>${i+1}</td>
          <td>${t.date}</td>
          <td>${t.type}</td>
          <td>${t.member}</td>
          <td>${t.desc}</td>
          <td>${formatRupiah(t.amount)}</td>
          <td>${t.status?'<button class="status-btn" title="'+t.status+'">Diedit</button>':'Baru'}</td>
          <td><button class="btn-edit" data-id="${t.id}">✏️ Edit</button></td>
        `;
        tbody.appendChild(tr);
      }
    });
    bindRowChecks();
  });
  resetFilter?.addEventListener("click",()=>{searchKeyword.value=""; filterMember.value=""; filterType.value=""; renderHistory();});

  // ===== Export =====
  exportBtn?.addEventListener("click",()=>exportOptions.classList.toggle("hidden"));
  exportOptions?.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
    const type=btn.dataset.type; let data, blob, url, a;
    if(type==="json"){ data=JSON.stringify(transactions,null,2); blob=new Blob([data],{type:"application/json"}); url=URL.createObjectURL(blob); a=document.createElement("a"); a.href=url; a.download="transactions.json"; a.click();}
    else if(type==="csv"){ const header=["Tanggal","Jenis","Anggota","Keterangan","Jumlah","Status"]; const rows=transactions.map(t=>[t.date,t.type,t.member,t.desc,t.amount,t.status]); const csv=[header,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\\n"); blob=new Blob([csv],{type:"text/csv"}); url=URL.createObjectURL(blob); a=document.createElement("a"); a.href=url; a.download="transactions.csv"; a.click();}
    else if(type==="xlsx"){ alert("Export Excel masih placeholder, gunakan CSV/JSON"); }
    exportOptions.classList.add("hidden");
  }));

  // ===== Dark Mode =====
  themeToggle?.addEventListener("click",()=>document.body.classList.toggle("dark"));

  // ===== Sidebar & Menu =====
  menuBtn?.addEventListener("click",()=>sidebar.classList.add("show"));
  closeMenu?.addEventListener("click",()=>sidebar.classList.remove("show"));
  openHistoryBtn?.addEventListener("click",()=>{historySection.classList.remove("hidden"); homeSection.classList.add("hidden"); chartSection.classList.add("hidden"); sidebar.classList.remove("show");});
  openChartSidebar?.addEventListener("click",()=>{chartSection.classList.remove("hidden"); homeSection.classList.add("hidden"); historySection.classList.add("hidden"); sidebar.classList.remove("show");});
  el("closeHistory")?.addEventListener("click",()=>{historySection.classList.add("hidden"); homeSection.classList.remove("hidden");});
  el("closeChart")?.addEventListener("click",()=>{chartSection.classList.add("hidden"); homeSection.classList.remove("hidden");});

  // ===== Format Rupiah saat mengetik =====
  amountEl?.addEventListener("input",e=>{ const pos=e.target.selectionStart; const val=e.target.value.replace(/[^0-9]/g,''); e.target.value=formatRupiah(val); e.target.selectionEnd=pos; });

  // ===== Tambah / Hapus Anggota =====
  addMemberBtn?.addEventListener("click",()=>{ const name=prompt("Nama anggota baru:"); if(name){ members.push(name); saveData(); }});
  removeMemberBtn?.addEventListener("click",()=>{ const name=memberEl.value; if(name&&confirm("Hapus anggota "+name+"?")){ members=members.filter(m=>m!==name); saveData(); }});

  // ===== Charts =====
  let pieChart,lineChart;
  function renderCharts(){
    if(!pieCtx || !lineCtx) return;
    const incomeSum=transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+Number(b.amount),0);
    const expenseSum=transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+Number(b.amount),0);
    if(pieChart) pieChart.destroy(); pieChart=new Chart(pieCtx,{type:"pie",data:{labels:["Pemasukan","Pengeluaran"],datasets:[{data:[incomeSum,expenseSum],backgroundColor:["#2d7d2d","#d12d2d"]}]},options:{responsive:true}});
    const labels=[...new Set(transactions.map(t=>t.date.split(" ")[0]))];
    const balanceArr=[]; let bal=0; labels.forEach(l=>{ const tDay=transactions.filter(t=>t.date.startsWith(l)); tDay.forEach(tt=>bal+=tt.type==="pemasukan"?Number(tt.amount):-Number(tt.amount)); balanceArr.push(bal);});
    if(lineChart) lineChart.destroy(); lineChart=new Chart(lineCtx,{type:"line",data:{labels:labels,datasets:[{label:"Saldo",data:balanceArr,borderColor:"#2d7d2d",fill:false}]},options:{responsive:true}});
  }

  // ===== Init =====
  saveData();

});
