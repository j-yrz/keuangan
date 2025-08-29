// Helper functions
function formatRupiah(angka){ return "Rp "+angka.toLocaleString("id-ID"); }
function parseRupiah(str){ return Number(str.replace(/[^0-9]/g,""))||0; }
function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); localStorage.setItem("members", JSON.stringify(members)); }
function renderMembers(){ 
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>'; 
  members.forEach(m=>{ memberSelect.innerHTML += `<option value="${m}">${m}</option>`; }); 
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option><option value="-">- Hapus Anggota</option>`;
}