import type { AppSyncResolverHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { Book, QueryGetBookByIdArgs } from "../types/books";

const documentClient = new DynamoDB.DocumentClient();
export const handler: AppSyncResolverHandler<
  QueryGetBookByIdArgs,
  Book | null
> = async (event) => {
  const bookId = event.arguments.bookId;
  try {
    if (!process.env.BOOKS_TABLE) {
      console.log("Error: BOOKS_TABLE was not specified");
      return null;
    }

    const { Item } = await documentClient
      .get({
        TableName: process.env.BOOKS_TABLE,
        Key: { id: bookId },
      })
      .promise();

    return Item as Book;
  } catch (e) {
    console.error("Whoops", e);
    return null;
  }
};
