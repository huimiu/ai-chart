import { callFunction } from "./callFunction";

export async function queryDB(q?: string): Promise<any[]> {
  try {
    const respData = await callFunction("GET", "callGraph", { graphType: "queryDB" });
    return JSON.parse(respData["queryResult"]);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
