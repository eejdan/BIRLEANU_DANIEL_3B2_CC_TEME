class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

function ensure(condition, statusCode, message) {
    if (!condition) {
        throw new HttpError(statusCode, message);
    }
}

export { HttpError, ensure };
