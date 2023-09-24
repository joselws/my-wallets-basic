const walletsElement = document.getElementById("wallets");

const addWalletForm = document.getElementById("add-wallet-form");
const walletNameInput = document.getElementById("wallet-name-input");
const walletBalanceInput = document.getElementById("wallet-balance-input");
const walletPercentInput = document.getElementById("wallet-percent-input");

const totalBalance = document.getElementById("total-balance");

const depositForm = document.getElementById("deposit-form");
const depositInput = document.getElementById("deposit-input");

const userMessage = document.getElementById("user-message");

let userMessageTimeoutHandle;

const walletNameIndex = 0;
const walletBalanceIndex = 1;
const walletPercentIndex = 2;

const walletStorageKey = "wallets"


addWalletForm.addEventListener("submit", event => {
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
    if (isNaN(parseFloat(walletBalance))) {
        showNewMessage("Wallet balance must be a number!", "red")
        return false;
    }
    if (isNaN(parseFloat(walletPercent))) {
        showNewMessage("Wallet percent must be a number!", "red")
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
    wallets = JSON.parse(localStorage.getItem(walletStorageKey));
    for (wallet of wallets) {
        createNewWallet(wallet);
    }
}

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
    if (isNaN(parseFloat(depositValue))) {
        showNewMessage("Deposit value must be a number!", "red");
        return;
    }
    depositInput.value = "";

    deposit(parseFloat(depositValue));
    computeTotalBalance();
    saveWallets();
    showNewMessage(`Deposit of ${depositValue}$ successful!`, "green");
});


document.addEventListener("DOMContentLoaded", () => {
    loadWallets();
    computeTotalBalance();
})
