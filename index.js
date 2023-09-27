// wallets
const walletsElement = document.getElementById("wallets");
const walletNameIndex = 0;
const walletBalanceIndex = 1;
const walletPercentIndex = 2;

// create wallets
const createWalletForm = document.getElementById("create-wallet-form");
const walletNameInput = document.getElementById("wallet-name-input");
const walletBalanceInput = document.getElementById("wallet-balance-input");
const walletPercentInput = document.getElementById("wallet-percent-input");

// total balance
const totalBalance = document.getElementById("total-balance");

// deposit
const depositForm = document.getElementById("deposit-form");
const depositInput = document.getElementById("deposit-input");

// add to wallet
const openAddModalBtn = document.getElementById("open-add-modal-btn");
const closeAddModalBtn = document.getElementById("close-add-modal-btn");
const addToWalletModal = document.getElementById("add-to-wallet-modal");
const addToWalletForm = document.getElementById("add-to-wallet-form");
const addToWalletSelect = document.getElementById("add-to-wallet-select");
const addToWalletAmountInput = document.getElementById("add-to-wallet-amount-input");

// deduct from wallet
const openDeductModalBtn = document.getElementById("open-deduct-modal-btn");
const closeDeductModalBtn = document.getElementById("close-deduct-modal-btn");
const deductFromWalletModal = document.getElementById("deduct-from-wallet-modal");
const deductFromWalletForm = document.getElementById("deduct-from-wallet-form");
const deductFromWalletSelect = document.getElementById("deduct-from-wallet-select");
const deductFromWalletAmountInput = document.getElementById("deduct-from-wallet-amount-input");

// transfer
const openTransferModalBtn = document.getElementById("open-transfer-modal-btn");
const transferModal = document.getElementById("transfer-wallet-modal");
const closeTransferModalBtn = document.getElementById("close-transfer-modal-btn");
const transferWalletForm = document.getElementById("transfer-wallet-form");
const transferWalletSourceSelect = document.getElementById("transfer-wallet-source-select");
const transferWalletDestinationSelect = document.getElementById("transfer-wallet-destination-select");
const transferWalletAmountInput = document.getElementById("transfer-wallet-amount-input");

// user message
const userMessage = document.getElementById("user-message");
let userMessageTimeoutHandle;

// local storage
const walletStorageKey = "wallets"

//
// CREATE WALLET
//

createWalletForm.addEventListener("submit", event => {
    event.preventDefault();

    const walletName = walletNameInput.value;
    let walletBalance = walletBalanceInput.value;
    let walletPercent = walletPercentInput.value;

    if (walletBalance === "") {walletBalance = "0"}
    if (walletPercent === "") {walletPercent = "0"}

    if (isValidInput(walletName, walletBalance, walletPercent)) {
        wallet = {name: walletName, balance: walletBalance, percent: walletPercent};
        createNewWallet(wallet);
        showNewMessage(`Wallet "${walletName}" created successfully!`, "green");
        clearInputs();
    }
    return;
});

function isValidInput(walletName, walletBalance, walletPercent) {
    if (walletName === "") {
        showNewMessage("Wallet name cannot be empty!", "red")
        return false;
    }
    if (!isValidNumericInput(walletBalance)) {
        showNewMessage("Wallet balance must be a valid positive number!", "red")
        return false;
    }
    if (!isValidNumericInput(walletPercent)) {
        showNewMessage("Wallet percent must be a valid positive number!", "red")
        return false;
    }
    if (!isUniqueWalletName(walletName)) {
        showNewMessage(`Wallet "${walletName}" already exists!`, "red")
       return false;
    }
    return true
}

function isUniqueWalletName(walletName) {
    if (walletsElement.childElementCount === 0) {
        return true
    }
    const walletNamesElements = document.querySelectorAll(".wallet-name")

    for (let i = 0; i < walletNamesElements.length; i++) {
        if(walletNamesElements[i].innerHTML === walletName) {
            return false
        }
    }
    return true
}

function createNewWallet(wallet) {
    const walletElement = document.createElement("div");
    walletElement.setAttribute("class", "wallet");
    
    const walletNameElement = document.createElement("p")
    walletNameElement.setAttribute("class", "wallet-name");
    walletNameElement.innerHTML = wallet.name
    
    const walletBalanceElement = document.createElement("p")
    walletBalanceElement.setAttribute("class", "wallet-balance");
    walletBalanceElement.innerHTML = wallet.balance

    const walletPercentElement = document.createElement("p")
    walletPercentElement.setAttribute("class", "wallet-percent");
    walletPercentElement.innerHTML = wallet.percent
    
    const walletDeleteBtn = document.createElement("button");
    walletDeleteBtn.setAttribute("class", "wallet-delete-btn");
    walletDeleteBtn.innerHTML = "Delete"
    walletDeleteBtn.addEventListener("click", deleteWallet);

    walletElement.appendChild(walletNameElement);
    walletElement.appendChild(walletBalanceElement);
    walletElement.appendChild(walletPercentElement);
    walletElement.appendChild(walletDeleteBtn);

    walletsElement.appendChild(walletElement);

    computeTotalBalance();
    saveWallets();
}

function clearInputs() {
    walletNameInput.value = "";
    walletBalanceInput.value = "";
    walletPercentInput.value = "";
    addToWalletAmountInput.value = "";
    transferWalletAmountInput.value = "";
}

function deleteWallet(event) {
    const walletName = event.target.parentElement.children[walletNameIndex].innerHTML;
    event.target.parentElement.remove();
    showNewMessage(`Wallet "${walletName}" deleted!`, "green");
    computeTotalBalance();
    saveWallets();
}

function computeTotalBalance() {
    const walletBalanceElements = document.querySelectorAll(".wallet-balance")
    let total = 0;
    walletBalanceElements.forEach(walletBalanceElement => {
        total += parseFloat(walletBalanceElement.innerHTML)
    });
    totalBalance.innerHTML = total;
}

function showNewMessage(message, color) {
    userMessage.innerHTML = message;
    userMessage.style.color = color;

    if (userMessageTimeoutHandle != null) {
        clearTimeout(userMessageTimeoutHandle);
    }
    userMessageTimeoutHandle = setTimeout(() => {
        userMessage.innerHTML = "";
        userMessage.style.color = "black";
    }, 5_000);
}


//
// LOCAL STORAGE
//

function saveWallets() {
    wallets = []
    for (i = 0; i < walletsElement.childElementCount; i++) {
        wallet = {
            name: walletsElement.children[i].children[walletNameIndex].innerHTML,
            balance: walletsElement.children[i].children[walletBalanceIndex].innerHTML,
            percent: walletsElement.children[i].children[walletPercentIndex].innerHTML
        }
        wallets.push(wallet)
    }
    localStorage.setItem(walletStorageKey, JSON.stringify(wallets));
}

function loadWallets() {
    const data = localStorage.getItem(walletStorageKey);
    if (data === null) {
        return;
    }
    wallets = JSON.parse(data);
    for (wallet of wallets) {
        createNewWallet(wallet);
    }
}

//
// DEPOSIT
//

function isWalletsPercentValid() {
    let total = 0
    for (singleWalletElement of walletsElement.children) {
        let percent = singleWalletElement.children[walletPercentIndex].innerHTML;
        total += parseFloat(percent);
    }
    return total == 100;
}

function deposit(amount) {
    wallets = []

    // filter wallets that have percents
    for (singleWalletElement of walletsElement.children) {
        if (singleWalletElement.children[walletPercentIndex].innerHTML !== "0") {
            wallets.push(singleWalletElement);
        }
    }

    lastWallet = wallets.pop();
    let cumulativeAmountDeposited = 0

    for (singleWalletElement of wallets) {
        const percent = parseFloat(singleWalletElement.children[walletPercentIndex].innerHTML);
        const correspondingAmount = Number((amount * percent / 100).toFixed(2));
        cumulativeAmountDeposited += correspondingAmount;
        addBalanceToWallet(singleWalletElement, correspondingAmount)
    }
    
    let leftoverAmount = Number((amount - cumulativeAmountDeposited).toFixed(2));
    addBalanceToWallet(lastWallet, leftoverAmount);
}

function addBalanceToWallet(walletElement, amount) {
    const balance = parseFloat(walletElement.children[walletBalanceIndex].innerHTML);
    const newBalance = balance + amount;
    walletElement.children[walletBalanceIndex].innerHTML = Number(newBalance.toFixed(2));
}

depositForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isWalletsPercentValid()) {
        showNewMessage("Wallet percents must add up to 100!", "red");
        return;
    }
    
    const depositValue = depositInput.value;
    if (depositValue === "") {
        showNewMessage("Deposit value must not be empty!", "red");
        return;
    }
    if (!isValidNumericInput(depositValue)) {
        showNewMessage("Deposit value must be a valid positive number!", "red");
        return;
    }
    depositInput.value = "";

    deposit(parseFloat(depositValue));
    computeTotalBalance();
    saveWallets();
    showNewMessage(`Deposit of ${depositValue}$ successful!`, "green");
});

//
// ADD TO WALLET
//

function getWalletNames() {
    walletNames = []
    for (walletElement of walletsElement.children) {
        walletNames.push(walletElement.children[walletNameIndex].innerHTML)
    }
    return walletNames;
}

function populateSelectFormWithNames(selectElement, walletNames) {
    for (walletName of walletNames) {
        const newOption = createSelectOptionElement(walletName)
        selectElement.appendChild(newOption);
    }
}

function createSelectOptionElement(value) {
    const newOption = document.createElement("option");
    newOption.setAttribute("value", value);
    newOption.innerHTML = value;
    return newOption;
}

function emptySelectForm(selectElement) {
    while (selectElement.options.length > 0) {
        selectElement.remove(selectElement.options.length - 1);
    }
}

openAddModalBtn.addEventListener("click", () => {
    populateSelectFormWithNames(addToWalletSelect, getWalletNames());
    addToWalletModal.showModal();    
});

closeAddModalBtn.addEventListener("click", () => {
    addToWalletModal.close();    
});

addToWalletModal.addEventListener("close", event => {
    emptySelectForm(addToWalletSelect);
});

addToWalletModal.addEventListener("click", event => {
    const dialogDimensions = addToWalletModal.getBoundingClientRect()
    if (
        event.clientX < dialogDimensions.left ||
        event.clientX > dialogDimensions.right ||
        event.clientY < dialogDimensions.top ||
        event.clientY > dialogDimensions.bottom
    ) {
        addToWalletModal.close()
    }
});

function getWalletElementFromName(walletName) {
    for (walletElement of walletsElement.children) {
        if (walletElement.children[walletNameIndex].innerHTML === walletName) {
            return walletElement
        }
    }
    console.log(`Wallet ${walletName} not found!`);
    return null
}

function isValidNumericInput(numberInput) {
    const number = parseFloat(numberInput)
    if (isNaN(number) || number < 0) {
        return false
    }
    return true
}

addToWalletForm.addEventListener("submit", event => {
    console.log("event submitted");
    const walletElement = getWalletElementFromName(addToWalletSelect.value);
    if (walletElement == null) {
        showNewMessage(`Could not find wallet ${addToWalletSelect.value}.`, "red")
        return;
    }

    const amount = addToWalletAmountInput.value;
    if (amount === "") {
        showNewMessage("Amount value should not be empty!", "red")
        return;
    }
    if (!isValidNumericInput(amount)) {
        showNewMessage("Amount should be a valid positive number!", "red")
        return;
    }

    addBalanceToWallet(walletElement, parseFloat(amount));
    computeTotalBalance();
    clearInputs();
    saveWallets();
    return;
});

//
// DEDUCT
//

openDeductModalBtn.addEventListener("click", () => {
    populateSelectFormWithNames(deductFromWalletSelect, getWalletNames());
    deductFromWalletModal.showModal();    
});

closeDeductModalBtn.addEventListener("click", () => {
    deductFromWalletModal.close();    
});

deductFromWalletModal.addEventListener("close", event => {
    emptySelectForm(deductFromWalletSelect);
});

deductFromWalletModal.addEventListener("click", event => {
    const dialogDimensions = deductFromWalletModal.getBoundingClientRect()
    if (
        event.clientX < dialogDimensions.left ||
        event.clientX > dialogDimensions.right ||
        event.clientY < dialogDimensions.top ||
        event.clientY > dialogDimensions.bottom
    ) {
        deductFromWalletModal.close()
    }
});

function deductBalanceFromWallet(walletElement, amount) {
    const balance = parseFloat(walletElement.children[walletBalanceIndex].innerHTML);
    if (balance < amount) {
        return false;
    }
    const newBalance = balance - amount;
    walletElement.children[walletBalanceIndex].innerHTML = Number(newBalance.toFixed(2));
    return true;
}

deductFromWalletForm.addEventListener("submit", event => {
    const walletElement = getWalletElementFromName(deductFromWalletSelect.value);
    if (walletElement == null) {
        showNewMessage(`Could not find wallet ${deductFromWalletSelect.value}.`, "red")
        return;
    }

    const amount = deductFromWalletAmountInput.value;
    if (amount === "") {
        showNewMessage("Amount value should not be empty!", "red")
        return;
    }
    if (!isValidNumericInput(amount)) {
        showNewMessage("Amount should be a valid positive number!", "red")
        return;
    }

    if (!deductBalanceFromWallet(walletElement, parseFloat(amount))) {
        showNewMessage("Amount to deduct must be higher than wallet balance!", "red");
        return
    }
    computeTotalBalance();
    clearInputs();
    saveWallets();
    showNewMessage(`Deduction of ${amount} successful`, "green")
    return;
});

//
// TRANSFER
//

openTransferModalBtn.addEventListener("click", () => {
    const walletNames = getWalletNames();
    populateSelectFormWithNames(transferWalletSourceSelect, walletNames);
    populateSelectFormWithNames(transferWalletDestinationSelect, walletNames);
    transferModal.showModal();    
});

closeTransferModalBtn.addEventListener("click", () => {
    transferModal.close();    
});

transferModal.addEventListener("close", event => {
    emptySelectForm(transferWalletSourceSelect);
    emptySelectForm(transferWalletDestinationSelect);
});

transferModal.addEventListener("click", event => {
    const dialogDimensions = transferModal.getBoundingClientRect()
    if (
        event.clientX < dialogDimensions.left ||
        event.clientX > dialogDimensions.right ||
        event.clientY < dialogDimensions.top ||
        event.clientY > dialogDimensions.bottom
    ) {
        transferModal.close()
    }
});

transferWalletForm.addEventListener("submit", event => {
    const walletSourceElement = getWalletElementFromName(transferWalletSourceSelect.value);
    if (walletSourceElement == null) {
        showNewMessage(`Could not find wallet ${transferWalletSourceSelect.value}.`, "red")
        return;
    }

    const walletDestinationElement = getWalletElementFromName(transferWalletDestinationSelect.value);
    if (walletDestinationElement == null) {
        showNewMessage(`Could not find wallet ${transferWalletDestinationSelect.value}.`, "red")
        return;
    }

    if (walletSourceElement === walletDestinationElement) {
        showNewMessage("You can't select the same wallet!", "red")
        return;
    }

    const amount = transferWalletAmountInput.value;
    if (amount === "") {
        showNewMessage("Amount value should not be empty!", "red")
        return;
    }
    if (!isValidNumericInput(amount)) {
        showNewMessage("Amount should be a valid positive number!", "red")
        return;
    }

    const amountNumber = parseFloat(amount)
    if (!deductBalanceFromWallet(walletSourceElement, amountNumber)) {
        showNewMessage("Amount to deduct must be higher than wallet balance!", "red");
        return
    }
    addBalanceToWallet(walletDestinationElement, amountNumber)
    computeTotalBalance();
    clearInputs();
    saveWallets();
    return;
});

//
// INITIAL LOAD
//

document.addEventListener("DOMContentLoaded", () => {
    loadWallets();
    computeTotalBalance();
})
