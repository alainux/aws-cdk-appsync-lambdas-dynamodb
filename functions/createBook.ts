import { Book, MutationCreateBookArgs } from "../types/books";
import type { AppSyncResolverHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const documentClient = new DynamoDB.DocumentClient();
export const handler: AppSyncResolverHandler<
  MutationCreateBookArgs,
  Book | null
> = async (event) => {
  const book = event.arguments.book;

  try {
    if (!process.env.BOOKS_TABLE) {
      console.log("Error: BOOKS_TABLE was not specified");
      return null;
    }

    await documentClient
      .put({
        TableName: process.env.BOOKS_TABLE,
        Item: book,
      })
      .promise();

    return book;
  } catch (e) {
    console.error("Whoops", e);
    return null;
  }
};
