"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const nanoid_1 = require("nanoid");
const valid_url_1 = require("valid-url");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const shortUrlIdSize = parseInt(process.env.SHORT_URL_SIZE);
if (shortUrlIdSize < 7)
    throw new Error(`minimum value should be 7`);
const shortUrl = process.env.SHORT_URL;
const Table_Region = process.env.TABLE_Region;
const Table_Name = process.env.TABLE_NAME;
const ddbClient = new client_dynamodb_1.DynamoDB({
    region: Table_Region,
});
const handler = async (event) => {
    var _a;
    const res = {
        statusCode: 200,
        body: ''
    };
    try {
        const userUrl = (_a = event === null || event === void 0 ? void 0 : event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.url;
        if (!(0, valid_url_1.isWebUri)(userUrl)) {
            res.body = JSON.stringify({
                errMessage: 'not a valid Url'
            });
            res.statusCode = 400;
        }
        else {
            console.log((0, valid_url_1.isWebUri)(userUrl));
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
            console.log(data);
            res.body = `${shortUrl}/${shortUrlId}`;
        }
    }
    catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.body = "something broke";
    }
    process.on('uncaughtException', (err) => {
        console.log('hi-----------------------');
        console.log(err, 'from process');
        res.statusCode = 500;
        res.body = "something broke";
    });
    return res;
};
exports.handler = handler;
