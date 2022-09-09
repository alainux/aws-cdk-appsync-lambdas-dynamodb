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

    const commonLambdaProps: Omit<lambda.FunctionProps, "handler"> = {
      code: lambda.Code.fromAsset("functions"),
      runtime: lambda.Runtime.NODEJS_14_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 1024,
      environment: {
        BOOKS_TABLE: booksTable.tableName,
      },
    };

    const listBooksLambda = new lambda.Function(this, "listBooksHandler", {
      handler: "listBooks.handler",
      ...commonLambdaProps,
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

    const createBookLambda = new lambda.Function(this, "createBookHandler", {
      handler: "createBook.handler",
      ...commonLambdaProps,
    });

    booksTable.grantReadWriteData(createBookLambda);

    const createBookDataSource = api.addLambdaDataSource(
      "createBookDataSource",
      createBookLambda
    );

    createBookDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "createBook",
    });

    const getBookByIdLambda = new lambda.Function(this, "getBookByIdsHandler", {
      handler: "getBookById.handler",
      ...commonLambdaProps,
    });

    booksTable.grantReadData(getBookByIdLambda);

    const getBookByIdDataSource = api.addLambdaDataSource(
      "getBookByIdDataSource",
      getBookByIdLambda
    );

    getBookByIdDataSource.createResolver({
      typeName: "Query",
      fieldName: "getBookById",
    });
  }
}
