import { SampleHandler } from "./handlers/SampleHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";

const environmentProvider = new EnvironmentProvider();

const handler = new SampleHandler(environmentProvider).getHandler();

export default handler;

// /**
//  *
//  * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
//  * @param {Object} event - API Gateway Lambda Proxy Input Format
//  *
//  * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
//  * @returns {Object} object - API Gateway Lambda Proxy Output Format
//  *
//  */

// export const lambdaHandler = async (
//   event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   try {
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: "sample handler !",
//         event: {
//           method: event.httpMethod,
//           body: event.body,
//           headers: event.headers,
//           queryParam: event.queryStringParameters,
//           pathParam: event.pathParameters,
//         },
//       }),
//     };
//   } catch (err) {
//     console.log(err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: "some error happened",
//         event,
//       }),
//     };
//   }
// };

// export default lambdaHandler;
