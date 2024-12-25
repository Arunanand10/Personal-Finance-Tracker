document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const transactionsList = document.getElementById('transactions-list');
    const incomeDisplay = document.getElementById('income');
    const expensesDisplay = document.getElementById('expenses');
    const savingsDisplay = document.getElementById('savings');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const filterSelect = document.getElementById('filter-transactions');
    const exportButton = document.getElementById('export-csv');
    const chartCanvas = document.getElementById('summary-chart');
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let income = 0, expenses = 0, chart = null;

    form.addEventListener('submit', handleFormSubmit);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    filterSelect.addEventListener('change', renderTransactions);
    exportButton.addEventListener('click', exportToCSV);

    function handleFormSubmit(e) {
        e.preventDefault();
        const amountInput = document.getElementById('amount');
        const descriptionInput = document.getElementById('description');
        const transactionType = document.getElementById('transaction-type');

        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();
        const type = transactionType.value;

        if (!amount || !description) return alert('Please fill in all fields.');

        // Add transaction
        transactions.push({ id: Date.now(), amount, description, type });
        updateState();

        // Clear form fields explicitly
        amountInput.value = ''; // Clear amount input
        descriptionInput.value = ''; // Clear description input
        transactionType.selectedIndex = 0; // Reset dropdown to default
    }

    function renderTransactions() {
        transactionsList.innerHTML = '';
        const filtered = transactions.filter(t => filterSelect.value === 'all' || t.type === filterSelect.value);
        filtered.forEach(t => {
            const li = document.createElement('li');
            li.className = t.type;
            li.innerHTML = `
                <span>${t.description} - ₹${t.amount.toFixed(2)}</span>
                <button class="delete-btn">❌</button>`;
            li.querySelector('.delete-btn').onclick = () => removeTransaction(t.id);
            transactionsList.appendChild(li);
        });
    }

    function updateState() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        updateTotals();
        updateChart();
    }

    function updateTotals() {
        income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const savings = income - expenses;
        incomeDisplay.textContent = `₹${income.toFixed(2)}`;
        expensesDisplay.textContent = `₹${expenses.toFixed(2)}`;
        savingsDisplay.textContent = `₹${savings.toFixed(2)}`;
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    function exportToCSV() {
        const csv = [
            ['Description', 'Amount', 'Type'],
            ...transactions.map(t => [t.description, t.amount.toFixed(2), t.type]),
        ].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'transactions.csv';
        link.click();
    }

    function updateChart() {
        const data = [income, expenses];
        const labels = ['Income', 'Expenses'];
        const colors = ['#4CAF50', '#FF5722'];
        if (chart) {
            chart.data.datasets[0].data = data;
            chart.update();
        } else {
            chart = new Chart(chartCanvas, {
                type: 'pie',
                data: { labels, datasets: [{ data, backgroundColor: colors }] },
                options: { responsive: true }
            });
        }
    }

    function removeTransaction(id) {
        transactions = transactions.filter(t => t.id !== id);
        updateState();
    }

    function clearData() {
        localStorage.removeItem('transactions'); // Clear saved transactions from localStorage
        transactions = []; // Clear the transactions array
        renderTransactions(); // Re-render the empty list
        updateTotals(); // Update totals to show zero values
    }

    (function init() {
        if (JSON.parse(localStorage.getItem('darkMode'))) document.body.classList.add('dark-mode');
        renderTransactions();
        updateTotals();
        updateChart();
        clearData(); // Clear data when the page loads (optional: remove this to keep the transactions when refreshed)
    })();
});
