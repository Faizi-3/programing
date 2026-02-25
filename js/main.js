let members = JSON.parse(localStorage.getItem("members")) || [];
let sites = JSON.parse(localStorage.getItem("sites")) || [];
let records = JSON.parse(localStorage.getItem("records")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];

let editIndex = -1;

const nameSelect = document.getElementById("nameSelect");
const siteSelect = document.getElementById("siteSelect");
const tableBody = document.getElementById("tableBody");
const submitBtn = document.getElementById("submitBtn");

// Load members/sites
function loadMembers(){ 
    nameSelect.innerHTML = `<option value="">Select Name</option>`;
    members.forEach(m => nameSelect.innerHTML += `<option value="${m}">${m}</option>`);
}
function loadSites(){ 
    siteSelect.innerHTML = `<option value="">Select Site Name</option>`;
    sites.forEach(s => siteSelect.innerHTML += `<option value="${s}">${s}</option>`);
}

// Form Submit
document.getElementById("attendanceForm").addEventListener("submit", function(e){
    e.preventDefault();
    let record = {
        site: siteSelect.value,
        name: nameSelect.value,
        date: document.getElementById("date").value,
        present: document.getElementById("present").value === "true" ? "Yes":"No",
        meal: document.getElementById("meal").value === "true" ? "Yes":"No",
        paidBy: document.getElementById("paidBy").value || "-"
    };

    if(editIndex >=0){
        records[editIndex] = record;
        editIndex = -1;
        submitBtn.textContent = "Add Record";
    } else {
        records.push(record);
    }

    localStorage.setItem("records", JSON.stringify(records));
    this.reset();
    renderTable();
});

// Render Table
function renderTable(){
    tableBody.innerHTML = "";
    records.forEach((r,i)=>{
        tableBody.innerHTML += `
        <tr>
            <td>${r.site}</td>
            <td>${r.name}</td>
            <td>${r.date}</td>
            <td>${r.present}</td>
            <td>${r.meal}</td>
            <td>${r.paidBy}</td>
            <td>
                <button class="edit-btn" onclick="editRecord(${i})">Edit</button>
                <button class="delete-btn" onclick="deleteRecord(${i})">Delete</button>
            </td>
        </tr>`;
    });
}

// Edit Record
function editRecord(index){
    let r = records[index];
    siteSelect.value = r.site;
    nameSelect.value = r.name;
    document.getElementById("date").value = r.date;
    document.getElementById("present").value = r.present === "Yes";
    document.getElementById("meal").value = r.meal === "Yes";
    document.getElementById("paidBy").value = r.paidBy === "-" ? "" : r.paidBy;
    submitBtn.textContent = "Update Record";
    editIndex = index;
}

// Delete Record
function deleteRecord(index){
    records.splice(index,1);
    localStorage.setItem("records", JSON.stringify(records));
    renderTable();
}

// ensure at least one user exists so login can work
if(users.length === 0){
    users.push({ username: 'admin', password: 'admin', role: 'admin', pages: ['home', 'attendance', 'admin'] });
    users.push({ username: 'user', password: 'user', role: 'user', pages: ['attendance'] });
    localStorage.setItem('users', JSON.stringify(users));
}

loadMembers();
loadSites();
renderTable();
checkLogin();

// login button handler
document.getElementById('loginBtn')?.addEventListener('click', function(){
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const found = users.find(x=>x.username === u && x.password === p);
    if(found){
        localStorage.setItem('loggedInUser', u);
        localStorage.setItem('userPages', JSON.stringify(found.pages||[]));
        localStorage.setItem('userRole', found.role || 'user');
        checkLogin();
    } else {
        document.getElementById('loginError').textContent = "Invalid credentials";
    }
});

function checkLogin(){
    const logged = localStorage.getItem('loggedInUser');
    if(logged){
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        const logout = document.getElementById('logoutLink');
        if(logout){
            logout.style.display = 'inline';
            logout.addEventListener('click', function(e){
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userPages');
                localStorage.removeItem('userRole');
                location.reload();
            });
        }
        // hide nav links not permitted
        const pages = JSON.parse(localStorage.getItem('userPages') || '[]');
        document.querySelectorAll('.nav-links a').forEach(a=>{
            const href = a.getAttribute('href');
            if(href === 'index.html' && !pages.includes('home')) a.style.display = 'none';
            if(href === 'attendance.html' && !pages.includes('attendance')) a.style.display = 'none';
            if(href === 'admin.html' && !pages.includes('admin')) a.style.display = 'none';
        });
    }
}
