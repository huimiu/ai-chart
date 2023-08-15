import { callFunction } from "./callFunction";

export async function generate(q: string): Promise<any[]> {
  try {
    const respData = await callFunction(
      "POST",
      "callGraph",
      { graphType: "generate" },
      { question: q },
    );
    return JSON.parse(respData["generated"]);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
