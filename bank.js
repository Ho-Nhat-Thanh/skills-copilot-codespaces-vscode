const Account = require('./account');
const TermDeposit = require('./termDeposit');

class Bank {
    constructor(name) {
        this.name = name;
        this.accounts = new Map();
        this.termDeposits = new Map();
        this.nextAccountNumber = 1000;
        this.nextTermDepositId = 1;
    }

    createAccount(initialBalance = 0) {
        const accountNumber = this.nextAccountNumber++;
        const account = new Account(accountNumber, initialBalance);
        this.accounts.set(accountNumber, account);
        return accountNumber;
    }

    getAccount(accountNumber) {
        const account = this.accounts.get(accountNumber);
        if (!account) {
            throw new Error('Account not found');
        }
        return account;
    }

    getBalance(accountNumber) {
        return this.getAccount(accountNumber).getBalance();
    }

    withdraw(accountNumber, amount) {
        return this.getAccount(accountNumber).withdraw(amount);
    }

    deposit(accountNumber, amount) {
        return this.getAccount(accountNumber).deposit(amount);
    }

    transfer(fromAccountNumber, toAccountNumber, amount) {
        if (fromAccountNumber === toAccountNumber) {
            throw new Error('Cannot transfer to the same account');
        }

        const fromAccount = this.getAccount(fromAccountNumber);
        const toAccount = this.getAccount(toAccountNumber);

        // Perform the transfer
        fromAccount.withdraw(amount);
        toAccount.deposit(amount);

        // Record transfer in both accounts
        fromAccount.transactions.push({
            type: 'transfer_out',
            amount: amount,
            toAccount: toAccountNumber,
            timestamp: new Date(),
            balance: fromAccount.balance
        });

        toAccount.transactions.push({
            type: 'transfer_in',
            amount: amount,
            fromAccount: fromAccountNumber,
            timestamp: new Date(),
            balance: toAccount.balance
        });

        return {
            fromBalance: fromAccount.balance,
            toBalance: toAccount.balance
        };
    }

    openTermDeposit(accountNumber, amount, interestRate, termMonths) {
        const account = this.getAccount(accountNumber);
        
        if (amount > account.getBalance()) {
            throw new Error('Insufficient funds in account');
        }

        // Withdraw money from account for term deposit
        account.withdraw(amount);
        
        const termDepositId = this.nextTermDepositId++;
        const termDeposit = new TermDeposit(termDepositId, amount, interestRate, termMonths);
        this.termDeposits.set(termDepositId, termDeposit);

        // Record term deposit opening in account
        account.transactions.push({
            type: 'term_deposit_opened',
            amount: amount,
            termDepositId: termDepositId,
            timestamp: new Date(),
            balance: account.balance
        });

        return termDepositId;
    }

    getTermDeposit(termDepositId) {
        const termDeposit = this.termDeposits.get(termDepositId);
        if (!termDeposit) {
            throw new Error('Term deposit not found');
        }
        return termDeposit;
    }

    closeTermDeposit(termDepositId, accountNumber) {
        const termDeposit = this.getTermDeposit(termDepositId);
        const account = this.getAccount(accountNumber);
        
        const maturityAmount = termDeposit.close();
        account.deposit(maturityAmount);

        // Record term deposit closure in account
        account.transactions.push({
            type: 'term_deposit_closed',
            amount: maturityAmount,
            termDepositId: termDepositId,
            timestamp: new Date(),
            balance: account.balance
        });

        return maturityAmount;
    }

    getAllAccounts() {
        return Array.from(this.accounts.values());
    }

    getAllTermDeposits() {
        return Array.from(this.termDeposits.values());
    }
}

module.exports = Bank;