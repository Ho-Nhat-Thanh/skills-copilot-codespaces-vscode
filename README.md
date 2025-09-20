# Digital Banking System

A comprehensive financial application built with Node.js that provides essential banking services including account management, money transfers, and term deposits.

## Features

### Core Banking Operations
- **Account Management**: Create and manage bank accounts with unique account numbers
- **Balance Inquiry**: Check current account balance instantly
- **Money Withdrawal**: Withdraw funds with automatic balance validation
- **Money Transfer**: Transfer funds between accounts securely
- **Transaction History**: View complete transaction history for any account

### Advanced Financial Services
- **Term Deposits**: Open fixed-term deposits with competitive interest rates
- **Maturity Calculations**: Automatic calculation of term deposit maturity amounts
- **Term Deposit Management**: View and close term deposits before or at maturity

### Security & Validation
- Input validation for all financial operations
- Insufficient funds protection
- Transaction logging and audit trail
- Error handling with descriptive messages

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skills-copilot-codespaces-vscode
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Application
```bash
npm start
```

### Running Tests
```bash
npm test
```

## Application Menu

The application provides an interactive command-line interface with the following options:

1. **Create Account** - Open a new bank account with initial deposit
2. **Login to Account** - Access an existing account using account number
3. **Check Balance** - View current account balance
4. **Deposit Money** - Add funds to your account
5. **Withdraw Money** - Remove funds from your account
6. **Transfer Money** - Send money to another account
7. **Open Term Deposit** - Create a fixed-term investment
8. **View Term Deposits** - See all active and closed term deposits
9. **Close Term Deposit** - Withdraw funds from a term deposit
10. **View Transaction History** - Review all account transactions
11. **Exit** - Close the application

## Example Usage

### Creating an Account
```
Select option 1: Create Account
Enter initial deposit amount ($): 1000
Account created successfully! Account Number: 1000
Initial balance: $1000.00
```

### Making a Transfer
```
Select option 6: Transfer Money
Enter recipient account number: 1001
Enter transfer amount ($): 150
Transfer successful!
Your new balance: $850.00
Recipient's new balance: $1150.00
```

### Opening a Term Deposit
```
Select option 7: Open Term Deposit
Enter term deposit amount ($): 5000
Enter annual interest rate (%): 4.5
Enter term in months: 12
Term deposit opened successfully!
Term Deposit ID: 1
Principal: $5000.00
Interest Rate: 4.5% per annum
Term: 12 months
Maturity Date: [Future Date]
Maturity Amount: $5225.00
```

## Architecture

The application is built with a modular architecture:

### Core Classes

- **Account**: Manages individual account operations and transaction history
- **Bank**: Orchestrates all banking operations and account management
- **TermDeposit**: Handles fixed-term investment calculations and management
- **BankingApp**: Provides the command-line interface and user interaction

### Key Files

- `index.js` - Main application entry point and CLI interface
- `bank.js` - Core banking logic and operations
- `account.js` - Individual account management
- `termDeposit.js` - Term deposit functionality
- `test.js` - Comprehensive test suite

## Testing

The application includes comprehensive tests covering:

- Account creation and management
- Deposit and withdrawal operations
- Money transfer functionality
- Term deposit operations
- Error handling and validation
- Edge cases and boundary conditions

Run tests with: `npm test`

## Error Handling

The application includes robust error handling for:
- Invalid input amounts (negative or non-numeric)
- Insufficient funds for withdrawals and transfers
- Non-existent accounts or term deposits
- Invalid account operations

## Future Enhancements

Potential improvements could include:
- Web-based user interface
- Database persistence
- Multi-currency support
- Advanced interest calculation methods
- Account statements and reporting
- User authentication and security features

## License

ISC License
