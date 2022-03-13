import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
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
    const urlShortenerLambdaFun = new lambda.Function(this, 'urlShortenerLambdaFun', {
      runtime: lambda.Runtime.NODEJS_14_X,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset('./lambdaFn/dest'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: urlShortenerTable.tableName,
        TABLE_Region:'ap-south-1',
        SHORT_URL_SIZE: '8',
        SHORT_URL:'https://chotta.in'
      },
      functionName: 'urlShortenerLambdaFun_Cdk',
      layers: [urlShortenerLayer],
      description:'use to parse inbound request'
    });
    urlShortenerTable.grantReadWriteData(urlShortenerLambdaFun);

    const urlShortenerApiGateWay = new apigateway.RestApi(this, 'urlShortenerApiGateWay', {
      restApiName: 'urlShortenerApiGateWay_Cdk'
    });    
    const urlShortenerApiGateWayResource = urlShortenerApiGateWay.root.addResource('api');
    urlShortenerApiGateWayResource
      .addResource('v1')
      .addResource('generate')
      .addMethod('get', new apigateway.LambdaIntegration(urlShortenerLambdaFun));
       
    
  }
}
