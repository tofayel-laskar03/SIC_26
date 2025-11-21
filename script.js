// Constants for history management
const HISTORY_KEY = 'gst_calculator_history';
const MAX_HISTORY_ITEMS = 5;

/**
 * Helper function to round a number accurately to two decimal places
 */
function roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Main function triggered by the calculation buttons.
 * @param {string} operation - 'add' (Net to Gross) or 'remove' (Gross to Net)
 */
function calculateGST(operation) {
    // 1. Get Input Values
    const price = parseFloat(document.getElementById('price').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const transactionType = document.getElementById('transactionType').value;

    if (isNaN(price) || price <= 0 || isNaN(rate) || rate < 0) {
        alert("Please enter valid Price and GST Rate.");
        return;
    }

    const rateDecimal = rate / 100;
    let basePrice, gstAmount, grossPrice;

    // 2. Core Calculation Logic
    if (operation === 'add') {
        // --- FORWARD CALCULATION: Input is Base Price ---
        basePrice = price;
        grossPrice = basePrice * (1 + rateDecimal);
        gstAmount = grossPrice - basePrice;
    } else if (operation === 'remove') {
        // --- REVERSE CALCULATION: Input is Gross Price ---
        grossPrice = price;
        basePrice = grossPrice / (1 + rateDecimal);
        gstAmount = grossPrice - basePrice;
    }

    // 3. Tax Breakdown (CGST, SGST, IGST)
    let cgst = 0, sgst = 0, igst = 0;
    if (transactionType === 'intra') {
        cgst = gstAmount / 2; // 50% CGST
        sgst = gstAmount / 2; // 50% SGST
    } else if (transactionType === 'inter') {
        igst = gstAmount; // 100% IGST
    }

    // 4. Update the UI Output
    document.getElementById('basePrice').textContent = roundToTwo(basePrice).toFixed(2);
    document.getElementById('gstAmount').textContent = roundToTwo(gstAmount).toFixed(2);
    document.getElementById('grossPrice').textContent = roundToTwo(grossPrice).toFixed(2);
    document.getElementById('cgstAmount').textContent = roundToTwo(cgst).toFixed(2);
    document.getElementById('sgstAmount').textContent = roundToTwo(sgst).toFixed(2);
    document.getElementById('igstAmount').textContent = roundToTwo(igst).toFixed(2);

    // 5. Save and Display History
    const result = {
        operation: operation,
        rate: rate,
        transactionType: transactionType,
        basePrice: roundToTwo(basePrice),
        gstAmount: roundToTwo(gstAmount),
        grossPrice: roundToTwo(grossPrice),
        timestamp: new Date().toLocaleTimeString()
    };
    saveCalculation(result);
}

/**
 * Saves the current calculation result to localStorage.
 */
function saveCalculation(result) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    history.unshift(result); // Add new result to the start
    history = history.slice(0, MAX_HISTORY_ITEMS); // Limit history size
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    displayHistory(history);
}

/**
 * Renders the calculation history list on the page.
 */
function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p>No transactions saved yet.</p>';
        return;
    }

    history.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        
        const operationText = item.operation === 'add' ? 'Added GST' : 'Removed GST';
        const taxType = item.transactionType === 'intra' ? 'CGST+SGST' : 'IGST';

        itemDiv.innerHTML = `
            <p><strong>${item.timestamp} - ${operationText}:</strong> ${item.rate}% (${taxType})</p>
            <p>Net: ${item.basePrice.toFixed(2)} | GST: ${item.gstAmount.toFixed(2)} | Gross: ${item.grossPrice.toFixed(2)}</p>
        `;
        historyList.appendChild(itemDiv);
    });
}

// Load history when the page initializes
window.onload = function() {
    const initialHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    displayHistory(initialHistory);
};