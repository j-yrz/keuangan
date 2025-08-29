// Helper functions
function formatRupiah(angka){ return "Rp "+angka.toLocaleString("id-ID"); }
function parseRupiah(str){ return Number(str.replace(/[^0-9]/g,""))||0; }
function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); localStorage.setItem("members", JSON.stringify(members)); }
function renderMembers(){ 
  memberSelect.innerHTML = '<option value="" disabled selected>Pilih anggota</option>'; 
  members.forEach(m=>{ memberSelect.innerHTML += `<option value="${m}">${m}</option>`; }); 
  memberSelect.innerHTML += `<option value="+">+ Tambah Anggota</option><option value="-">- Hapus Anggota</option>`;
  filterMember.innerHTML = '<option value="all">Semua Anggota</option>';
  members.forEach(m=>filterMember.innerHTML+=`<option value="${m}">${m}</option>`);
}
function memberOptionChange(){ const val=memberSelect.value;
  if(val==="+"){ const name=prompt("Masukkan nama anggota baru:").trim(); if(name && !members.includes(name)){ members.push(name); saveData(); renderMembers(); } } 
  else if(val==="-"){ if(members.length===0){alert("Tidak ada anggota tersisa!"); return;} const name=prompt(`Pilih anggota untuk dihapus:\n${members.join(", ")}`); if(name && members.includes(name)){ if(confirm(`Hapus anggota "${name}"?`)){ members=members.filter(m=>m!==name); saveData(); renderMembers(); } } } 
}