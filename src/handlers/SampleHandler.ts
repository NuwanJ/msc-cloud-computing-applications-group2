import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IDatabaseProvider } from "../lib/DatabaseProvider";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
export class SampleHandler extends APIGatewayEventHandler {
  // Path formats:
  // - /sample
  // - /sample/{action}
  // - /sample/{action}/{subAction}

  async handle(): Promise<IEventResult> {
    if (this.getPathParam("action") == "db") {
      if (this.event.requestContext.httpMethod === RequestType.PUT) {
        // An example for add new record
        // [PUT] sample/db/
        // example body: { "id": "10", "name": "John", "age": 32}
        const resp = await this.databaseProvider.putItem(this.getBody());
        return new EventResult(
          {
            message: "Database PUT",
            response: resp,
          },
          200
        );
      } else if (this.event.requestContext.httpMethod === RequestType.GET) {
        const id = this.getPathParam("subAction");

        if (id) {
          // An example for get a specific record by id
          // [GET] sample/db/:id
          const resp = await this.databaseProvider.getItem(id);
          return new EventResult(
            {
              message: "Database GET",
              key: id,
              response: resp,
            },
            200
          );
        } else {
          // An example for list all records
          // [GET] sample/db/
          const resp = await this.databaseProvider.scan({});
          return new EventResult(
            {
              message: "Database GET list",
              response: resp,
            },
            200
          );
        }
      } else if (this.event.requestContext.httpMethod === RequestType.POST) {
        // An example for update a specific record by key
        // [POST] sample/db/:id
        const id = this.getPathParam("subAction");
        const newValues = { ...this.getBody(), id };
        if (id) {
          const resp = await this.databaseProvider.updateItem(id, newValues);
          return new EventResult(
            {
              message: "Database POST",
              key: id,
              newValues: newValues,
              response: resp,
            },
            200
          );
        } else {
          // An example for get records by scan query
          // [POST] sample/db/
          // example body: {"FilterExpression": "age > :threshold","ExpressionAttributeValues": {":threshold": 24 } }
          const resp = await this.databaseProvider.scan(this.getBody());
          return new EventResult(
            {
              message: "Database POST for scan",
              newValues: newValues,
              response: resp,
            },
            200
          );
        }
      } else if (this.event.requestContext.httpMethod === RequestType.DELETE) {
        // An example for delete a specific record by key
        // [DELETE] sample/db/:id
        const id = this.getPathParam("subAction");
        if (id) {
          const resp = await this.databaseProvider.deleteItem(id);
          return new EventResult(
            {
              message: "Database DELETE",
              key: id,
              response: resp,
            },
            200
          );
        }
      }
    } else if (this.event.requestContext.httpMethod === RequestType.GET) {
      return new EventResult(
        {
          message: "This is a sample message for a GET request",
          request: {
            query: this.getQueryStringParameters(),
            path: this.getPathParameters(),
          },
        },
        200
      );
    } else if (this.event.requestContext.httpMethod === RequestType.POST) {
      return new EventResult(
        {
          message: "This is a sample message for a POST request",
          request: {
            query: this.getQueryStringParameters(),
            path: this.getPathParameters(),
            body: this.getBody(),
          },
        },
        200
      );
    } else {
      return this.sampleFunction();
    }

    // return new EventResult(null, 404);
  }

  async sampleFunction(): Promise<IEventResult> {
    return new EventResult({ Sample: "This is a sample function" }, 200);
  }

  constructor(
    public environmentProvider: IEnvironmentProvider,
    public databaseProvider: IDatabaseProvider
  ) {
    super(environmentProvider);
  }
}
