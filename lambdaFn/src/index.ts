import {nanoid} from 'nanoid';
import { isWebUri } from 'valid-url';
import {DynamoDB,UpdateItemCommand}from '@aws-sdk/client-dynamodb'

const shortUrlIdSize: number = parseInt(<string>process.env.SHORT_URL_SIZE);
if (shortUrlIdSize < 7) throw new Error(`minimum value should be 7`);
const shortUrl = <string>process.env.SHORT_URL;
const Table_Region = process.env.TABLE_Region;
const Table_Name = process.env.TABLE_NAME;

const ddbClient = new DynamoDB({
    region: Table_Region,
    
})
export const handler = async (event: any) => {
    const res = {
        statusCode: 200,
        body: ''
     }
    try {
        const userUrl = event?.queryStringParameters?.url;
        if (!isWebUri(userUrl)) {
                 res.body = JSON.stringify({
                errMessage: 'not a valid Url'
            });
            res.statusCode = 400;
        } else {
            console.log(isWebUri(userUrl));
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
            console.log(data);     
            res.body = `${shortUrl}/${shortUrlId}`;
            }
        } catch(err:any) {
        console.log(err);
        res.statusCode = 500;
        res.body="something broke"
    } 
    process.on('uncaughtException', (err) => {
        console.log('hi-----------------------');
        console.log(err, 'from process');
        res.statusCode = 500;
        res.body="something broke"
         })
    return res;
   
};
