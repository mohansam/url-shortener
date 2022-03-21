import {DynamoDB,GetItemCommand}from '@aws-sdk/client-dynamodb'
import { generateError,handleError,ErrorType} from './errorHandler';

const Table_Region = process.env.TABLE_Region;
const Table_Name = process.env.TABLE_NAME;

const ddbClient = new DynamoDB({
    region: Table_Region,
});

export const handler = async (event: any) => {
    try {
        const res = {statusCode: 302, headers:{location:''}};
     const shortUrlId = event.pathParameters?.shortUrl;
        if (!shortUrlId) {
            res.headers.location = 'home/index.html';
            return res;       
        }

     const command = new GetItemCommand({
        TableName: Table_Name,
        Key: {
            urlShortId: { "S": shortUrlId }}
     });
        const data = await ddbClient.send(command);       
        res.headers.location = data.Item?.userUrl ? <string>data.Item?.userUrl.S : 'error/404.html';   
        return res;         
    } catch (err:any) {
        const res = handleError(err);
        return res;
    }
};





