import * as cdk from "@aws-cdk/core";
import * as appSync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
export class BookStoreGraphqlApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appSync.GraphqlApi(this, "MyApi", {
      name: "my-book-api",
      schema: appSync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appSync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            name: "My very own API key",
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });

    const booksTable = new dynamodb.Table(this, "BooksTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const listBooksLambda = new lambda.Function(this, "listBooksHandler", {
      code: lambda.Code.fromAsset("functions"),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "listBooks.handler",
      environment: {
        BOOKS_TABLE: booksTable.tableName,
      },
    });

    booksTable.grantReadData(listBooksLambda);

    const listBooksDataSource = api.addLambdaDataSource(
      "listBooksDataSource",
      listBooksLambda
    );

    listBooksDataSource.createResolver({
      typeName: "Query",
      fieldName: "listBooks",
    });
  }
}
