"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const errorHandler_1 = require("./errorHandler");
const Table_Region = process.env.TABLE_Region;
const Table_Name = process.env.TABLE_NAME;
const ddbClient = new client_dynamodb_1.DynamoDB({
    region: Table_Region,
});
const handler = async (event) => {
    var _a, _b, _c;
    try {
        const res = { statusCode: 302, headers: { location: '' } };
        const shortUrlId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.shortUrl;
        if (!shortUrlId) {
            let errorProps = {
                StatusCode: 400,
                body: JSON.stringify({ 'error': 'short url not mentioned' }),
            };
            throw (0, errorHandler_1.generateError)(errorProps, errorHandler_1.ErrorType.Error_In_400_Range);
        }
        const command = new client_dynamodb_1.GetItemCommand({
            TableName: Table_Name,
            Key: {
                urlShortId: { "S": shortUrlId }
            }
        });
        const data = await ddbClient.send(command);
        res.headers.location = ((_b = data.Item) === null || _b === void 0 ? void 0 : _b.userUrl) ? (_c = data.Item) === null || _c === void 0 ? void 0 : _c.userUrl.S : 'error/404.html';
        return res;
    }
    catch (err) {
        const res = (0, errorHandler_1.handleError)(err);
        return res;
    }
};
exports.handler = handler;
