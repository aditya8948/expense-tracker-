// State
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let editIndex = null;

// DOM refs
const form = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const categorySelect = document.getElementById("category");
const submitBtn = document.getElementById("submit-btn");
const expenseList = document.getElementById("expense-list");
const totalSpan = document.getElementById("total");

// Save to localStorage
function save() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Render list
function render() {
    expenseList.innerHTML = "";

    expenses.forEach(function (exp, index) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        li.innerHTML =
            '<span>₹' + exp.amount + ' - ' + exp.category + ' - ' + exp.description + '</span>' +
            '<span>' +
                '<button class="btn btn-sm btn-warning me-2" onclick="editExpense(' + index + ')">Edit</button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteExpense(' + index + ')">Delete</button>' +
            '</span>';

        expenseList.appendChild(li);
    });

    // Update total
    var total = 0;
    for (var i = 0; i < expenses.length; i++) {
        total += Number(expenses[i].amount);
    }
    totalSpan.textContent = total;
}

// Add or Update
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const expense = {
        amount: amountInput.value,
        description: descriptionInput.value,
        category: categorySelect.value
    };

    if (editIndex !== null) {
        expenses[editIndex] = expense;
        editIndex = null;
        submitBtn.textContent = "Add Expense";
        submitBtn.classList.remove("btn-success");
        submitBtn.classList.add("btn-primary");
    } else {
        expenses.push(expense);
    }

    save();
    render();
    form.reset();
});

// Delete
function deleteExpense(index) {
    expenses.splice(index, 1);
    save();
    render();
}

// Edit
function editExpense(index) {
    const exp = expenses[index];
    amountInput.value = exp.amount;
    descriptionInput.value = exp.description;
    categorySelect.value = exp.category;
    editIndex = index;
    submitBtn.textContent = "Update Expense";
    submitBtn.classList.remove("btn-primary");
    submitBtn.classList.add("btn-success");
}

// Initial render
render();
