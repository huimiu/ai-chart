/* This code sample provides a starter kit to implement server side logic for your Teams App in TypeScript,
 * refer to https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference for complete Azure Functions
 * developer guide.
 */

// Import polyfills for fetch required by msgraph-sdk-javascript.
import "isomorphic-fetch";

import { Context, HttpRequest } from "@azure/functions";
import {
  ApiKeyLocation,
  ApiKeyProvider,
  AxiosInstance,
  OnBehalfOfCredentialAuthConfig,
  OnBehalfOfUserCredential,
  createApiClient,
} from "@microsoft/teamsfx";

import config from "../config";

// Define a Response interface with a status number and a body object that can contain any key-value pairs.
interface Response {
  status: number;
  body: { [key: string]: any };
}

// Define a TeamsfxContext type as an object that can contain any key-value pairs.
type TeamsfxContext = { [key: string]: any };

/**
 * This function is the entry point for the Azure Function.
 * It handles HTTP requests from the Teams client and calls the appropriate function based on the request parameters.
 *
 * @param {Context} context - The Azure Functions context object.
 * @param {HttpRequest} req - The HTTP request.
 * @param {teamsfxContext} TeamsfxContext - The context generated by teamsfx binding.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
export default async function run(
  context: Context,
  req: HttpRequest,
  teamsfxContext: TeamsfxContext,
): Promise<Response> {
  context.log("HTTP trigger function processed a request.");

  // Initialize response.
  const res: Response = {
    status: 200,
    body: {},
  };

  // Put an echo into response body.
  res.body.receivedHTTPRequestBody = req.body || "";

  // Prepare access token.
  const accessToken: string = teamsfxContext["AccessToken"];
  if (!accessToken) {
    return {
      status: 400,
      body: {
        error: "No access token was found in request header.",
      },
    };
  }

  // Set up the configuration for the OnBehalfOfUserCredential.
  const oboAuthConfig: OnBehalfOfCredentialAuthConfig = {
    authorityHost: config.authorityHost,
    clientId: config.clientId,
    tenantId: config.tenantId,
    clientSecret: config.clientSecret,
  };

  let oboCredential: OnBehalfOfUserCredential;
  try {
    // Construct the OnBehalfOfUserCredential using the access token and configuration.
    oboCredential = new OnBehalfOfUserCredential(accessToken, oboAuthConfig);
  } catch (e) {
    context.log.error(e);
    return {
      status: 500,
      body: {
        error:
          "Failed to construct OnBehalfOfUserCredential using your accessToken. " +
          "Ensure your function app is configured with the right Azure AD App registration.",
      },
    };
  }

  // Get the graphType, method, and request data from the HTTP request.
  const graphType = req.query["graphType"];
  const method = req.method;
  const reqData = req.body;

  try {
    // Call the appropriate function based on the graphType and method.
    const result = await handleRequest(oboCredential, graphType, method, reqData);
    res.body = { ...res.body, ...result };
  } catch (e) {
    context.log.error(e);
    return {
      status: 500,
      body: {
        error: "Failed to process request.",
      },
    };
  }

  return res;
}

/**
 * Handles the request based on the given graphType and method.
 *
 * @param {OnBehalfOfUserCredential} oboCredential - The on-behalf-of user credential.
 * @param {string} graphType - The type of graph to query (e.g. "calendar", "task").
 * @param {string} method - The HTTP method to use (e.g. "GET", "POST").
 * @param {any} reqData - The request data to use (if applicable).
 * @returns {Promise<any>} - A promise that resolves with the result of the request.
 */
async function handleRequest(
  oboCredential: OnBehalfOfUserCredential,
  graphType: string,
  method: string,
  reqData: any,
): Promise<any> {
  // Switch statement to handle different graphType and method combinations
  switch (`${graphType}:${method}`) {
    case "queryDB:GET": {
      return {
        queryResult: await queryDB(
          "SELECT Top 10 ProductID, sum(OrderQty) as SaleCount FROM [SalesLT].[SalesOrderDetail] GROUP BY ProductID",
        ),
        x: "ProductID",
        y: "SaleCount",
      };
    }
    case "aiPower:POST": {
      const aiResponse = await callOAI(reqData.question);
      const sqlContext = JSON.parse(aiResponse);
      return {
        queryResult: await queryDB(sqlContext.sql),
        sqlString: sqlContext.sql,
        x: sqlContext.x,
        y: sqlContext.y,
      };
    }
    // If no matching graphType and method combination is found
    default: {
      throw new Error(`Invalid graphType (${graphType}) or method (${method})`);
    }
  }
}

async function callOAI(body: string) {
  try {
    const completionReq = {
      messages: [
        {
          content: `
            You are a senior sql engineer, you are good at generating suitable and accurate sql statements based on the user's description. Now there is a requirement to generate sql statements, your mission is to complete this sql generation requirement.
            
            ## Goal
            Analyze and disassemble the user's needs, and provide accurate sql statements and related information.
            
            ## Table Definition
            - The [SalesLT].[SalesOrderDetail] table is a sample table that contains information about the sales order details of a fictitious company called Adventure Works.
            
            ## Column Definition
              - SalesOrderID: The unique identifier of the sales order header that this detail belongs to.
              - SalesOrderDetailID: The unique identifier of the sales order detail.
              - OrderQty: The quantity ordered for this product.
              - ProductID: The identifier of the product that was ordered.
              - UnitPrice: The selling price of a single unit of the product.
              - UnitPriceDiscount: The discount amount applied to the unit price, if any.
              - LineTotal: The total amount for this line item, calculated as OrderQty * (UnitPrice - UnitPriceDiscount).
              - rowguid: A globally unique identifier for the row.
              - ModifiedDate: The date and time when the row was last updated. The values are from January to June 2023, accurate to the day.
              
            ## Constrains
              - Ensure that the code is free of syntax errors.
              - Generate based on user input, do not ask other information.
            `,
          role: "system",
        },
        {
          content: "Show top 20 product sales.",
          role: "user",
        },
        {
          content: `{
              "sql": "SELECT Top 20 ProductID, sum(OrderQty) as SaleCount FROM [SalesLT].[SalesOrderDetail] GROUP BY ProductId",
              "x": "ProductID",
              "y": "SaleCount"
            }`,
          role: "assistant",
        },
        {
          content: "Display the sales amount of the top 10 products.",
          role: "user",
        },
        {
          content: `{
              "sql": "SELECT Top 10 ProductID, sum(LineTotal) as SaleAmount FROM [SalesLT].[SalesOrderDetail] GROUP BY ProductID",
              "x": "ProductID",
              "y": "SaleAmount"
            }`,
          role: "assistant",
        },
        {
          content: "Statistics of the top 10 sales volume of each product in April.",
          role: "user",
        },
        {
          content: `{
              "sql": "SELECT ProductID, SUM(OrderQty) AS SalesQuantity FROM [SalesLT].[SalesOrderDetail] WHERE ModifiedDate BETWEEN \'2023-04-01\' AND \'2023-04-30\' GROUP BY ProductID",
              "x": "ProductID",
              "y": "SalesQuantity"
            }`,
          role: "assistant",
        },
        {
          content: body,
          role: "user",
        },
      ],
    };

    const authProvider = new ApiKeyProvider(
      "api-key",
      process.env.TEAMSFX_API_OAI_API_KEY,
      ApiKeyLocation.Header,
    );
    const apiClient: AxiosInstance = createApiClient(
      process.env.TEAMSFX_API_OAI_ENDPOINT,
      authProvider,
    );
    const resp = await apiClient.post(
      "/chat/completions?api-version=2023-07-01-preview",
      completionReq,
    );
    if (resp.status !== 200) {
      return {
        status: resp.status,
        body: resp.data,
      };
    }

    const response = resp.data.choices[0].message.content;
    return response;
  } catch (e) {
    console.error(e);
    return {
      status: 500,
      body: e,
    };
  }
}

async function queryDB(sqlStr: string) {
  const sqlConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };
  try {
    var poolConnection = await require("mssql").connect(sqlConfig);
    console.log("Reading rows from the Table...");
    var resultSet = await poolConnection.request().query(sqlStr);

    console.log(`${resultSet.recordset.length} rows returned.`);
    return extractResultSet(resultSet);
  } catch (err) {
    console.error(err);
  } finally {
    // release resources
    poolConnection.close();
  }
}

// write a function to extract sql query result set to json array in which each element is a json object, each object is a row in the result set, each property is a column in the result set
function extractResultSet(resultSet: any): any[] {
  const result: any[] = [];
  resultSet.recordset.forEach((row) => {
    result.push(row);
  });
  return result;
}
