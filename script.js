// Data transaksi & anggota
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;

// DOM Elements
const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const form = document.getElementById('transactionForm');
const transactionAnggotaInput = document.getElementById('transactionAnggotaInput');
const transaksiPopup = document.getElementById('typePopup');
const anggotaPopup = document.getElementById('anggotaPopup');
const transaksiInput = document.getElementById('type');
const amountInput = document.getElementById('amount');
const newAnggotaInput = document.getElementById('newAnggota');
const toggleSaldo = document.getElementById('toggleSaldo');
const saldoCard = document.getElementById('card-saldo');
const pemasukanCard = document.getElementById('card-pemasukan');
const pengeluaranCard = document.getElementById('card-pengeluaran');
const filterAnggota = document.getElementById('filterAnggota');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const checkAll = document.getElementById('checkAll');
const exportBtn = document.getElementById('exportBtn');
const applyFilterBtn = document.getElementById('applyFilter');

// Toggle menu mobile
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', () => navMenu.classList.toggle('show'));

// Format Rupiah function
function formatRupiah(angka) {
  const numberString = angka.replace(/[^,\d]/g, '').toString();
  const split = numberString.split(',');
  let remainder = split[0].length % 3;
  let rupiah = split[0].substr(0, remainder);
  const thousands = split[0].substr(remainder).match(/\d{3}/gi);
  if (thousands) {
    const separator = remainder ? '.' : '';
    rupiah += separator + thousands.join('.');
  }
  return split[1] ? rupiah + ',' + split[1] : rupiah;
}

amountInput.addEventListener('input', () => {
  amountInput.value = formatRupiah(amountInput.value);
});

// Show Popup Jenis
transactionAnggotaInput.addEventListener('click', () => {
  transaksiPopup.style.display = 'block';
});

document.querySelectorAll('.popupItem').forEach(item => {
  item.addEventListener('click', function() {
    transaksiInput.value = this.innerText;
    transaksiPopup.style.display = 'none';
  });
});

// Show Popup Anggota
transactionAnggotaInput.addEventListener('click', () => {
  anggotaPopup.style.display = 'block';
  anggotaPopup.innerHTML = anggota.map(a => `
    <div class="popupItem">
      ${a} 
      <span class="hapusAnggota" onclick="hapusAnggota('${a}')">X</span>
    </div>
  `).join('');
});

function hapusAnggota(anggotaName) {
  anggota = anggota.filter(a => a !== anggotaName);
  localStorage.setItem('anggota', JSON.stringify(anggota));
  renderAnggotaDropdown();
  anggotaPopup.style.display = 'none';
}

// Render anggota dropdown
function renderAnggotaDropdown() {
  filterAnggota.innerHTML = '<option value="">Semua Anggota</option>';
  anggota.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    filterAnggota.appendChild(opt);
  });
}

renderAnggotaDropdown();

// Modal Form Submit
form.addEventListener('submit', e => {
  e.preventDefault();
  const type = transaksiInput.value;
  const amount = amountInput.value.replace(/[^,\d]/g, '');
  const note = document.getElementById('note').value;
  const date = document.getElementById('transactionDate').value;
  const deskripsi = document.getElementById('deskripsi').value;
  const sumberDana = document.getElementById('sumberDana').value;
  let anggotaVal = transactionAnggotaInput.value;
  const newAnggotaVal = newAnggotaInput.value.trim();

  if (newAnggotaVal && !anggota.includes(newAnggotaVal)) {
    anggota.push(newAnggotaVal);
    localStorage.setItem('anggota', JSON.stringify(anggota));
    renderAnggotaDropdown();
    anggotaVal = newAnggotaVal;
  }

  const transaction = { type, amount, note, date, deskripsi, sumberDana, anggota: anggotaVal };
  if (editingIndex !== null) {
    transactions[editingIndex] = transaction;
    editingIndex = null;
  } else transactions.push(transaction);

  localStorage.setItem('transactions', JSON.stringify(transactions));
  form.reset();
  renderTransactionsTable();
  updateSummary();
  formModal.style.display = 'none';
});

// Render table
function renderTransactionsTable() {
  const transactionsTableBody = document.querySelector('#transactionsTable tbody');
  transactionsTableBody.innerHTML = '';
  transactions.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="rowCheckbox" data-index="${i}"></td>
      <td>${i + 1}</td>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.anggota}</td>
      <td>${t.sumberDana}</td>
      <td>${t.note}</td>
      <td>Rp ${formatRupiah(t.amount)}</td>
      <td>${t.deskripsi}</td>
      <td>
        <button class="editBtn">✎</button>
        <button class="statusBtn">Status</button>
      </td>
    `;
    transactionsTableBody.appendChild(tr);

    // Edit
    tr.querySelector('.editBtn').addEventListener('click', () => {
      editingIndex = i;
      formModal.style.display = 'flex';
      transaksiInput.value = t.type;
      amountInput.value = formatRupiah(t.amount);
      document.getElementById('note').value = t.note;
      document.getElementById('transactionDate').value = t.date;
      document.getElementById('deskripsi').value = t.deskripsi;
      document.getElementById('sumberDana').value = t.sumberDana;
      transactionAnggotaInput.value = t.anggota;
      newAnggotaInput.value = '';
    });
  });
}

// Update Summary
function updateSummary() {
  const pemasukan = transactions.filter(t => t.type === 'Pemasukan').reduce((a, b) => a + Number(b.amount), 0);
  const pengeluaran = transactions.filter(t => t.type === 'Pengeluaran').reduce((a, b) => a + Number(b.amount), 0);
  saldoCard.textContent = `Saldo: Rp ${formatRupiah(pemasukan - pengeluaran)}`;
  pemasukanCard.textContent = `Pemasukan: Rp ${formatRupiah(pemasukan)}`;
  pengeluaranCard.textContent = `Pengeluaran: Rp ${formatRupiah(pengeluaran)}`;
}

updateSummary();
renderTransactionsTable();
