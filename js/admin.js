let members = JSON.parse(localStorage.getItem("members")) || [];
let sites = JSON.parse(localStorage.getItem("sites")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let editingUserIndex = -1;

/* --- Sites --- */
function addSite(){
    let site = document.getElementById("siteNameInput").value.trim();
    if(site==="") return;
    sites.push(site);
    localStorage.setItem("sites", JSON.stringify(sites));
    document.getElementById("siteNameInput").value="";
    renderSites();
}

function editSite(index){
    let newName = prompt("Edit Site Name:", sites[index]);
    if(newName){
        sites[index] = newName.trim();
        localStorage.setItem("sites", JSON.stringify(sites));
        renderSites();
    }
}

function deleteSite(index){
    sites.splice(index,1);
    localStorage.setItem("sites", JSON.stringify(sites));
    renderSites();
}

function renderSites(){
    const tbody = document.getElementById("siteTableBody");
    tbody.innerHTML = "";
    sites.forEach((s,i)=>{
        tbody.innerHTML += `
        <tr>
            <td>${s}</td>
            <td>
                <button class="edit-btn" onclick="editSite(${i})">Edit</button>
                <button class="delete-btn" onclick="deleteSite(${i})">Delete</button>
            </td>
        </tr>`;
    });
}

/* --- Members --- */
function addMember(){
    let name = document.getElementById("memberName").value.trim();
    if(name==="") return;
    members.push(name);
    localStorage.setItem("members", JSON.stringify(members));
    document.getElementById("memberName").value="";
    renderMembers();
}

function editMember(index){
    let newName = prompt("Edit Member Name:", members[index]);
    if(newName){
        members[index] = newName.trim();
        localStorage.setItem("members", JSON.stringify(members));
        renderMembers();
    }
}

function deleteMember(index){
    members.splice(index,1);
    localStorage.setItem("members", JSON.stringify(members));
    renderMembers();
}

function renderMembers(){
    const tbody = document.getElementById("memberTableBody");
    tbody.innerHTML = "";
    members.forEach((m,i)=>{
        tbody.innerHTML += `
        <tr>
            <td>${m}</td>
            <td>
                <button class="edit-btn" onclick="editMember(${i})">Edit</button>
                <button class="delete-btn" onclick="deleteMember(${i})">Delete</button>
            </td>
        </tr>`;
    });
}

/* --- Users (access control) --- */
function addUser(){
    let u = document.getElementById("accessUser").value.trim();
    let p = document.getElementById("accessPass").value;
    let role = document.getElementById("accessRole").value;
    let selected = Array.from(document.querySelectorAll('.page-checkbox:checked')).map(cb=>cb.value);
    if(u === "" || p === "" || selected.length === 0) return;
    
    if(editingUserIndex >= 0){
        // Update existing user
        users[editingUserIndex] = { username: u, password: p, role: role, pages: selected };
        editingUserIndex = -1;
        document.getElementById('userActionBtn').textContent = 'Add User';
    } else {
        // Add new user
        users.push({ username: u, password: p, role: role, pages: selected });
    }
    localStorage.setItem("users", JSON.stringify(users));
    clearUserForm();
    renderUsers();
}

function editUser(index){
    let u = users[index];
    document.getElementById("accessUser").value = u.username;
    document.getElementById("accessPass").value = u.password;
    document.getElementById("accessRole").value = u.role || 'user';
    // set checkboxes to user's pages
    document.querySelectorAll('.page-checkbox').forEach(cb=>{
        cb.checked = u.pages.includes(cb.value);
    });
    editingUserIndex = index;
    document.getElementById('userActionBtn').textContent = 'Update User';
}

function deleteUser(index){
    users.splice(index,1);
    localStorage.setItem("users", JSON.stringify(users));
    if(editingUserIndex === index){
        editingUserIndex = -1;
        document.getElementById('userActionBtn').textContent = 'Add User';
        clearUserForm();
    }
    renderUsers();
}

function clearUserForm(){
    document.getElementById("accessUser").value = "";
    document.getElementById("accessPass").value = "";
    document.getElementById("accessRole").value = "user";
    document.querySelectorAll('.page-checkbox').forEach(cb=>cb.checked = false);
}

function renderUsers(){
    const tbody = document.getElementById("userTableBody");
    if(!tbody) return; // may be absent during login layer
    tbody.innerHTML = "";
    users.forEach((u,i)=>{
        const pages = (u.pages||[]).join(', ');
        const role = (u.role || 'user').charAt(0).toUpperCase() + (u.role || 'user').slice(1);
        tbody.innerHTML += `
        <tr>
            <td>${u.username}</td>
            <td>${u.password}</td>
            <td><span class="role-badge ${u.role || 'user'}">${role}</span></td>
            <td>${pages}</td>
            <td>
                <button class="edit-btn" onclick="editUser(${i})">Edit</button>
                <button class="delete-btn" onclick="deleteUser(${i})">Delete</button>
            </td>
        </tr>`;
    });
}

function checkLogin(){
    const logged = localStorage.getItem("loggedInUser");
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
        // hide nav links based on pages
        const pages = JSON.parse(localStorage.getItem('userPages') || '[]');
        document.querySelectorAll('.nav-links a').forEach(a=>{
            const href = a.getAttribute('href');
            if(href === 'index.html' && !pages.includes('home')) a.style.display = 'none';
            if(href === 'attendance.html' && !pages.includes('attendance')) a.style.display = 'none';
            if(href === 'admin.html' && !pages.includes('admin')) a.style.display = 'none';
        });
    }
}

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

// ensure at least one user exists (default credentials)
if(users.length === 0) {
    users.push({ username: 'admin', password: 'admin', role: 'admin', pages: ['home', 'attendance', 'admin'] });
    users.push({ username: 'user', password: 'user', role: 'user', pages: ['attendance'] });
    localStorage.setItem('users', JSON.stringify(users));
}

// dropdown toggle
document.getElementById('pagesDropdownBtn')?.addEventListener('click', function(e){
    e.preventDefault();
    const menu = document.getElementById('pagesMenu');
    menu.classList.toggle('active');
});

// close dropdown when clicking outside
document.addEventListener('click', function(e){
    const multiselect = document.querySelector('.custom-multiselect');
    if(multiselect && !multiselect.contains(e.target)){
        const menu = document.getElementById('pagesMenu');
        if(menu) menu.classList.remove('active');
    }
});

renderSites();
renderMembers();
renderUsers();
checkLogin();