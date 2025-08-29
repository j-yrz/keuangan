document.addEventListener("DOMContentLoaded", () => {
  const el = id => document.getElementById(id);
  const formatRupiah = num => { num=Number(String(num).replace(/[^0-9]/g,''))||0; return 'Rp '+num.toLocaleString('id-ID'); };
  const getNow = () => new Date().toLocaleString('id-ID');

  let transactions = JSON.parse(localStorage.getItem('transactions'))||[];
  let members = JSON.parse(localStorage.getItem('members'))||["Jeri","Andi","Sinta","Budi"];
  let editId=null;

  const incomeEl=el("income"), expenseEl=el("expense"), balanceEl=el("balance");
  const formSection=el("formSection"), homeSection=el("home"), historySection=el("historySection"), chartSection=el("chartSection");
  const form=el("transactionForm"), typeEl=el("type"), memberEl=el("memberSelect"), descEl=el("desc"), amountEl=el("amount"), formTitle=el("formTitle");
  const addBtn=el("addBtn"), cancelForm=el("cancelForm");
  const selectAllEl=el("selectAll"), deleteSelectedBtn=el("deleteSelected");
  const searchKeyword=el("searchKeyword"), filterMember=el("filterMember"), filterType=el("filterType"), applyFilter=el("applyFilter"), resetFilter=el("resetFilter");
  const exportBtn=el("exportBtn"), exportOptions=el("exportOptions");
  const themeToggle=el("themeToggle"), menuBtn=el("menuBtn"), closeMenu=el("closeMenu");
  const sidebar=el("sidebar"), openHistoryBtn=el("openHistory"), openChartSidebar=el("openChartSidebar");
  const pieCtx=document.getElementById('pieChart'), lineCtx=document.getElementById('lineChart');
  const addMemberBtn=el("addMember"), removeMemberBtn=el("removeMember");
  let pieChart,lineChart;

  function renderMembersDropdown(){
    if(!memberEl||!filterMember) return;
    memberEl.innerHTML=""; filterMember.innerHTML='<option value="">Semua Anggota</option>';
    members.forEach(m=>{ const opt=document.createElement('option'); opt.value=m; opt.textContent=m; memberEl.appendChild(opt); const opt2=opt.cloneNode(true); filterMember.appendChild(opt2);});
  }
  renderMembersDropdown();

  function updateSummary(){
    let income=0,expense=0;
    transactions.forEach(t=>t.type==="pemasukan"?income+=Number(t.amount):expense+=Number(t.amount));
    incomeEl.textContent=formatRupiah(income);
    expenseEl.textContent=formatRupiah(expense);
    balanceEl.textContent=formatRupiah(income-expense);
  }

  function renderHistory(filteredList){
    const list=filteredList||transactions;
    const tbody=document.querySelector("#historyTable tbody");
    if(!tbody) return; tbody.innerHTML="";
    list.forEach((t,i)=>{
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

  function saveData(){
    localStorage.setItem('transactions',JSON.stringify(transactions));
    localStorage.setItem('members',JSON.stringify(members));
    updateSummary(); renderHistory(); renderCharts(); renderMembersDropdown();
  }

  form.addEventListener("submit",e=>{
    e.preventDefault();
    const amt=Number(String(amountEl.value).replace(/[^0-9]/g,''))||0;
    if(!typeEl.value||!memberEl.value||!descEl.value||amt<=0){ alert("Semua field harus diisi!"); return;}
    const data={id:editId||Date.now().toString(), date:getNow(), type:typeEl.value, member:memberEl.value, desc:descEl.value, amount:amt, status:editId?`Diedit (${getNow()})`:null};
    if(editId){ const idx=transactions.findIndex(t=>t.id===editId); if(idx!==-1) transactions[idx]=data; editId=null;}else transactions.push(data);
    form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden"); saveData();
  });

  function editTransaction(id){ const t=transactions.find(tr=>tr.id===id); if(!t) return; editId=id; formTitle.textContent="Edit Transaksi"; typeEl.value=t.type; memberEl.value=t.member; descEl.value=t.desc; amountEl.value=t.amount; formSection.classList.remove("hidden"); homeSection.classList.add("hidden");}

  function bindRowChecks(){
    const rowChecks=document.querySelectorAll(".rowCheck");
    rowChecks.forEach(c=>c.addEventListener("change",()=>{ const anyChecked=[...rowChecks].some(x=>x.checked); deleteSelectedBtn.classList.toggle("hidden",!anyChecked);}));
  }
  selectAllEl?.addEventListener("change",()=>{document.querySelectorAll(".rowCheck").forEach(c=>c.checked=selectAllEl.checked); deleteSelectedBtn.classList.toggle("hidden",!selectAllEl.checked);});
  deleteSelectedBtn?.addEventListener("click",()=>{ const selected=[...document.querySelectorAll(".rowCheck:checked")].map(c=>c.dataset.id); transactions=transactions.filter(t=>!selected.includes(t.id)); saveData(); deleteSelectedBtn.classList.add("hidden");});

  applyFilter?.addEventListener("click",()=>{ const kw=searchKeyword.value.toLowerCase(); const mem=filterMember.value; const typ=filterType.value; const filtered=transactions.filter(t=>(!mem||t.member===mem)&&(!typ||t.type===typ)&&(!kw||(t.desc.toLowerCase().includes(kw)||t.member.toLowerCase().includes(kw)||t.type.toLowerCase().includes(kw)||t.date.toLowerCase().includes(kw)))); renderHistory(filtered);});

  resetFilter?.addEventListener("click",()=>{ searchKeyword.value=""; filterMember.value=""; filterType.value=""; renderHistory();});

  addBtn?.addEventListener("click",()=>{form.reset(); editId=null; formTitle.textContent="Tambah Transaksi"; homeSection.classList.add("hidden"); formSection.classList.remove("hidden");});
  cancelForm?.addEventListener("click",()=>{form.reset(); formSection.classList.add("hidden"); homeSection.classList.remove("hidden");});

  menuBtn?.addEventListener("click",()=>{sidebar.classList.toggle("show"); chartSection?.classList.add("hidden"); historySection?.classList.add("hidden");});
  closeMenu?.addEventListener("click",()=>{sidebar.classList.remove("show");});

  themeToggle?.addEventListener("click",()=>{document.body.classList.toggle("dark");});

  addMemberBtn?.addEventListener("click",()=>{ const val=prompt("Nama anggota baru:"); if(val&&!members.includes(val)){members.push(val); saveData();}});
  removeMemberBtn?.addEventListener("click",()=>{ const val=memberEl.value; if(val&&confirm("Hapus anggota "+val+"?")){members=members.filter(m=>m!==val); transactions=transactions.filter(t=>t.member!==val); saveData();}});

  exportBtn?.addEventListener("click",()=>{ exportOptions.classList.toggle("hidden"); });
  exportOptions?.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{ const type=btn.dataset.type; let blob,url,a; if(type==="json"){ blob=new Blob([JSON.stringify(transactions,null,2)],{type:"application/json"}); a=document.createElement("a"); url=URL.createObjectURL(blob); a.href=url; a.download="transactions.json"; a.click();}
  if(type==="csv"){ const header=["Tanggal","Jenis","Anggota","Keterangan","Jumlah","Status"]; const rows=transactions.map(t=>[t.date,t.type,t.member,t.desc,t.amount,t.status]); const csv=[header,...rows].map(r=>r.map(v=>'\"'+String(v).replace(/\"/g,'""')+'\"').join(",")).join("\n"); blob=new Blob([csv],{type:"text/csv"}); url=URL.createObjectURL(blob); a=document.createElement("a"); a.href=url; a.download="transactions.csv"; a.click();} exportOptions.classList.add("hidden");}));

  // ===== Charts =====
  function renderCharts(){
    if(!pieCtx||!lineCtx) return;
    const income=transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+Number(b.amount),0);
    const expense=transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+Number(b.amount),0);
    const labels=transactions.map(t=>t.date); const balanceData=transactions.map(t=>t.type==="pemasukan"?Number(t.amount):-Number(t.amount)); let bal=0; const balanceArr=balanceData.map(v=>bal+=v);
    if(pieChart) pieChart.destroy(); if(lineChart) lineChart.destroy();
    pieChart=new Chart(pieCtx,{type:"pie",data:{labels:["Pemasukan","Pengeluaran"],datasets:[{data:[income,expense],backgroundColor:["#2d7d2d","#d12d2d"]}]},options:{responsive:true}});
    lineChart=new Chart(lineCtx,{type:"line",data:{labels:labels,datasets:[{label:"Saldo",data:balanceArr,fill:false,borderColor:"#2d7d2d"}]},options:{responsive:true}});
  }

  saveData();
});
