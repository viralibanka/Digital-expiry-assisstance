const API_URL = "https://digital-expiry-assisstance.onrender.com";

let allProducts = [];

// ================= LOGIN =================

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("token", data.access_token);
            window.location.href = "dashboard.html";

        } else {

            document.getElementById("message").innerHTML =
                "Invalid Email or Password";

        }

    } catch (error) {

        console.log(error);

        document.getElementById("message").innerHTML =
            "Backend Connection Failed";

    }

}

// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("token");
    window.location.href = "login.html";

}
// ================= DOWNLOAD EXCEL =================

function downloadExcel() {

    const token = localStorage.getItem("token");

    fetch(`${API_URL}/products/export`, {

        headers: {
            "Authorization": "Bearer " + token
        }

    })

    .then(response => response.blob())

    .then(blob => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = "products.xlsx";

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(url);

    })

    .catch(error => {

        console.log(error);

        alert("Unable to download Excel.");

    });

}
// ================= ADD PRODUCT =================

async function addProduct() {

    const token = localStorage.getItem("token");

    const product = {

        product_name: document.getElementById("product_name").value,

        category: document.getElementById("category").value,

        quantity: Number(document.getElementById("quantity").value),

        manufacture_date: document.getElementById("manufacture_date").value,

        expiry_date: document.getElementById("expiry_date").value

    };

    const response = await fetch(`${API_URL}/products/`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            "Authorization": "Bearer " + token

        },

        body: JSON.stringify(product)

    });

    if (response.ok) {
        const data = await response.json();

        localStorage.setItem(
            "unit_" + data.id,
            document.getElementById("unit").value
        );
        alert("✅ Product Added Successfully");

        document.getElementById("product_name").value = "";
        document.getElementById("category").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("manufacture_date").value = "";
        document.getElementById("expiry_date").value = "";

        loadProducts();
        loadDashboard();

    } else {

        alert("Unable to add product.");

    }

}

// ================= LOAD PRODUCTS =================

async function loadProducts() {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/products/`, {

        headers: {
            "Authorization": "Bearer " + token
        }

    });
    allProducts = await response.json();

    allProducts.sort((a, b) => {

    return new Date(a.expiry_date) - new Date(b.expiry_date);

});

    displayProducts(allProducts);
    loadCategories();
    loadCategorySummary();
    showAlerts(allProducts);
    loadCharts();
    loadNotifications();

}

// ================= DISPLAY PRODUCTS =================

function displayProducts(products) {

    let html = "";

    const today = new Date();

    products.forEach(product => {
        const unit = localStorage.getItem("unit_" + product.id) || "";
        const expiry = new Date(product.expiry_date);

        const diffDays = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24)
        );

        let status = "";
        let color = "";

        if (diffDays < 0) {
            status = "🔴 Expired";
            color = "#e74c3c";
        }
        else if (diffDays <= 7) {
            status = "🟡 Expiring Soon";
            color = "#f39c12";
        }
        else {
            status = "🟢 Safe";
            color = "#27ae60";
        }
        html += `

<div class="card">

    <h3>📦 ${product.product_name}</h3>

    <p><b>Category:</b> ${product.category}</p>

    <p><b>Quantity:</b> ${product.quantity} ${unit}</p>

    <p><b>Manufacture:</b> ${product.manufacture_date}</p>

    <p><b>Expiry:</b> ${product.expiry_date}</p>
    <p><b>Days Left:</b>

${
    diffDays < 0
    ? "Expired"
    : diffDays + " Days"
}
</p>

    <p style="color:${color};font-weight:bold;">
        ${status}
    </p>

    <button onclick="editProduct(${product.id})" class="edit-btn">
        ✏ Edit
    </button>

    <button onclick="deleteProduct(${product.id})" class="delete-btn">
        🗑 Delete
    </button>

</div>

`;

    });

    document.getElementById("productList").innerHTML = html;

}
// =================ALERTS ==================
function showAlerts(products){

    const alertBox =
    document.getElementById("alertBox");

    let message = "";

    const today = new Date();

    products.forEach(product=>{

        const expiry =
        new Date(product.expiry_date);

        const days =
        Math.ceil(
        (expiry-today)/(1000*60*60*24)
        );

        if(days>=0 && days<=7){

            message +=
            `⚠ ${product.product_name} expires in ${days} day(s).<br>`;

        }

    });

    if(message!=""){

        alertBox.style.display="block";

        alertBox.innerHTML=
        "<b>Expiry Alerts</b><br><br>"+message;

    }
    else{

        alertBox.style.display="none";

    }

}
// =================DELETE FUNCTION =========
async function deleteProduct(id) {

    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/products/${id}`, {

        method: "DELETE",

        headers: {
            "Authorization": "Bearer " + token
        }

    });

    if (response.ok) {

        alert("Product deleted successfully");

        loadProducts();
        loadDashboard();

    } else {

        alert("Unable to delete product");

    }

}

// =================EDIT FUNCTION ============
async function editProduct(id) {

    const newQuantity = prompt("Enter new quantity:");

    if (newQuantity == null || newQuantity === "") return;

    const product = allProducts.find(p => p.id === id);

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/products/${id}`, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json",
            "Authorization": "Bearer " + token

        },

        body: JSON.stringify({

            product_name: product.product_name,
            category: product.category,
            quantity: Number(newQuantity),
            manufacture_date: product.manufacture_date,
            expiry_date: product.expiry_date

        })

    });

    if (response.ok) {

        alert("Product updated successfully");

        loadProducts();
        loadDashboard();

    } else {

        alert("Unable to update product");

    }

}

// ================= SEARCH =================

function searchProducts() {

    const keyword = document
        .getElementById("searchBox")
        .value
        .toLowerCase();

    const filtered = allProducts.filter(product =>

        product.product_name.toLowerCase().includes(keyword) ||

        product.category.toLowerCase().includes(keyword)

    );

    displayProducts(filtered);

}
// ==================FITER CATEGORY ============
function filterCategory() {

    const selected =
        document.getElementById("categoryFilter").value;

    if (selected === "All") {

        displayProducts(allProducts);
        return;

    }

    const filtered = allProducts.filter(product =>

        product.category.toLowerCase() === selected.toLowerCase()

    );

    displayProducts(filtered);

}
// ================= LOAD CATEGORY =============
function loadCategories() {

    const dropdown =
        document.getElementById("categoryFilter");

    dropdown.innerHTML =
        '<option value="All">All Categories</option>';

    const categories = [];

    allProducts.forEach(product => {

        if (!categories.includes(product.category)) {

            categories.push(product.category);

        }

    });

    categories.sort();

    categories.forEach(category => {

        dropdown.innerHTML +=
            `<option value="${category}">
                ${category}
            </option>`;

    });

}
// ==========LOAD CATEGORY SUMMARY ============
function loadCategorySummary(){

    const summary =
    document.getElementById("categorySummary");

    let counts = {};

    allProducts.forEach(product=>{

        if(counts[product.category]){

            counts[product.category]++;

        }
        else{

            counts[product.category]=1;

        }

    });

    let html="";

    for(let category in counts){

        html += `

        <div class="summary-card">

            ${category}<br>

            ${counts[category]} Products

        </div>

        `;

    }

    summary.innerHTML=html;

}
// ================= DASHBOARD =================

async function loadDashboard() {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/products/dashboard`, {

        headers: {
            "Authorization": "Bearer " + token
        }

    });

    const data = await response.json();

    document.getElementById("totalProducts").innerHTML =
        data.total_products;

    document.getElementById("expiredProducts").innerHTML =
        data.expired_products;

    document.getElementById("expiring7").innerHTML =
        data.expiring_in_7_days;

    document.getElementById("expiring30").innerHTML =
        data.expiring_in_30_days;

}

// ================= PAGE LOAD =================

window.onload = function () {

    if (window.location.pathname.includes("dashboard.html")) {

        loadProducts();
        loadDashboard();

    }

};
// ===========QUICK AI =============
function quickAI(question){

    document.getElementById("aiQuestion").value = question;

    askAI();

}
// ================= AI CHAT =================

async function askAI() {

    const token = localStorage.getItem("token");

    const question = document.getElementById("aiQuestion").value;

    if (question.trim() === "") {
        alert("Please enter a question.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/ai/chat`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                question: question
            })

        });

        const data = await response.json();

        if (response.ok) {

            document.getElementById("aiResponse").innerHTML =
                "<b>🤖 AI:</b><br>" + data.answer;

        } else {

            document.getElementById("aiResponse").innerHTML =
                "❌ " + JSON.stringify(data);

        }

    } catch (error) {

        console.log(error);

        document.getElementById("aiResponse").innerHTML =
            "Backend connection failed.";

    }

}
// ==============PIE CHART =================
let categoryChart;
let statusChart;

function loadCharts(){

    const counts={};

    let expired=0;
    let expiring=0;
    let safe=0;

    const today=new Date();

    allProducts.forEach(product=>{

        counts[product.category]=(counts[product.category]||0)+1;

        const days=Math.ceil(
            (new Date(product.expiry_date)-today)/(1000*60*60*24)
        );

        if(days<0)
            expired++;

        else if(days<=7)
            expiring++;

        else
            safe++;

    });

    if(categoryChart)
        categoryChart.destroy();

    if(statusChart)
        statusChart.destroy();

    categoryChart=new Chart(
        document.getElementById("categoryChart"),
        {
            type:"pie",
            data:{
                labels:Object.keys(counts),
                datasets:[{
                    data:Object.values(counts)
                }]
            }
        }
    );

    statusChart=new Chart(
        document.getElementById("statusChart"),
        {
            type:"bar",
            data:{
                labels:["Expired","Expiring","Safe"],
                datasets:[{
                    label:"Products",
                    data:[expired,expiring,safe]
                }]
            }
        }
    );

}
// ===============NOTIFICATIONS =================
function toggleNotifications(){

    const panel =
    document.getElementById("notificationPanel");

    if(panel.style.display==="block"){

        panel.style.display="none";

    }else{

        panel.style.display="block";

    }

}

function loadNotifications(){

    let html="";

    let count=0;

    const today=new Date();

    allProducts.forEach(product=>{

        const days=Math.ceil(

            (new Date(product.expiry_date)-today)/(1000*60*60*24)

        );

        if(days>=0 && days<=7){

            count++;

            html+=`

            <p>⚠ <b>${product.product_name}</b>

            expires in ${days} day(s).</p>

            <hr>

            `;

        }

    });

    if(count===0){

        html="<p>No notifications 🎉</p>";

    }

    document.getElementById("notificationList").innerHTML=html;

    document.getElementById("notificationCount").innerHTML=count;

}
// ================= DARK MODE =================

function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem("theme", "dark");

    } else {

        localStorage.setItem("theme", "light");

    }

}

//=============== Load saved theme ============
window.addEventListener("load", () => {

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark-mode");

    }

});
// ==============DOWNLOAD FUNCTION =================
function downloadPDF() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login again.");
        return;
    }

    fetch(`${API_URL}/products/export-pdf`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        return response.blob();

    })
    .then(blob => {

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "expiryvault_products.pdf";

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

    })
    .catch(error => {
        console.error(error);
        alert(error.message);
    });

}
