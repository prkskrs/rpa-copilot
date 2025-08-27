export const POLICY = {
  allowDomains: (process.env.ALLOWLIST ?? '').split(',').filter(Boolean),
  blockPatterns: [/delete|permanently remove/i, /transfer .* funds/i],
  requireConfirm: [/submit|purchase|pay|approve|delete/i],
  maxSteps: Number(process.env.STEP_LIMIT ?? 40),
};

export function needsHumanApproval(text: string) {
  return POLICY.requireConfirm.some((r) => r.test(text));
}
