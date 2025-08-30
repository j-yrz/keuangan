// ==================== Navigasi ====================
const homeBtn = document.getElementById("homeBtn");
const historyBtn = document.getElementById("historyBtn");
const grafikBtn = document.getElementById("grafikBtn");
const catatanBtn = document.getElementById("catatanBtn");

const sections = document.querySelectorAll(".section");

function showSection(id) {
  sections.forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// Event listener untuk klik dan touch
[homeBtn, historyBtn, grafikBtn, catatanBtn].forEach(btn => {
  btn.addEventListener("click", () => showSection(btn.id.replace("Btn","").toLowerCase()));
  btn.addEventListener("touchstart", () => showSection(btn.id.replace("Btn","").toLowerCase()));
});

// ==================== Transaksi ====================
const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function renderTransactions() {
  transactionList.innerHTML = "";
  transactions.forEach((t, index) => {
    const li = document.createElement("li");
    li.textContent = `${t.jenis.toUpperCase()} - ${t.keterangan} : Rp ${t.jumlah}`;
    transactionList.appendChild(li);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const jenis = document.getElementById("jenis").value;
  const keterangan = document.getElementById("keterangan").value;
  const jumlah = parseInt(document.getElementById("jumlah").value);

  if(jumlah <= 0) {
    alert("Jumlah harus lebih dari 0");
    return;
  }

  const transaksi = { jenis, keterangan, jumlah };
  transactions.push(transaksi);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  form.reset();
});

// ==================== Grafik ====================
const ctx = document.getElementById('chart').getContext('2d');
function updateChart() {
  const labels = transactions.map((t, i) => `T${i+1}`);
  const data = transactions.map(t => t.jenis === "pemasukan" ? t.jumlah : -t.jumlah);

  if(window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Saldo',
        data,
        backgroundColor: data.map(v => v>=0?'green':'red')
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Render awal
renderTransactions();
updateChart();
