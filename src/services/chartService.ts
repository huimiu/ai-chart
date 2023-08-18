import { callFunction } from "./callFunction";

export async function queryDB(): Promise<any> {
  try {
    const respData = await callFunction("GET", "callGraph", {
      apiType: "database",
    });
    return {
      data: respData["queryResult"],
      xKey: respData["xKey"],
      yKey: respData["yKey"],
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function aiCompletion(q?: string): Promise<any> {
  try {
    const respData = await callFunction(
      "POST",
      "callGraph",
      { apiType: "aiCompletion" },
      { question: q },
    );
    return {
      data: respData["queryResult"],
      xKey: respData["xKey"],
      yKey: respData["yKey"],
      sqlString: respData["sqlString"],
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
}
