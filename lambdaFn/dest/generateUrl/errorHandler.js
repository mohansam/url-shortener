"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.generateError = void 0;
const generateError = (errProps) => {
    let error = new Error(JSON.stringify(errProps));
    error.name = 'operational exception';
    return error;
};
exports.generateError = generateError;
const handleError = (err) => {
    if (err.name.includes('operational exception')) {
        let errorProps = JSON.parse(err.message);
        return { statusCode: errorProps.StatusCode, body: errorProps.body };
    }
    else {
        console.log(err.message);
        return { statusCode: 500, body: 'something broke' };
    }
};
exports.handleError = handleError;
