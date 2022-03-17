"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const nanoid_1 = require("nanoid");
const valid_url_1 = require("valid-url");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const errorHandler_1 = require("./errorHandler");
const shortUrlIdSize = parseInt(process.env.SHORT_URL_SIZE);
if (shortUrlIdSize < 7)
    throw new Error(`minimum value should be 7`);
const shortUrlRoot = process.env.SHORT_URL_ROOT;
const Table_Region = process.env.TABLE_Region;
const Table_Name = process.env.TABLE_NAME;
const ddbClient = new client_dynamodb_1.DynamoDB({
    region: Table_Region,
});
const handler = async (event) => {
    try {
        const userUrl = inputValidator(event.body);
        const shortUrlId = (0, nanoid_1.nanoid)(shortUrlIdSize);
        const command = new client_dynamodb_1.UpdateItemCommand({
            TableName: Table_Name,
            Key: {
                urlShortId: { "S": shortUrlId }
            },
            UpdateExpression: 'SET userUrl=:userUrl',
            ExpressionAttributeValues: {
                ":userUrl": { "S": userUrl }
            },
            ConditionExpression: 'attribute_not_exists(urlShortId)',
        });
        const data = await ddbClient.send(command);
        if (data.$metadata.httpStatusCode != 200) {
            let errorProps = {
                StatusCode: 400,
                body: JSON.stringify({ 'error': 'something broke' })
            };
            throw (0, errorHandler_1.generateError)(errorProps, errorHandler_1.ErrorType.Error_In_500_Range);
        }
        return { statusCode: 200, body: JSON.stringify({ 'shortUrl': `${shortUrlRoot}/${shortUrlId}` }) };
    }
    catch (err) {
        const res = (0, errorHandler_1.handleError)(err);
        return res;
    }
};
exports.handler = handler;
const inputValidator = (inputBody) => {
    let body = JSON.parse(inputBody);
    let userUrl = body.url;
    if (!(0, valid_url_1.isWebUri)(userUrl)) {
        let errorProps = {
            StatusCode: 400,
            body: JSON.stringify({ 'error': 'not a valid url ' })
        };
        throw (0, errorHandler_1.generateError)(errorProps, errorHandler_1.ErrorType.Error_In_400_Range);
    }
    return userUrl;
};
