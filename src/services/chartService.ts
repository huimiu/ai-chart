import { callFunction } from "./callFunction";

export async function queryDB(): Promise<any> {
  try {
    const respData = await callFunction("GET", "callGraph", {
      graphType: "queryDB",
    });
    return {
      data: respData["queryResult"],
      xKey: respData["x"],
      yKey: respData["y"],
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function aiPower(q?: string): Promise<any> {
  try {
    const respData = await callFunction(
      "POST",
      "callGraph",
      { graphType: "aiPower" },
      { question: q }
    );
    return {
      data: respData["queryResult"],
      xKey: respData["x"],
      yKey: respData["y"],
      sqlString: respData["sqlString"],
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
}
