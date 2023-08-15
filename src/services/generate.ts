import { callFunction } from "./callFunction";

export async function generate(q: string): Promise<any[]> {
  await new Promise((f) => setTimeout(f, 2000));
  try {
    const respData = await callFunction(
      "POST",
      "callGraph",
      { graphType: "generate" },
      { question: q }
    );
    return JSON.parse(respData["generated"]);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
