"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.generateError = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["Error_In_400_Range"] = "Error_In_400_Range";
    ErrorType["Error_In_500_Range"] = "Error_In_500_Range";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
const generateError = (errProps, errorType) => {
    let error = new Error(JSON.stringify(errProps));
    error.name = errorType;
    return error;
};
exports.generateError = generateError;
const handleError = (err) => {
    if (err.name.includes('Error_In_400_Range')) {
        let errorProps = JSON.parse(err.message);
        return { statusCode: errorProps.StatusCode, body: errorProps.body };
    }
    else {
        console.log(err.message);
        return { statusCode: 500, body: 'something broke' };
    }
};
exports.handleError = handleError;
