const API = "http://localhost:5000/api";


/* =====================================================
   LOGIN / REGISTER PAGE
===================================================== */

function showLogin() {

    document.getElementById("loginForm")
        .classList.remove("hidden");

    document.getElementById("registerForm")
        .classList.add("hidden");

    document.getElementById("loginTab")
        .classList.add("active");

    document.getElementById("registerTab")
        .classList.remove("active");
}


function showRegister() {

    document.getElementById("loginForm")
        .classList.add("hidden");

    document.getElementById("registerForm")
        .classList.remove("hidden");

    document.getElementById("loginTab")
        .classList.remove("active");

    document.getElementById("registerTab")
        .classList.add("active");
}


/* =====================================================
   REGISTER
===================================================== */

async function register() {

    const name =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value.trim();

    const message =
        document.getElementById("registerMessage");

    if (!name || !email || !password) {

        message.innerText =
            "Please fill all fields.";

        return;
    }

    try {

        const response = await fetch(
            `${API}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.innerText =
                data.message || "Registration failed.";

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href = "dashboard.html";

    } catch (error) {

        message.innerText =
            "Server connection failed.";
    }
}


/* =====================================================
   LOGIN
===================================================== */

async function login() {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value.trim();

    const message =
        document.getElementById("loginMessage");

    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        return;
    }

    try {

        const response = await fetch(
            `${API}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.innerText =
                data.message || "Login failed.";

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href =
            "dashboard.html";

    } catch (error) {

        message.innerText =
            "Could not connect to server.";
    }
}


/* =====================================================
   AUTH HEADER
===================================================== */

function getHeaders() {

    const token =
        localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


/* =====================================================
   CHECK LOGIN
===================================================== */

function checkLogin() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        window.location.href = "index.html";

        return false;
    }

    return true;
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";
}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showSection(sectionId, button) {

    const sections =
        document.querySelectorAll(".page-section");

    for (let i = 0; i < sections.length; i++) {

        sections[i].classList.add("hidden");
    }

    document.getElementById(sectionId)
        .classList.remove("hidden");


    const buttons =
        document.querySelectorAll(".nav-item");

    for (let i = 0; i < buttons.length; i++) {

        buttons[i].classList.remove("active");
    }

    if (button) {
        button.classList.add("active");
    }


    const titles = {

        dashboardSection: "Dashboard",

        expensesSection: "Expenses",

        incomeSection: "Income",

        budgetSection: "Smart Budget",

        emergencySection: "Emergency Fund",

        futureSection: "Future Expenses"

    };

    document.getElementById("pageTitle")
        .innerText = titles[sectionId];
}


function showSectionById(sectionId) {

    const buttons =
        document.querySelectorAll(".nav-item");

    let selectedButton = null;

    if (sectionId === "dashboardSection") {
        selectedButton = buttons[0];
    }

    if (sectionId === "expensesSection") {
        selectedButton = buttons[1];
    }

    if (sectionId === "incomeSection") {
        selectedButton = buttons[2];
    }

    if (sectionId === "budgetSection") {
        selectedButton = buttons[3];
    }

    if (sectionId === "emergencySection") {
        selectedButton = buttons[4];
    }

    if (sectionId === "futureSection") {
        selectedButton = buttons[5];
    }

    showSection(sectionId, selectedButton);
}


/* =====================================================
   DATE
===================================================== */

function formatDate(dateString) {

    const date =
        new Date(dateString);

    const day =
        String(date.getDate()).padStart(2, "0");

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const month =
        months[date.getMonth()];

    const year =
        date.getFullYear();

    let hours =
        date.getHours();

    const minutes =
        String(date.getMinutes())
            .padStart(2, "0");

    const ampm =
        hours >= 12 ? "pm" : "am";

    hours =
        hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}


/* =====================================================
   CURRENCY
===================================================== */

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN", {
                maximumFractionDigits: 2
            });
}


/* =====================================================
   LOAD DASHBOARD
===================================================== */

async function loadDashboard() {

    if (!checkLogin()) {
        return;
    }

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (user) {

        document.getElementById(
            "sidebarName"
        ).innerText = user.name;

        document.getElementById(
            "sidebarAvatar"
        ).innerText =
            user.name.charAt(0).toUpperCase();

        document.getElementById(
            "welcomeText"
        ).innerText =
            `Welcome back, ${user.name}!`;
    }

    document.getElementById(
        "currentDate"
    ).innerText =
        formatDate(new Date());


    await loadDashboardSummary();

    await loadExpenses();

    await loadIncome();

    await loadBudgets();

    await loadEmergencyFund();

    await loadFutureExpenses();
}


/* =====================================================
   DASHBOARD SUMMARY
===================================================== */

async function loadDashboardSummary() {

    try {

        const response =
            await fetch(
                `${API}/dashboard`,
                {
                    headers: getHeaders()
                }
            );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();


        document.getElementById(
            "dashboardIncome"
        ).innerText =
            formatMoney(data.totalIncome);


        document.getElementById(
            "dashboardExpense"
        ).innerText =
            formatMoney(data.totalExpenses);


        document.getElementById(
            "dashboardBalance"
        ).innerText =
            formatMoney(data.balance);


        let savingRate = 0;

        if (data.totalIncome > 0) {

            savingRate =
                (
                    data.balance /
                    data.totalIncome
                ) * 100;
        }

        if (savingRate < 0) {
            savingRate = 0;
        }

        document.getElementById(
            "savingRate"
        ).innerText =
            savingRate.toFixed(1) + "%";


        displayCategoryChart(
            data.categoryTotals
        );

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   CATEGORY CHART
===================================================== */

function displayCategoryChart(categoryTotals) {

    const chart =
        document.getElementById(
            "categoryChart"
        );

    chart.innerHTML = "";

    const categories =
        Object.keys(categoryTotals);

    if (categories.length === 0) {

        chart.innerHTML =
            "<p style='color:#8a93a2'>No expenses recorded yet.</p>";

        return;
    }

    let max = 0;

    for (let i = 0; i < categories.length; i++) {

        if (
            categoryTotals[categories[i]]
            > max
        ) {

            max =
                categoryTotals[categories[i]];
        }
    }


    for (let i = 0; i < categories.length; i++) {

        const category =
            categories[i];

        const amount =
            categoryTotals[category];

        let percentage =
            (amount / max) * 100;

        const row =
            document.createElement("div");

        row.className =
            "category-row";

        row.innerHTML = `

            <div class="category-info">

                <span>${category}</span>

                <span>${formatMoney(amount)}</span>

            </div>

            <div class="category-bar">

                <div
                    class="category-fill"
                    style="width:${percentage}%">
                </div>

            </div>

        `;

        chart.appendChild(row);
    }
}


/* =====================================================
   ADD EXPENSE
===================================================== */

async function addExpense() {

    const amount =
        document.getElementById(
            "expenseAmount"
        ).value;

    const category =
        document.getElementById(
            "expenseCategory"
        ).value;

    const description =
        document.getElementById(
            "expenseDescription"
        ).value;

    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        ).value;

    const message =
        document.getElementById(
            "expenseMessage"
        );


    if (!amount || !category) {

        message.innerText =
            "Please enter amount and category.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/expenses`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({

                        amount: Number(amount),

                        category: category,

                        description: description,

                        paymentMethod: paymentMethod

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerText =
                data.message;

            return;
        }


        message.innerText =
            "Expense added successfully.";


        document.getElementById(
            "expenseAmount"
        ).value = "";

        document.getElementById(
            "expenseCategory"
        ).value = "";

        document.getElementById(
            "expenseDescription"
        ).value = "";


        await loadExpenses();

        await loadDashboardSummary();

    } catch (error) {

        message.innerText =
            "Could not connect to server.";
    }
}


/* =====================================================
   LOAD EXPENSES
===================================================== */

async function loadExpenses() {

    try {

        const response =
            await fetch(
                `${API}/expenses`,
                {
                    headers: getHeaders()
                }
            );

        const expenses =
            await response.json();


        const table =
            document.getElementById(
                "expenseTable"
            );

        const recentTable =
            document.getElementById(
                "recentExpenseTable"
            );


        table.innerHTML = "";

        recentTable.innerHTML = "";


        for (let i = 0; i < expenses.length; i++) {

            const expense =
                expenses[i];


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${formatDate(expense.date)}
                </td>

                <td>
                    ${expense.category}
                </td>

                <td>
                    ${expense.description || "-"}
                </td>

                <td>
                    ${expense.paymentMethod}
                </td>

                <td class="amount-cell">
                    ${formatMoney(expense.amount)}
                </td>

                <td>

                    <button
                        class="delete-button"
                        onclick="deleteExpense('${expense._id}')">

                        Delete

                    </button>

                </td>

            `;


            table.appendChild(row);


            if (i < 5) {

                const recentRow =
                    document.createElement("tr");


                recentRow.innerHTML = `

                    <td>
                        ${formatDate(expense.date)}
                    </td>

                    <td>
                        ${expense.category}
                    </td>

                    <td>
                        ${expense.description || "-"}
                    </td>

                    <td>
                        ${expense.paymentMethod}
                    </td>

                    <td class="amount-cell">
                        ${formatMoney(expense.amount)}
                    </td>

                `;


                recentTable.appendChild(
                    recentRow
                );
            }
        }


        if (expenses.length === 0) {

            table.innerHTML =
                `<tr>
                    <td colspan="6">
                        No expenses yet.
                    </td>
                </tr>`;


            recentTable.innerHTML =
                `<tr>
                    <td colspan="5">
                        No expenses yet.
                    </td>
                </tr>`;
        }

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   DELETE EXPENSE
===================================================== */

async function deleteExpense(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await fetch(
            `${API}/expenses/${id}`,
            {
                method: "DELETE",
                headers: getHeaders()
            }
        );

        await loadExpenses();

        await loadDashboardSummary();

        await loadBudgets();

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   ADD INCOME
===================================================== */

async function addIncome() {

    const amount =
        document.getElementById(
            "incomeAmount"
        ).value;

    const source =
        document.getElementById(
            "incomeSource"
        ).value;

    const description =
        document.getElementById(
            "incomeDescription"
        ).value;

    const message =
        document.getElementById(
            "incomeMessage"
        );


    if (!amount || !source) {

        message.innerText =
            "Please enter amount and source.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/income`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({

                        amount: Number(amount),

                        source: source,

                        description: description

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerText =
                data.message;

            return;
        }


        message.innerText =
            "Income added successfully.";


        document.getElementById(
            "incomeAmount"
        ).value = "";

        document.getElementById(
            "incomeSource"
        ).value = "";

        document.getElementById(
            "incomeDescription"
        ).value = "";


        await loadIncome();

        await loadDashboardSummary();

    } catch (error) {

        message.innerText =
            "Could not connect to server.";
    }
}


/* =====================================================
   LOAD INCOME
===================================================== */

async function loadIncome() {

    try {

        const response =
            await fetch(
                `${API}/income`,
                {
                    headers: getHeaders()
                }
            );

        const income =
            await response.json();


        const table =
            document.getElementById(
                "incomeTable"
            );

        table.innerHTML = "";


        for (let i = 0; i < income.length; i++) {

            const item =
                income[i];


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${formatDate(item.date)}
                </td>

                <td>
                    ${item.source}
                </td>

                <td>
                    ${item.description || "-"}
                </td>

                <td style="color:#20854b;font-weight:bold">
                    ${formatMoney(item.amount)}
                </td>

                <td>

                    <button
                        class="delete-button"
                        onclick="deleteIncome('${item._id}')">

                        Delete

                    </button>

                </td>

            `;


            table.appendChild(row);
        }


        if (income.length === 0) {

            table.innerHTML =
                `<tr>
                    <td colspan="5">
                        No income records yet.
                    </td>
                </tr>`;
        }

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   DELETE INCOME
===================================================== */

async function deleteIncome(id) {

    const confirmed =
        confirm(
            "Delete this income record?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await fetch(
            `${API}/income/${id}`,
            {
                method: "DELETE",
                headers: getHeaders()
            }
        );

        await loadIncome();

        await loadDashboardSummary();

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   SAVE BUDGET
===================================================== */

async function saveBudget() {

    const category =
        document.getElementById(
            "budgetCategory"
        ).value;

    const amount =
        document.getElementById(
            "budgetAmount"
        ).value;


    if (!amount) {

        alert(
            "Please enter a budget amount."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/budgets`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({

                        category: category,

                        amount: Number(amount)

                    })
                }
            );


        if (!response.ok) {

            alert("Could not save budget.");

            return;
        }


        document.getElementById(
            "budgetAmount"
        ).value = "";


        alert(
            "Budget saved successfully."
        );


        await loadBudgets();

    } catch (error) {

        alert(
            "Server connection failed."
        );
    }
}


/* =====================================================
   LOAD BUDGETS
===================================================== */

async function loadBudgets() {

    try {

        const response =
            await fetch(
                `${API}/budgets`,
                {
                    headers: getHeaders()
                }
            );

        const budgets =
            await response.json();


        const expenseResponse =
            await fetch(
                `${API}/expenses`,
                {
                    headers: getHeaders()
                }
            );

        const expenses =
            await expenseResponse.json();


        const container =
            document.getElementById(
                "budgetCards"
            );

        container.innerHTML = "";


        for (let i = 0; i < budgets.length; i++) {

            const budget =
                budgets[i];

            let spent = 0;


            for (let j = 0; j < expenses.length; j++) {

                if (
                    expenses[j].category
                    === budget.category
                ) {

                    spent +=
                        expenses[j].amount;
                }
            }


            let percentage = 0;

            if (budget.amount > 0) {

                percentage =
                    (spent / budget.amount) * 100;
            }

            if (percentage > 100) {
                percentage = 100;
            }


            const card =
                document.createElement("div");

            card.className =
                "budget-card";


            card.innerHTML = `

                <div class="budget-card-header">

                    <span>
                        ${budget.category}
                    </span>

                    <strong>
                        ${formatMoney(budget.amount)}
                    </strong>

                </div>

                <div class="category-bar">

                    <div
                        class="category-fill"
                        style="width:${percentage}%">
                    </div>

                </div>

                <div class="budget-status">

                    Spent:
                    ${formatMoney(spent)}
                    /
                    ${formatMoney(budget.amount)}

                    <br>

                    ${percentage.toFixed(0)}% used

                </div>

            `;


            container.appendChild(card);
        }


        if (budgets.length === 0) {

            container.innerHTML =
                `<div class="panel">
                    No budgets created yet.
                </div>`;
        }

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   EMERGENCY FUND
===================================================== */

async function loadEmergencyFund() {

    try {

        const response =
            await fetch(
                `${API}/emergency`,
                {
                    headers: getHeaders()
                }
            );

        const data =
            await response.json();


        document.getElementById(
            "emergencyCurrent"
        ).innerText =
            formatMoney(data.currentAmount);


        document.getElementById(
            "fundPercentage"
        ).innerText =
            data.percentage.toFixed(0) + "%";


        document.getElementById(
            "fundProgress"
        ).style.width =
            data.percentage + "%";


        document.getElementById(
            "quickAccess"
        ).innerText =
            formatMoney(data.quickAccess);


        document.getElementById(
            "hardLock"
        ).innerText =
            formatMoney(data.hardLock);

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   ADD EMERGENCY MONEY
===================================================== */

async function addEmergencyFund() {

    const amount =
        document.getElementById(
            "emergencyAmount"
        ).value;

    const message =
        document.getElementById(
            "emergencyMessage"
        );


    if (!amount || Number(amount) <= 0) {

        message.innerText =
            "Enter a valid amount.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/emergency/add`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        amount: Number(amount)
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerText =
                data.message;

            return;
        }


        message.innerText =
            "Money added to emergency fund.";


        document.getElementById(
            "emergencyAmount"
        ).value = "";


        await loadEmergencyFund();

    } catch (error) {

        message.innerText =
            "Could not connect to server.";
    }
}


/* =====================================================
   WITHDRAW EMERGENCY MONEY
===================================================== */

async function withdrawEmergencyFund() {

    const amount =
        document.getElementById(
            "withdrawAmount"
        ).value;

    const message =
        document.getElementById(
            "emergencyMessage"
        );


    if (!amount || Number(amount) <= 0) {

        message.innerText =
            "Enter a valid amount.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/emergency/withdraw`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        amount: Number(amount)
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerText =
                data.message;

            return;
        }


        message.innerText =
            "Withdrawal successful.";


        document.getElementById(
            "withdrawAmount"
        ).value = "";


        await loadEmergencyFund();

    } catch (error) {

        message.innerText =
            "Could not connect to server.";
    }
}


/* =====================================================
   FUTURE EXPENSES
===================================================== */

async function addFutureExpense() {

    const name =
        document.getElementById(
            "futureExpenseName"
        ).value.trim();

    const amount =
        document.getElementById(
            "futureExpenseAmount"
        ).value;


    if (!name || !amount) {

        alert(
            "Please enter name and amount."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/future-expenses`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({

                        name: name,

                        amount: Number(amount)

                    })
                }
            );


        if (!response.ok) {

            alert(
                "Could not add future expense."
            );

            return;
        }


        document.getElementById(
            "futureExpenseName"
        ).value = "";

        document.getElementById(
            "futureExpenseAmount"
        ).value = "";


        await loadFutureExpenses();

    } catch (error) {

        alert(
            "Server connection failed."
        );
    }
}


/* =====================================================
   LOAD FUTURE EXPENSES
===================================================== */

async function loadFutureExpenses() {

    try {

        const response =
            await fetch(
                `${API}/future-expenses`,
                {
                    headers: getHeaders()
                }
            );

        const expenses =
            await response.json();


        const list =
            document.getElementById(
                "futureExpenseList"
            );

        list.innerHTML = "";


        let total = 0;


        for (let i = 0; i < expenses.length; i++) {

            const item =
                expenses[i];

            total += item.amount;


            const div =
                document.createElement("div");

            div.className =
                "future-item";


            div.innerHTML = `

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        Added ${formatDate(item.date)}
                    </span>

                </div>

                <div>

                    <strong>
                        ${formatMoney(item.amount)}
                    </strong>

                    <button
                        class="delete-button"
                        onclick="deleteFutureExpense('${item._id}')">

                        Delete

                    </button>

                </div>

            `;


            list.appendChild(div);
        }


        if (expenses.length === 0) {

            list.innerHTML =
                `<p style="color:#7b8494">
                    No future expenses planned.
                </p>`;
        }


        document.getElementById(
            "forecastAmount"
        ).innerText =
            formatMoney(total);


        const monthly =
            total / 1;

        const weekly =
            total / 4;


        document.getElementById(
            "monthlySaving"
        ).innerText =
            formatMoney(monthly);


        document.getElementById(
            "weeklySaving"
        ).innerText =
            formatMoney(weekly);

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   DELETE FUTURE EXPENSE
===================================================== */

async function deleteFutureExpense(id) {

    try {

        await fetch(
            `${API}/future-expenses/${id}`,
            {
                method: "DELETE",
                headers: getHeaders()
            }
        );

        await loadFutureExpenses();

    } catch (error) {

        console.log(error);
    }
}


/* =====================================================
   START DASHBOARD
===================================================== */

if (
    window.location.pathname
        .toLowerCase()
        .includes("dashboard.html")
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            loadDashboard();

        }
    );
}