// Main script (transactions, modal, tooltip, chart)
let dateInput = document.getElementById("dateInput");
dateInput.value = new Date().toISOString().slice(0,10);
let members = JSON.parse(localStorage.getItem("members")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
transactions = transactions.map(t=>({...t, amount:Number(t.amount)||0, edited:t.edited||false, editHistory:t.editHistory||[]}));
const memberSelect = document.getElementById("memberSelect");
const filterMember = document.getElementById("filterMember");
const btnDeleteSelected = document.getElementById("btnDeleteSelected");
const tooltipDiv = document.getElementById("editTooltip");
function openForm(){ document.getElementById("formModal").classList.add("show"); }
function closeForm(){ document.getElementById("formModal").classList.remove("show"); }
// Fungsi transaksi, edit, delete, export, chart tetap sama dari versi sebelumnya
