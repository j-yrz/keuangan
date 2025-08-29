document.addEventListener("DOMContentLoaded", () => {
  const el = id => document.getElementById(id);
  const { transactions, renderMembersDropdown, saveData } = window.appData;

  const menuBtn = el("menuBtn"), sidebar = el("sidebar"), closeMenu = el("closeMenu");
  const themeToggle = el("themeToggle");
  const selectAllEl = el("selectAll"), deleteSelectedBtn = el("deleteSelected");
  const historySection = el("historySection"), openHistoryBtn = el("openHistory");

  function renderHistory(){
    const tbody = document.querySelector("#historyTable tbody");
    if(!tbody) return;
    tbody.innerHTML="";
    transactions.forEach((t,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML=`
        <td><input type="checkbox" class="rowCheck" data-id="${t.id}"></td>
        <td>${i+1}</td>
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td>${t.member}</td>
        <td>${t.desc}</td>
        <td>${t.amount.toLocaleString('id-ID')}</td>
        <td>${t.status?'<button title="'+t.status+'">Diedit</button>':'Baru'}</td>
        <td><button class="btn-edit" data-id="${t.id}">✏️ Edit</button></td>
      `;
      tbody.appendChild(tr);
    });
    bindRowChecks();
  }

  function bindRowChecks(){
    const rowChecks = document.querySelectorAll(".rowCheck");
    rowChecks.forEach(c => c.addEventListener("change", ()=>{ deleteSelectedBtn.classList.toggle("hidden", ![...rowChecks].some(x=>x.checked)); }));
  }

  selectAllEl?.addEventListener("change",()=>{ document.querySelectorAll(".rowCheck").forEach(c=>c.checked=selectAllEl.checked); deleteSelectedBtn.classList.toggle("hidden", !selectAllEl.checked); });
  deleteSelectedBtn?.addEventListener("click",()=>{
    const selected=[...document.querySelectorAll(".rowCheck:checked")].map(c=>c.dataset.id);
    window.appData.transactions = window.appData.transactions.filter(t=>!selected.includes(t.id));
    saveData(); renderHistory(); deleteSelectedBtn.classList.add("hidden");
  });

  menuBtn?.addEventListener("click", ()=>{ sidebar.classList.toggle("show"); historySection?.classList.add("hidden"); });
  closeMenu?.addEventListener("click", ()=>{ sidebar.classList.remove("show"); });
  themeToggle?.addEventListener("click", ()=>{ document.body.classList.toggle("dark"); });

  renderHistory();
  window.uiRender = { renderHistory };
});
