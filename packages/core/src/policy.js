"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POLICY = void 0;
exports.needsHumanApproval = needsHumanApproval;
exports.POLICY = {
    allowDomains: (process.env.ALLOWLIST ?? "").split(",").filter(Boolean),
    blockPatterns: [/delete|permanently remove/i, /transfer .* funds/i],
    requireConfirm: [/submit|purchase|pay|approve|delete/i],
    maxSteps: Number(process.env.STEP_LIMIT ?? 40),
};
function needsHumanApproval(text) {
    return exports.POLICY.requireConfirm.some((r) => r.test(text));
}
//# sourceMappingURL=policy.js.map