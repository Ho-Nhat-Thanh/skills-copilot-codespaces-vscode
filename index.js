const readline = require('readline');
const Bank = require('./bank');

class BankingApp {
    constructor() {
        this.bank = new Bank('Digital Bank');
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.currentAccount = null;
    }

    displayMenu() {
        console.log('\n=== Digital Banking System ===');
        console.log('1. Create Account');
        console.log('2. Login to Account');
        console.log('3. Check Balance');
        console.log('4. Deposit Money');
        console.log('5. Withdraw Money');
        console.log('6. Transfer Money');
        console.log('7. Open Term Deposit');
        console.log('8. View Term Deposits');
        console.log('9. Close Term Deposit');
        console.log('10. View Transaction History');
        console.log('11. Exit');
        console.log('================================');
    }

    async promptUser(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async createAccount() {
        try {
            const initialBalance = parseFloat(await this.promptUser('Enter initial deposit amount ($): '));
            if (isNaN(initialBalance) || initialBalance < 0) {
                console.log('Invalid amount. Please enter a valid positive number.');
                return;
            }
            
            const accountNumber = this.bank.createAccount(initialBalance);
            console.log(`Account created successfully! Account Number: ${accountNumber}`);
            console.log(`Initial balance: $${initialBalance.toFixed(2)}`);
        } catch (error) {
            console.log('Error creating account:', error.message);
        }
    }

    async loginToAccount() {
        try {
            const accountNumber = parseInt(await this.promptUser('Enter your account number: '));
            this.bank.getAccount(accountNumber); // This will throw if account doesn't exist
            this.currentAccount = accountNumber;
            console.log(`Logged in to account ${accountNumber}`);
        } catch (error) {
            console.log('Error logging in:', error.message);
            this.currentAccount = null;
        }
    }

    async checkBalance() {
        if (!this.currentAccount) {
            console.log('Please login to an account first.');
            return;
        }
        
        try {
            const balance = this.bank.getBalance(this.currentAccount);
            console.log(`Current balance: $${balance.toFixed(2)}`);
        } catch (error) {
            console.log('Error checking balance:', error.message);
        }
    }

    async depositMoney() {
        if (!this.currentAccount) {
            console.log('Please login to an account first.');
            return;
        }

        try {
            const amount = parseFloat(await this.promptUser('Enter deposit amount ($): '));
            if (isNaN(amount) || amount <= 0) {
                console.log('Invalid amount. Please enter a valid positive number.');
                return;
            }

            const newBalance = this.bank.deposit(this.currentAccount, amount);
            console.log(`Deposited $${amount.toFixed(2)}. New balance: $${newBalance.toFixed(2)}`);
        } catch (error) {
            console.log('Error depositing money:', error.message);
        }
    }

    async withdrawMoney() {
        if (!this.currentAccount) {
            console.log('Please login to an account first.');
            return;
        }

        try {
            const amount = parseFloat(await this.promptUser('Enter withdrawal amount ($): '));
            if (isNaN(amount) || amount <= 0) {
                console.log('Invalid amount. Please enter a valid positive number.');
                return;
            }

            const newBalance = this.bank.withdraw(this.currentAccount, amount);
            console.log(`Withdrew $${amount.toFixed(2)}. New balance: $${newBalance.toFixed(2)}`);
        } catch (error) {
            console.log('Error withdrawing money:', error.message);
        }
    }

    async transferMoney() {
        if (!this.currentAccount) {
            console.log('Please login to an account first.');
            return;
        }

        try {
            const toAccount = parseInt(await this.promptUser('Enter recipient account number: '));
            const amount = parseFloat(await this.promptUser('Enter transfer amount ($): '));
            
            if (isNaN(toAccount) || isNaN(amount) || amount <= 0) {
                console.log('Invalid input. Please enter valid numbers.');
                return;
            }

            const result = this.bank.transfer(this.currentAccount, toAccount, amount);
            console.log(`Transfer successful!`);
            console.log(`Your new balance: $${result.fromBalance.toFixed(2)}`);
            console.log(`Recipient's new balance: $${result.toBalance.toFixed(2)}`);
        } catch (error) {
            console.log('Error transferring money:', error.message);
        }
    }

    async openTermDeposit() {
        if (!this.currentAccount) {
            console.log('Please login to an account first.');
            return;
        }

        try {
            const amount = parseFloat(await this.promptUser('Enter term deposit amount ($): '));
            const interestRate = parseFloat(await this.promptUser('Enter annual interest rate (%): '));
            const termMonths = parseInt(await this.promptUser('Enter term in months: '));

            if (isNaN(amount) || amount <= 0 || isNaN(interestRate) || interestRate <= 0 || isNaN(termMonths) || termMonths <= 0) {
                console.log('Invalid input. Please enter valid positive numbers.');
                return;
            }

            const termDepositId = this.bank.openTermDeposit(this.currentAccount, amount, interestRate, termMonths);
            const termDeposit = this.bank.getTermDeposit(termDepositId);
            const details = termDeposit.getDetails();

            console.log('Term deposit opened successfully!');
            console.log(`Term Deposit ID: ${termDepositId}`);
            console.log(`Principal: $${details.principal.toFixed(2)}`);
            console.log(`Interest Rate: ${details.interestRate}% per annum`);
            console.log(`Term: ${details.termMonths} months`);
            console.log(`Maturity Date: ${details.maturityDate.toDateString()}`);
            console.log(`Maturity Amount: $${details.maturityAmount.toFixed(2)}`);
        } catch (error) {
            console.log('Error opening term deposit:', error.message);
        }
    }

    async viewTermDeposits() {
        try {
            const termDeposits = this.bank.getAllTermDeposits();
            if (termDeposits.length === 0) {
                console.log('No term deposits found.');
                return;
            }

            console.log('\n=== Term Deposits ===');
            termDeposits.forEach(td => {
                const details = td.getDetails();
                console.log(`ID: ${details.accountNumber} | Principal: $${details.principal.toFixed(2)} | Rate: ${details.interestRate}% | Term: ${details.termMonths}m | Status: ${details.isActive ? 'Active' : 'Closed'}`);
                console.log(`  Maturity: ${details.maturityDate.toDateString()} | Amount: $${details.maturityAmount.toFixed(2)}`);
            });
        } catch (error) {
            console.log('Error viewing term deposits:', error.message);
        }
    }

    async closeTermDeposit() {
        if (!this.currentAccount) {
            console.log('Please login to an account first.');
            return;
        }

        try {
            const termDepositId = parseInt(await this.promptUser('Enter term deposit ID to close: '));
            if (isNaN(termDepositId)) {
                console.log('Invalid term deposit ID.');
                return;
            }

            const maturityAmount = this.bank.closeTermDeposit(termDepositId, this.currentAccount);
            console.log(`Term deposit closed successfully!`);
            console.log(`Amount credited to your account: $${maturityAmount.toFixed(2)}`);
        } catch (error) {
            console.log('Error closing term deposit:', error.message);
        }
    }

    async viewTransactionHistory() {
        if (!this.currentAccount) {
            console.log('Please login to an account first.');
            return;
        }

        try {
            const account = this.bank.getAccount(this.currentAccount);
            const transactions = account.getTransactionHistory();
            
            if (transactions.length === 0) {
                console.log('No transactions found.');
                return;
            }

            console.log('\n=== Transaction History ===');
            transactions.forEach(tx => {
                console.log(`${tx.timestamp.toLocaleString()} | ${tx.type.toUpperCase()} | $${tx.amount.toFixed(2)} | Balance: $${tx.balance.toFixed(2)}`);
            });
        } catch (error) {
            console.log('Error viewing transaction history:', error.message);
        }
    }

    async run() {
        console.log('Welcome to Digital Banking System!');
        
        while (true) {
            this.displayMenu();
            const choice = await this.promptUser('Select an option (1-11): ');

            switch (choice) {
                case '1':
                    await this.createAccount();
                    break;
                case '2':
                    await this.loginToAccount();
                    break;
                case '3':
                    await this.checkBalance();
                    break;
                case '4':
                    await this.depositMoney();
                    break;
                case '5':
                    await this.withdrawMoney();
                    break;
                case '6':
                    await this.transferMoney();
                    break;
                case '7':
                    await this.openTermDeposit();
                    break;
                case '8':
                    await this.viewTermDeposits();
                    break;
                case '9':
                    await this.closeTermDeposit();
                    break;
                case '10':
                    await this.viewTransactionHistory();
                    break;
                case '11':
                    console.log('Thank you for using Digital Banking System!');
                    this.rl.close();
                    return;
                default:
                    console.log('Invalid option. Please try again.');
            }
        }
    }
}

// Run the application
if (require.main === module) {
    const app = new BankingApp();
    app.run().catch(console.error);
}

module.exports = BankingApp;