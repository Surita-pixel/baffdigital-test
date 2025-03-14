import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ProceduresApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, 'ProceduresTable', {
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const proceduresLambda = new lambda.Function(this, 'ProceduresLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        table.grantReadWriteData(proceduresLambda);

        const api = new apigateway.RestApi(this, 'ProceduresApi');
        
        const procedures = api.root.addResource('procedures');
        procedures.addMethod('GET', new apigateway.LambdaIntegration(proceduresLambda));
        procedures.addMethod('POST', new apigateway.LambdaIntegration(proceduresLambda));

        const procedureById = procedures.addResource('{id}');
        procedureById.addMethod('PUT', new apigateway.LambdaIntegration(proceduresLambda));
        procedureById.addMethod('DELETE', new apigateway.LambdaIntegration(proceduresLambda));
    }
}
