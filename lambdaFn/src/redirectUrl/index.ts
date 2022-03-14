import {DynamoDB,GetItemCommand}from '@aws-sdk/client-dynamodb'
import { generateError,handleError,ErrorType} from './errorHandler';

const Table_Region = process.env.TABLE_Region;
const Table_Name = process.env.TABLE_NAME;

const ddbClient = new DynamoDB({
    region: Table_Region,
});

export const handler = async (event: any) => {
    try {
     const shortUrlId = event.pathParameters?.shortUrl;
        if (!shortUrlId) {
            let errorProps = {                
                StatusCode: 400,
                body: JSON.stringify({ 'error': 'short url not mentioned' }),
            };
            throw generateError(errorProps, ErrorType.Error_In_400_Range);
        }

     const command = new GetItemCommand({
        TableName: Table_Name,
        Key: {
            urlShortId: { "S": shortUrlId }}
     });
     const data = await ddbClient.send(command);
    if (!data.Item?.userUrl) {
        let errorProps = {
            StatusCode: 404,
            body: JSON.stringify({ 'error': 'short url not found' }),
        };       
        throw generateError(errorProps, ErrorType.Error_In_400_Range);
        };
    return {statusCode:302,headers:{location:data.Item?.userUrl.S}};         
    } catch (err:any) {
        const res = handleError(err);
        return res;
    }
};





