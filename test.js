const Bank = require('./bank');
const Account = require('./account');
const TermDeposit = require('./termDeposit');

function runTests() {
    console.log('Running Financial App Tests...\n');
    
    let testsPassed = 0;
    let testsTotal = 0;

    function test(description, testFunction) {
        testsTotal++;
        try {
            testFunction();
            console.log(`✓ ${description}`);
            testsPassed++;
        } catch (error) {
            console.log(`✗ ${description}: ${error.message}`);
        }
    }

    // Test Account functionality
    test('Account creation with initial balance', () => {
        const account = new Account(1001, 1000);
        if (account.getBalance() !== 1000) throw new Error('Initial balance incorrect');
        if (account.accountNumber !== 1001) throw new Error('Account number incorrect');
    });

    test('Account deposit functionality', () => {
        const account = new Account(1002, 500);
        const newBalance = account.deposit(200);
        if (newBalance !== 700) throw new Error('Balance after deposit incorrect');
    });

    test('Account withdrawal functionality', () => {
        const account = new Account(1003, 1000);
        const newBalance = account.withdraw(300);
        if (newBalance !== 700) throw new Error('Balance after withdrawal incorrect');
    });

    test('Account withdrawal with insufficient funds', () => {
        const account = new Account(1004, 100);
        try {
            account.withdraw(200);
            throw new Error('Should have thrown insufficient funds error');
        } catch (error) {
            if (!error.message.includes('Insufficient funds')) throw error;
        }
    });

    test('Account transaction history', () => {
        const account = new Account(1005, 1000);
        account.deposit(200);
        account.withdraw(100);
        const history = account.getTransactionHistory();
        if (history.length !== 2) throw new Error('Transaction history length incorrect');
        if (history[0].type !== 'deposit') throw new Error('First transaction type incorrect');
        if (history[1].type !== 'withdrawal') throw new Error('Second transaction type incorrect');
    });

    // Test Bank functionality
    test('Bank account creation', () => {
        const bank = new Bank('Test Bank');
        const accountNumber = bank.createAccount(1500);
        if (accountNumber < 1000) throw new Error('Account number should be 1000 or higher');
        if (bank.getBalance(accountNumber) !== 1500) throw new Error('Initial balance incorrect');
    });

    test('Bank money transfer', () => {
        const bank = new Bank('Test Bank');
        const account1 = bank.createAccount(1000);
        const account2 = bank.createAccount(500);
        
        const result = bank.transfer(account1, account2, 300);
        if (result.fromBalance !== 700) throw new Error('From account balance incorrect after transfer');
        if (result.toBalance !== 800) throw new Error('To account balance incorrect after transfer');
    });

    test('Bank transfer with insufficient funds', () => {
        const bank = new Bank('Test Bank');
        const account1 = bank.createAccount(100);
        const account2 = bank.createAccount(0);
        
        try {
            bank.transfer(account1, account2, 200);
            throw new Error('Should have thrown insufficient funds error');
        } catch (error) {
            if (!error.message.includes('Insufficient funds')) throw error;
        }
    });

    // Test Term Deposit functionality
    test('Term deposit creation and calculation', () => {
        const termDeposit = new TermDeposit(1, 10000, 5, 12); // $10000, 5% for 12 months
        const maturityAmount = termDeposit.calculateMaturityAmount();
        const expectedAmount = 10000 * (1 + (5/100/12 * 12)); // Simple calculation
        if (Math.abs(maturityAmount - expectedAmount) > 1) throw new Error('Maturity amount calculation incorrect');
    });

    test('Bank term deposit opening', () => {
        const bank = new Bank('Test Bank');
        const accountNumber = bank.createAccount(15000);
        const termDepositId = bank.openTermDeposit(accountNumber, 10000, 4, 6);
        
        if (bank.getBalance(accountNumber) !== 5000) throw new Error('Account balance after term deposit opening incorrect');
        
        const termDeposit = bank.getTermDeposit(termDepositId);
        const details = termDeposit.getDetails();
        if (details.principal !== 10000) throw new Error('Term deposit principal incorrect');
        if (details.interestRate !== 4) throw new Error('Term deposit interest rate incorrect');
    });

    test('Bank term deposit closing', () => {
        const bank = new Bank('Test Bank');
        const accountNumber = bank.createAccount(15000);
        const termDepositId = bank.openTermDeposit(accountNumber, 10000, 5, 12);
        
        const maturityAmount = bank.closeTermDeposit(termDepositId, accountNumber);
        const expectedBalance = 5000 + maturityAmount; // Remaining balance + maturity amount
        
        if (Math.abs(bank.getBalance(accountNumber) - expectedBalance) > 1) {
            throw new Error('Account balance after term deposit closing incorrect');
        }
    });

    test('Invalid operations handling', () => {
        const account = new Account(1010, 1000);
        
        // Test negative deposit
        try {
            account.deposit(-100);
            throw new Error('Should have rejected negative deposit');
        } catch (error) {
            if (!error.message.includes('must be positive')) throw error;
        }
        
        // Test negative withdrawal
        try {
            account.withdraw(-50);
            throw new Error('Should have rejected negative withdrawal');
        } catch (error) {
            if (!error.message.includes('must be positive')) throw error;
        }
    });

    // Summary
    console.log(`\n=== Test Results ===`);
    console.log(`Tests passed: ${testsPassed}/${testsTotal}`);
    console.log(`Success rate: ${((testsPassed/testsTotal) * 100).toFixed(1)}%`);
    
    if (testsPassed === testsTotal) {
        console.log('🎉 All tests passed!');
        return true;
    } else {
        console.log('❌ Some tests failed.');
        return false;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests };