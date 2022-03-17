import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'



export class UrlShortenerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const urlShortenerTable = new ddb.Table(this, 'urlShortenerTable', {
      partitionKey: {
        name: 'urlShortId',
        type: ddb.AttributeType.STRING
      }, tableName: 'urlShortenerTable_Cdk',
        removalPolicy:cdk.RemovalPolicy.DESTROY
    });
    const urlShortenerLayer = new lambda.LayerVersion(this, 'urlShortenerLayer', {
      code: lambda.Code.fromAsset('./lambdaFn/layer'),
      compatibleArchitectures:[ lambda.Architecture.ARM_64],
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      description: "contains nanao id and Dynamodb sdk client",
      layerVersionName: 'urlShortenerLayer_Cdk',
      removalPolicy:cdk.RemovalPolicy.DESTROY
    })
    const urlShortenerLambdaGenerateUrlFun = new lambda.Function(this, 'urlShortenerLambdaGenerateUrlFun', {
      runtime: lambda.Runtime.NODEJS_14_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset('./lambdaFn/dest/generateUrl'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: urlShortenerTable.tableName,
        TABLE_Region:'ap-south-1',
        SHORT_URL_SIZE: '8',
        SHORT_URL_ROOT:'https://chotta.in'
      },
      functionName: 'urlShortenerLambdaGenerateUrlFun_Cdk',
      layers: [urlShortenerLayer],
      description:'use to parse inbound request'
    });
    urlShortenerTable.grantReadWriteData(urlShortenerLambdaGenerateUrlFun);
    
    /*-------------------------------*/
    const urlShortenerLambdaRedirectUrlFun = new lambda.Function(this, 'urlShortenerLambdaRedirectUrlFun', {
      runtime: lambda.Runtime.NODEJS_14_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset('./lambdaFn/dest/redirectUrl'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: urlShortenerTable.tableName,
        TABLE_Region:'ap-south-1',
        SHORT_URL_ROOT:'https://chotta.in'
      },
      functionName: 'urlShortenerLambdaRedirectUrlFun',
      layers: [urlShortenerLayer],
      description:'use to parse redirect request'
    });
    urlShortenerTable.grantReadWriteData(urlShortenerLambdaRedirectUrlFun);    
    /*----------------------------------*/
  
   const urlShortenerApiGateWay = new apigateway.RestApi(this, 'urlShortenerApiGateWay', {
      restApiName: 'urlShortenerApiGateWay_Cdk'
   });
      const urlJSonSchema: apigateway.JsonSchema = {
        title: 'urlValidatorSchema',
       // pattern: "^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$g",
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        required: ['url'],
        properties: {
        url: {           
            type:apigateway.JsonSchemaType.STRING ,                                
        }
    }
        
    }
    const urlValidatorModel = new apigateway.Model(this, 'urlValidatorModel', {
      restApi: urlShortenerApiGateWay,
      modelName: 'urlValidatorModelCdk',
      schema: urlJSonSchema,
      description: 'input url validator'
    });
    const urlRequestValidator = new apigateway.RequestValidator(this, 'urlRequestValidator', {
      restApi: urlShortenerApiGateWay,
      validateRequestBody: true,
      requestValidatorName: 'urlRequestValidator_Cdk'
    });

    const urlShortenerApiGateWayResource = urlShortenerApiGateWay.root.addResource('api');
    urlShortenerApiGateWayResource
      .addResource('v1')
      .addResource('generate')
      .addMethod('post', new apigateway.LambdaIntegration(urlShortenerLambdaGenerateUrlFun), {
        requestValidator: urlRequestValidator,
        requestModels: {
            'application/json':urlValidatorModel
        },
        
      });   
    
    urlShortenerApiGateWay
      .root
      .addResource('{shortUrl}')
      .addMethod('get', new apigateway.LambdaIntegration(urlShortenerLambdaRedirectUrlFun));
    /*---------------------*/

  
  }
}
