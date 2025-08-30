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

// Event Listeners
// Toggle saldo visibility
let saldoVisible = true;
toggleSaldo.addEventListener('click', () => {
    saldoVisible = !saldoVisible;
    saldoCard.textContent = saldoVisible ? `Saldo: Rp ${calculateSaldo()}` : 'Saldo: ****';
    saldoCard.appendChild(toggleSaldo);
});

// Modal Form - menampilkan saat tombol "Buat Catatan" diklik
showFormBtn.addEventListener('click', () => {
    formModal.classList.add('show');  // Menambahkan kelas show untuk menampilkan modal
});

// Menutup modal saat klik close button atau area luar modal
closeBtn.addEventListener('click', () => {
    formModal.classList.remove('show');  // Menghapus kelas show untuk menyembunyikan modal
});
window.addEventListener('click', (e) => {
    if (e.target === formModal) {
        formModal.classList.remove('show');  // Menghapus kelas show jika klik di luar modal
    }
});

// Tombol Batal
const cancelBtn = document.getElementById('cancelBtn');
cancelBtn.addEventListener('click', () => {
    formModal.classList.remove('show');
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

// Popup Pilih Anggota
transactionAnggota.addEventListener('click', (e) => {
    e.preventDefault();
    const popup = document.getElementById('anggotaPopup');
    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block'; // Toggle visibility
});

// Menutup Popup Anggota jika klik di luar
window.addEventListener('click', (e) => {
    if (!e.target.closest('#anggotaPopup') && !e.target.closest('#transactionAnggotaInput')) {
        document.getElementById('anggotaPopup').style.display = 'none';
    }
});

// Render Anggota Popup
function renderAnggotaPopup() {
    anggotaPopup.innerHTML = '';
    anggota.forEach(a => {
        const div = document.createElement('div');
        div.classList.add('popupItem');
        div.textContent = a;
        div.addEventListener('click', () => {
            transactionAnggota.value = a;
            anggotaPopup.style.display = 'none';
        });
        anggotaPopup.appendChild(div);
}

// Render anggota dropdown filter
function renderAnggotaDropdown() {
    filterAnggota.innerHTML = '<option value="">Semua Anggota</option>';
    anggota.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        filterAnggota.appendChild(opt);
    });
}

// Calculate Summary
function calculateSaldo() {
    let pemasukan = transactions.filter(t => t.type === 'Pemasukan').reduce((a, b) => a + Number(b.amount), 0);
    let pengeluaran = transactions.filter(t => t.type === 'Pengeluaran').reduce((a, b) => a + Number(b.amount), 0);
    return pemasukan - pengeluaran;
}

function updateSummary() {
    const pemasukan = transactions.filter(t => t.type === 'Pemasukan').reduce((a, b) => a + Number(b.amount), 0);
    const pengeluaran = transactions.filter(t => t.type === 'Pengeluaran').reduce((a, b) => a + Number(b.amount), 0);
    saldoCard.textContent = saldoVisible ? `Saldo: Rp ${calculateSaldo()}` : 'Saldo: ****';
    saldoCard.appendChild(toggleSaldo);
    pemasukanCard.textContent = `Pemasukan: Rp ${formatRupiah(pemasukan)}`;
    pengeluaranCard.textContent = `Pengeluaran: Rp ${formatRupiah(pengeluaran)}`;
}

// Format Rupiah
function formatRupiah(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

// Render table
function renderTransactionsTable() {
    transactionsTableBody.innerHTML = '';
    const typeFilterVal = document.getElementById('filterType').value;
    const anggotaFilterVal = filterAnggota.value;
    const searchNoteVal = document.getElementById('searchNote').value.toLowerCase();

    transactions.forEach((t, i) => {
        if (typeFilterVal && t.type !== typeFilterVal) return;
        if (anggotaFilterVal && t.anggota !== anggotaFilterVal) return;
        if (searchNoteVal && !t.note.toLowerCase().includes(searchNoteVal)) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="rowCheckbox" data-index="${i}"></td>
            <td>${i + 1}</td>
            <td>${t.date}</td>
            <td>${t.type}</td>
            <td>${formatRupiah(t.amount)}</td>
            <td>${t.note}</td>
            <td>${t.deskripsi}</td>
            <td>${t.sumberDana}</td>
            <td>${t.anggota}</td>
            <td>
                <button class="editBtn">✎</button>
                <button class="statusBtn">Status</button>
            </td>
        `;
        transactionsTableBody.appendChild(tr);

        // Edit
        tr.querySelector('.editBtn').addEventListener('click', () => {
            editingIndex = i;
            formModal.classList.add('show');
            document.getElementById('type').value = t.type;
            document.getElementById('amount').value = t.amount;
            document.getElementById('note').value = t.note;
            document.getElementById('transactionDate').value = t.date;
            document.getElementById('deskripsi').value = t.deskripsi;
            document.getElementById('sumberDana').value = t.sumberDana;
            transactionAnggota.value = t.anggota;
            renderAnggotaPopup();
        });
    });

    // Checkbox logic
    const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
    rowCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            deleteSelectedBtn.style.display = document.querySelectorAll('.rowCheckbox:checked').length > 0 ? 'inline-block' : 'none';
        });
    });
}

// Submit form
form.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;
    const note = document.getElementById('note').value;
    const date = document.getElementById('transactionDate').value;
    const deskripsi = document.getElementById('deskripsi').value;
    const sumberDana = document.getElementById('sumberDana').value;
    let anggotaVal = transactionAnggota.value;

    const transaction = { type, amount, note, date, deskripsi, sumberDana, anggota: anggotaVal };
    if (editingIndex !== null) {
        transactions[editingIndex] = transaction;
        editingIndex = null;
    } else {
        transactions.push(transaction);
    }

    localStorage.setItem('transactions', JSON.stringify(transactions));
    form.reset();
    transactionDate.value = new Date().toISOString().split('T')[0];
    renderTransactionsTable();
    updateSummary();
    formModal.classList.remove('show');
});

// Delete selected
deleteSelectedBtn.addEventListener('click', () => {
    const checkedIndexes = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb => parseInt(cb.dataset.index));
    transactions = transactions.filter((_, i) => !checkedIndexes.includes(i));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactionsTable();
    updateSummary();
    deleteSelectedBtn.style.display = 'none';
    checkAll.checked = false;
});

// Apply filter
applyFilterBtn.addEventListener('click', e => {
    e.preventDefault();
    renderTransactionsTable();
});

// Export pop-up
exportBtn.addEventListener('click', () => exportOptions.classList.toggle('hidden'));
exportOptions.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        let csv = 'Tanggal,Jenis,Jumlah,Keterangan,Deskripsi,SumberDana,Anggota\n';
        transactions.forEach(t => {
            csv += `${t.date},${t.type},${t.amount},${t.note},${t.deskripsi},${t.sumberDana},${t.anggota}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `transaksi.${type}`; a.click();
        URL.revokeObjectURL(url);
        exportOptions.classList.add('hidden');
    });
});

// Chart.js
const ctx = document.getElementById('transactionChart').getContext('2d');
let chart;
function updateChart() {
    const pemasukan = transactions.filter(t => t.type === 'Pemasukan').reduce((a, b) => a + Number(b.amount), 0);
    const pengeluaran = transactions.filter(t => t.type === 'Pengeluaran').reduce((a, b) => a + Number(b.amount), 0);
    const data = { labels: ['Pemasukan', 'Pengeluaran'], datasets: [{ label: 'Jumlah (Rp)', data: [pemasukan, pengeluaran], backgroundColor: ['#4CAF50', '#F44336'] }] };
    if (chart) chart.destroy();
    chart = new Chart(ctx, { type: 'bar', data: data, options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Grafik Transaksi' } } } });
}

// Init
document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
document.getElementById('home').style.display = 'block';
renderAnggotaPopup();
renderTransactionsTable();
updateSummary();
updateChart();

// Menangani klik pada menu
const homeLink = document.getElementById('homeLink');
const historyLink = document.getElementById('historyLink');
const grafikLink = document.getElementById('grafikLink');

// Menampilkan section yang relevan
homeLink.addEventListener('click', () => {
    document.getElementById('home').style.display = 'block';
    document.getElementById('catatan').style.display = 'none';
    document.getElementById('grafik').style.display = 'none';
});

historyLink.addEventListener('click', () => {
    document.getElementById('home').style.display = 'none';
    document.getElementById('catatan').style.display = 'block';
    document.getElementById('grafik').style.display = 'none';
});

grafikLink.addEventListener('click', () => {
    document.getElementById('home').style.display = 'none';
    document.getElementById('catatan').style.display = 'none';
    document.getElementById('grafik').style.display = 'block';
});
