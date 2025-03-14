const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event: { httpMethod: any; path: any; body: string; pathParameters: { id: any; }; }) => {
    console.log("Event received:", JSON.stringify(event, null, 2));

    const method = event.httpMethod;
    const path = event.path;
    let response;

    try {
        if (method === 'GET' && path === '/procedures') {
            const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
            response = { statusCode: 200, body: JSON.stringify(result.Items) };
        } else if (method === 'POST' && path === '/procedures') {
            const body = JSON.parse(event.body);
            const id = `PROCEDURE#${Date.now()}`;
            await dynamo.put({ TableName: TABLE_NAME, Item: { PK: id, ...body } }).promise();
            response = { statusCode: 201, body: JSON.stringify({ id, ...body }) };
        } else if (method === 'PUT' && path.startsWith('/procedures/')) {
            const id = `PROCEDURE#${event.pathParameters.id}`;
            const body = JSON.parse(event.body);
            await dynamo.update({
                TableName: TABLE_NAME,
                Key: { PK: id },
                UpdateExpression: 'set title = :title',
                ExpressionAttributeValues: { ':title': body.title },
            }).promise();
            response = { statusCode: 200, body: JSON.stringify({ message: "Updated successfully" }) };
        } else if (method === 'DELETE' && path.startsWith('/procedures/')) {
            const id = `PROCEDURE#${event.pathParameters.id}`;
            await dynamo.delete({ TableName: TABLE_NAME, Key: { PK: id } }).promise();
            response = { statusCode: 200, body: JSON.stringify({ message: "Deleted successfully" }) };
        } else {
            response = { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
        }
    } catch (error) {
        response = { statusCode: 500, body: JSON.stringify({ error: (error as any).message }) };
    }

    return response;
};
