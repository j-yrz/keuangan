document.addEventListener("DOMContentLoaded", () => {

  const el = id => document.getElementById(id);
  const homeSection = el("home");
  const formSection = el("formSection");
  const historySection = el("historySection");
  const chartSection = el("chartSection");
  const sidebar = el("sidebar");

  // ===== Buttons =====
  el("addBtn")?.addEventListener("click", ()=>{
    formSection.classList.remove("hidden"); homeSection.classList.add("hidden");
    el("transactionForm").reset();
  });
  el("cancelForm")?.addEventListener("click", ()=>{
    formSection.classList.add("hidden"); homeSection.classList.remove("hidden");
  });

  // ===== Sidebar =====
  el("menuBtn")?.addEventListener("click", ()=>{
    sidebar.classList.add("show"); 
    historySection.classList.add("hidden"); chartSection.classList.add("hidden");
  });
  el("closeMenu")?.addEventListener("click",()=> sidebar.classList.remove("show"));
  el("openHistory")?.addEventListener("click",()=>{
    historySection.classList.remove("hidden"); chartSection.classList.add("hidden"); sidebar.classList.remove("show"); homeSection.classList.add("hidden");
  });
  el("openChartSidebar")?.addEventListener("click",()=>{
    chartSection.classList.remove("hidden"); historySection.classList.add("hidden"); sidebar.classList.remove("show"); homeSection.classList.add("hidden");
  });

  // ===== Dark Mode =====
  el("themeToggle")?.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
  });

  // ===== Filter History =====
  el("applyFilter")?.addEventListener("click", ()=>{
    const keyword = el("searchKeyword").value.toLowerCase();
    const member = el("filterMember").value;
    const type = el("filterType").value;
    const filtered = JSON.parse(localStorage.getItem("transactions")||'[]').filter(t=>{
      return (keyword==="" || (t.desc+t.date+t.member+t.type).toLowerCase().includes(keyword)) &&
             (member===""||t.member===member) &&
             (type===""||t.type===type);
    });
    const evt = new Event('renderFiltered');
    document.dispatchEvent(new CustomEvent('renderFiltered',{detail:filtered}));
  });

  el("resetFilter")?.addEventListener("click", ()=>{
    el("searchKeyword").value=""; el("filterMember").value=""; el("filterType").value="";
    document.dispatchEvent(new CustomEvent('renderFiltered',{detail:JSON.parse(localStorage.getItem("transactions")||'[]')}));
  });

  // ===== Export Dropdown =====
  const exportBtn = el("exportBtn");
  const exportOptions = el("exportOptions");
  exportBtn?.addEventListener("click", ()=> exportOptions.classList.toggle("hidden"));
  exportOptions?.querySelectorAll("button").forEach(b=>{
    b.addEventListener("click", ()=>{
      const type = b.dataset.type;
      const data = JSON.parse(localStorage.getItem("transactions")||'[]');
      if(type==="json"){
        const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
        const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="transactions.json"; a.click();
      }else if(type==="csv"){
        const header=["Tanggal","Jenis","Anggota","Keterangan","Jumlah","Status"];
        const rows = data.map(t=>[t.date,t.type,t.member,t.desc,t.amount,t.status]);
        const csv = [header,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
        const blob = new Blob([csv],{type:"text/csv"});
        const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="transactions.csv"; a.click();
      }
      exportOptions.classList.add("hidden");
    });
  });

  // ===== Render Filtered Event =====
  document.addEventListener("renderFiltered",(e)=>{
    const tbody = document.querySelector("#historyTable tbody");
    if(!tbody) return; tbody.innerHTML="";
    e.detail.forEach((t,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
      <td>${i+1}</td>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.member}</td>
      <td>${t.desc}</td>
      <td>${t.amount}</td>
      <td><button class="statusBtn" data-id="${t.id}">${t.status||'-'}</button></td>
      <td><button class="btn-edit" data-id="${t.id}">✏️ Edit</button></td>`;
      tbody.appendChild(tr);
    });
  });

});
