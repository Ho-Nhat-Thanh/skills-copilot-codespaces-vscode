class TermDeposit {
    constructor(accountNumber, principal, interestRate, termMonths) {
        this.accountNumber = accountNumber;
        this.principal = principal;
        this.interestRate = interestRate; // Annual interest rate as percentage
        this.termMonths = termMonths;
        this.startDate = new Date();
        this.maturityDate = new Date();
        this.maturityDate.setMonth(this.maturityDate.getMonth() + termMonths);
        this.isActive = true;
    }

    calculateMaturityAmount() {
        const monthlyRate = this.interestRate / 100 / 12;
        return this.principal * (1 + (monthlyRate * this.termMonths));
    }

    getDetails() {
        return {
            accountNumber: this.accountNumber,
            principal: this.principal,
            interestRate: this.interestRate,
            termMonths: this.termMonths,
            startDate: this.startDate,
            maturityDate: this.maturityDate,
            maturityAmount: this.calculateMaturityAmount(),
            isActive: this.isActive
        };
    }

    close() {
        if (!this.isActive) {
            throw new Error('Term deposit is already closed');
        }
        this.isActive = false;
        return this.calculateMaturityAmount();
    }

    isMatured() {
        return new Date() >= this.maturityDate;
    }
}

module.exports = TermDeposit;