import * as cdk from "@aws-cdk/core";
import * as appSync from "@aws-cdk/aws-appsync";
export class BookStoreGraphqlApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appSync.GraphqlApi(this, "MyApi", {
      name: "my-book-api",
      schema: appSync.Schema.fromAsset("graphql/schema.graphql"),
    });
  }
}
