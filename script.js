// Data transaksi & anggota
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let anggota = JSON.parse(localStorage.getItem('anggota')) || [];
let editingIndex = null;

// DOM Elements
const formModal = document.getElementById('formModal');
const showFormBtn = document.getElementById('showFormBtn');
const closeBtn = document.querySelector('.closeBtn');
const form = document.getElementById('transactionForm');
const transactionAnggota = document.getElementById('transactionAnggotaInput');
const anggotaPopup = document.getElementById('anggotaPopup');
const typePopup = document.getElementById('typePopup');
const typeSelect = document.getElementById('type');
const newAnggotaInput = document.getElementById('newAnggota');
const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const checkAll = document.getElementById('checkAll');
const filterAnggota = document.getElementById('filterAnggota');
const applyFilterBtn = document.getElementById('applyFilter');
const exportBtn = document.getElementById('exportBtn');
const exportOptions = document.getElementById('exportOptions');
const toggleSaldo = document.getElementById('toggleSaldo');

const saldoCard = document.getElementById('card-saldo');
const pemasukanCard = document.getElementById('card-pemasukan');
const pengeluaranCard = document.getElementById('card-pengeluaran');

// Toggle menu mobile
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', () => navMenu.classList.toggle('show'));

// Toggle saldo
let saldoVisible = true;
toggleSaldo.addEventListener('click', () => {
    saldoVisible = !saldoVisible;
    saldoCard.textContent = saldoVisible ? `Saldo: Rp ${calculateSaldo()}` : 'Saldo: ****';
    saldoCard.appendChild(toggleSaldo);
});

// Modal Form
showFormBtn.addEventListener('click', () => formModal.style.display = 'flex');
closeBtn.addEventListener('click', () => formModal.style.display = 'none');
window.addEventListener('click', e => {
    if (e.target === formModal) formModal.style.display = 'none';
});

// Tombol Batal
const cancelBtn = document.getElementById('cancelBtn');
cancelBtn.addEventListener('click', () => {
    formModal.style.display = 'none';
    form.reset();
    transactionDate.value = new Date().toISOString().split('T')[0]; // Reset tanggal
});

// Tanggal otomatis
const transactionDate = document.getElementById('transactionDate');
transactionDate.value = new Date().toISOString().split('T')[0];

// Popup Pilih Jenis
typeSelect.addEventListener('click', (e) => {
    e.preventDefault();
    const popup = document.getElementById('typePopup');
    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block'; // Toggle visibility
});

// Menutup Popup jika klik di luar
window.addEventListener('click', (e) => {
    if (!e.target.closest('#typePopup') && !e.target.closest('#typeSelect')) {
        document.getElementById('typePopup').style.display = 'none';
    }
});

// Pilih Jenis
document.querySelectorAll('#typePopup .popupItem').forEach(item => {
    item.addEventListener('click', function() {
        typeSelect.value = this.textContent; // Update dropdown dengan pilihan
        document.getElementById('typePopup').style.display = 'none'; // Sembunyikan popup
    });
});

// Render anggota dropdown
function renderAnggotaDropdown() {
    transactionAnggota.value = '';
    anggotaPopup.innerHTML = '';
    anggota.forEach((a, idx) => {
        const div = document.createElement('div');
        div.classList.add('popupItem');
        div.textContent = a;
        div.addEventListener('click', () => {
            transactionAnggota.value = a;
            anggotaPopup.style.display = 'none';
        });
        anggotaPopup.appendChild(div);
    });

    // Filter dropdown
    filterAnggota.innerHTML = '<option value="">Semua Anggota</option>';
    anggota.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        filterAnggota.appendChild(opt);
    });
}

// Update Transaksi Table & lainnya
function renderTransactionsTable() {
    // Implementasi render table...
}
