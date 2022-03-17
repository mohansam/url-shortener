import {nanoid} from 'nanoid';
import { isWebUri } from 'valid-url';
import {DynamoDB,UpdateItemCommand}from '@aws-sdk/client-dynamodb'
import { generateError,handleError,ErrorType} from './errorHandler';


const shortUrlIdSize: number = parseInt(<string>process.env.SHORT_URL_SIZE);
if (shortUrlIdSize < 7) throw new Error(`minimum value should be 7`);
const shortUrlRoot = <string>process.env.SHORT_URL_ROOT;
const Table_Region = process.env.TABLE_Region;
const Table_Name = process.env.TABLE_NAME;

const ddbClient = new DynamoDB({
    region: Table_Region,
    
})
export const handler = async (event: any) => {   
    try {       
        const userUrl = inputValidator(event.body);               
        const shortUrlId: string = nanoid(shortUrlIdSize);
        const command = new UpdateItemCommand({
                TableName: Table_Name,
                Key: {
                   urlShortId:{"S":shortUrlId}
                },
                UpdateExpression: 'SET userUrl=:userUrl',
                ExpressionAttributeValues: {
                    ":userUrl":{"S":userUrl}
                },
                ConditionExpression: 'attribute_not_exists(urlShortId)',
        });
        const data = await ddbClient.send(command);
        if (data.$metadata.httpStatusCode != 200) 
        {
         let errorProps = {                
                StatusCode: 400,
                body: JSON.stringify({ 'error': 'something broke' })
            };
            throw generateError(errorProps,ErrorType.Error_In_500_Range);    
        }                
        return { statusCode: 200, body: JSON.stringify({ 'shortUrl': `${shortUrlRoot}/${shortUrlId}` })};            
        } catch(err:any) {
         const res = handleError(err);
        return res;
    }
   
};

const inputValidator = (inputBody: string) => {
    let body = JSON.parse(inputBody);
    let userUrl: string = body.url;
     if (!isWebUri(userUrl)) {
            let errorProps = {                
                StatusCode: 400,
                body: JSON.stringify({ 'error': 'not a valid url ' })
            };
            throw generateError(errorProps,ErrorType.Error_In_400_Range);           
    }
    return userUrl;
}
