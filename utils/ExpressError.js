class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message); // Pass message to base Error class
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
