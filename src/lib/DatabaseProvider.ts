import { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import mapKeys from "lodash/mapKeys";
import mapValues from "lodash/mapValues";

export interface IDatabaseProvider {
  scan(
    params: Partial<DynamoDB.DocumentClient.ScanInput>
  ): Promise<DynamoDB.DocumentClient.ScanOutput>;
  query(
    params: Partial<DynamoDB.DocumentClient.QueryInput>
  ): Promise<DynamoDB.DocumentClient.QueryOutput>;
  getItem<T = Record<string, unknown>>(
    key: string | DocumentClient.Key
  ): Promise<T>;
  putItem(item: object): Promise<DocumentClient.PutItemOutput>;
  updateItem(key: string | DocumentClient.Key, data: object): Promise<object>;
  deleteItem(key: string | DocumentClient.Key): Promise<object>;
}

export class DynamoDBServiceProvider implements IDatabaseProvider {
  private readonly tableName: string;
  private readonly documentClient: DynamoDB.DocumentClient;

  async scan(
    params: Partial<DocumentClient.ScanInput>
  ): Promise<DocumentClient.ScanOutput> {
    const scanInput: DocumentClient.ScanInput = {
      ...params,
      TableName: this.tableName,
    };

    return this.documentClient.scan(scanInput).promise();
  }
  async query(
    params: Partial<DocumentClient.QueryInput>
  ): Promise<DocumentClient.QueryOutput> {
    return this.documentClient
      .query({ ...params, TableName: this.tableName })
      .promise();
  }

  async getItem<T = Record<string, unknown>>(
    key: string | DocumentClient.Key
  ): Promise<T> {
    const partitionKey: DocumentClient.Key =
      typeof key === "string" ? { id: key } : key;

    const params: DocumentClient.GetItemInput = {
      Key: partitionKey,
      TableName: this.tableName,
    };

    const result: DocumentClient.GetItemOutput = await this.documentClient
      .get(params)
      .promise();

    if (!result.Item) {
      return null;
    }

    return Object.assign(Object.create(null), result.Item);
  }

  async putItem(item: object): Promise<DocumentClient.PutItemOutput> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: item,
    };

    try {
      return await this.documentClient
        .put(params)
        .promise()
        .then(
          (result) => {
            return result;
          },
          (e) => {
            if (e.code == "ConditionalCheckFailedException") {
              console.error("DynamoDBServiceProvider.putItem");
              return {};
            } else {
              throw e;
            }
          }
        );
    } catch (error) {
      console.error("Error putting item into DynamoDB:", error);
      throw error;
    }
  }

  async updateItem(
    key: string | DocumentClient.Key,
    data: object
  ): Promise<object> {
    const partitionKey: DocumentClient.Key =
      typeof key === "string" ? { id: key } : key;

    const updateExpressionKeys = Object.keys(data).map((k) => {
      return `#${k}=:${k}`;
    });

    const updateExpression: DocumentClient.UpdateExpression = `set ${updateExpressionKeys
      .filter((v) => {
        return v.length;
      })
      .join(",")}`;


    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};  

    for (const key in data) {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;
  
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = data[key];
    }

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.tableName,
      Key: partitionKey,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    try {
      return this.documentClient
        .update(params)
        .promise()
        .then(
          (result) => {
            return result;
          },
          (e) => {
            throw e;
          }
        );
    } catch (error) {
      console.error("Error updating item in DynamoDB:", error);
      throw error;
    }
  }

  async deleteItem(key: string | DocumentClient.Key): Promise<object> {
    const partitionKey: DocumentClient.Key =
      typeof key === "string" ? { id: key } : key;

    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      Key: partitionKey,
    };

    try {
      return await this.documentClient.delete(params).promise();
    } catch (error) {
      console.error("Error deleting item from DynamoDB:", error);
      throw error;
    }
  }

  constructor(tableName: string) {
    this.tableName = tableName;
    this.documentClient = new DynamoDB.DocumentClient();
  }
}
