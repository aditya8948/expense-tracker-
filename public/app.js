const API_URL = "/api/expenses";

let expenses = [];
let editIndex = null;
let editId = null;

const form = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const categorySelect = document.getElementById("category");
const submitBtn = document.getElementById("submit-btn");
const expenseList = document.getElementById("expense-list");
const totalSpan = document.getElementById("total");

async function fetchExpenses() {
    const res = await fetch(API_URL);
    expenses = await res.json();
    render();
}

function render() {
    expenseList.innerHTML = "";

    expenses.forEach(function (exp, index) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        li.innerHTML =
            '<span>₹' + exp.amount + ' - ' + exp.category + ' - ' + exp.description + '</span>' +
            '<span>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteExpense(' + index + ')">Delete</button>' +
            '</span>';

        expenseList.appendChild(li);
    });

    var total = 0;
    for (var i = 0; i < expenses.length; i++) {
        total += Number(expenses[i].amount);
    }
    totalSpan.textContent = total;
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const expense = {
        amount: amountInput.value,
        description: descriptionInput.value,
        category: categorySelect.value,
    };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
    });

    await fetchExpenses();
    form.reset();
});

async function deleteExpense(index) {
    const id = expenses[index].id;
    await fetch(API_URL + "/" + id, { method: "DELETE" });
    await fetchExpenses();
}

fetchExpenses();
