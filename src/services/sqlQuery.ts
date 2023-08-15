import { callFunction } from "./callFunction";

export async function queryDB(q?: string): Promise<any> {
  try {
    const respData = await callFunction(
      "POST",
      "callGraph",
      { graphType: "queryDB" },
      { question: q },
    );
    return { data: respData["queryResult"], x: respData["x"], y: respData["y"] };
  } catch (e) {
    console.log(e);
    throw e;
  }
}
