document.addEventListener("DOMContentLoaded", () => {
  const { transactions } = window.appData;
  const pieCtx = document.getElementById('pieChart'), lineCtx = document.getElementById('lineChart');
  const exportBtn = document.getElementById('exportBtn'), exportOptions = document.getElementById('exportOptions');

  function renderCharts(){
    if(!pieCtx||!lineCtx) return;
    const income = transactions.filter(t=>t.type==="pemasukan").reduce((a,b)=>a+Number(b.amount),0);
    const expense = transactions.filter(t=>t.type==="pengeluaran").reduce((a,b)=>a+Number(b.amount),0);
    const labels = transactions.map(t=>t.date);
    let bal = 0; const balanceArr = transactions.map(t=>t.type==="pemasukan"?Number(t.amount):-Number(t.amount)).map(v=>bal+=v);

    if(window.pieChart) window.pieChart.destroy();
    if(window.lineChart) window.lineChart.destroy();
    window.pieChart = new Chart(pieCtx,{type:"pie",data:{labels:["Pemasukan","Pengeluaran"],datasets:[{data:[income,expense],backgroundColor:["#2d7d2d","#d12d2d"]}]}});
    window.lineChart = new Chart(lineCtx,{type:"line",data:{labels:labels,datasets:[{label:"Saldo",data:balanceArr,fill:false,borderColor:"#2d7d2d"}]}});
  }

  exportBtn?.addEventListener("click", ()=>{ exportOptions.classList.toggle("hidden"); });
  exportOptions?.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const type = btn.dataset.type; let blob, url, a;
      if(type==="json"){ blob=new Blob([JSON.stringify(transactions,null,2)],{type:"application/json"}); a=document.createElement("a"); url=URL.createObjectURL(blob); a.href=url; a.download="transactions.json"; a.click();}
      if(type==="csv"){ const header=["Tanggal","Jenis","Anggota","Keterangan","Jumlah","Status"];
        const rows=transactions.map(t=>[t.date,t.type,t.member,t.desc,t.amount,t.status]);
        const csv=[header,...rows].map(r=>r.map(v=>'\"'+String(v).replace(/\"/g,'""')+'\"').join(",")).join("\n");
        blob=new Blob([csv],{type:"text/csv"}); url=URL.createObjectURL(blob); a=document.createElement("a"); a.href=url; a.download="transactions.csv"; a.click();
      }
      exportOptions.classList.add("hidden");
    });
  });

  renderCharts();
  window.chartRender={renderCharts};
});
