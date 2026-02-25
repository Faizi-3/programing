let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
let editIndex = -1;

// Get last 15 days records
function getLast15DaysRecords(){
    const today = new Date();
    const fifteenDaysAgo = new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000));
    
    return records.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= fifteenDaysAgo && recordDate <= today;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Update date range heading
function updateDateRangeHeading(){
    const today = new Date();
    const fifteenDaysAgo = new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000));
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const startDate = fifteenDaysAgo.toLocaleDateString('en-US', options);
    const endDate = today.toLocaleDateString('en-US', options);
    
    const heading = document.getElementById("dateRangeHeading");
    if(heading){
        heading.textContent = `Last 15 Days Attendance (${startDate} - ${endDate})`;
    }
}

function renderAttendanceTable(){
    const tbody = document.getElementById("attendanceTableBody");
    tbody.innerHTML = "";
    const last15Days = getLast15DaysRecords();
    
    if(last15Days.length === 0){
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No records found</td></tr>';
        return;
    }
    
    last15Days.forEach((r, i) => {
        const originalIndex = records.indexOf(r);
        tbody.innerHTML += `
        <tr>
            <td>${r.name}</td>
            <td>${r.site}</td>
            <td>${r.date}</td>
            <td>
                <button class="edit-btn" onclick="editRecord(${originalIndex})">Edit</button>
                <button class="delete-btn" onclick="deleteRecord(${originalIndex})">Delete</button>
            </td>
        </tr>`;
    });
    updateDateRangeHeading();
}

// Edit record
function editRecord(index){
    const r = records[index];
    document.getElementById("nameSelect").value = r.name;
    document.getElementById("siteSelect").value = r.site;
    document.getElementById("date").value = r.date;
    editIndex = index;
}

// Delete record
function deleteRecord(index){
    records.splice(index,1);
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
    renderAttendanceTable();
}

// Form Submit
document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById("attendanceForm");
    if(form){
        form.addEventListener("submit", function(e){
            e.preventDefault();
            let record = {
                site: document.getElementById("siteSelect").value,
                name: document.getElementById("nameSelect").value,
                date: document.getElementById("date").value
            };

            if(editIndex >= 0){
                records[editIndex] = record;
                editIndex = -1;
            } else {
                records.push(record);
            }

            localStorage.setItem("attendanceRecords", JSON.stringify(records));
            this.reset();
            renderAttendanceTable();
        });
    }
});

renderAttendanceTable();