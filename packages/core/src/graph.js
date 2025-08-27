"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGraph = buildGraph;
const langgraph_1 = require("@langchain/langgraph");
const langgraph_checkpoint_sqlite_1 = require("@langchain/langgraph-checkpoint-sqlite");
const openai_1 = require("./providers/openai");
const reducerPush = (arr, v) => [...arr, ...v];
function buildGraph(executor) {
    const g = new langgraph_1.StateGraph({
        channels: {
            goal: { default: "" },
            steps: { default: 0 },
            lastScreenshot: { default: undefined },
            transcript: { default: [], reducer: reducerPush },
            status: { default: "running" },
        }
    });
    const provider = new openai_1.OpenAIComputerUse();
    g.addNode("plan_or_act", async (s) => {
        const actions = await provider.step(s.goal, s.lastScreenshot);
        if (!actions?.length)
            return { status: "done", transcript: ["Model ended."] };
        if (s.steps > Number(process.env.STEP_LIMIT ?? 40))
            return { status: "error", transcript: ["Step limit reached"] };
        const result = await executor.run(actions[0]);
        return {
            steps: s.steps + 1,
            lastScreenshot: result.imageBase64 ?? s.lastScreenshot,
            transcript: [`did ${actions[0].type}`]
        };
    });
    g.addEdge(langgraph_1.START, "plan_or_act");
    g.addConditionalEdges("plan_or_act", (s) => s.status === "running" ? "plan_or_act" : langgraph_1.END);
    const saver = new langgraph_checkpoint_sqlite_1.SqliteSaver({ path: "rpa-checkpoints.sqlite" });
    return g.compile({ checkpointer: saver });
}
//# sourceMappingURL=graph.js.map