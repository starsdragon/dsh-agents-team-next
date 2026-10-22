/**
 * dsh-agents-team-next — Host plugin.
 *
 * Seams, no private-config surgery:
 * - `systemPrompt` section (late order, static text): dispatch-count planning,
 *   wrap-up priority over todo reminders, per-task effort rubric, and
 *   task-text compression scoped strictly to what is dispatched;
 * - teammate sessions shadow the section with an empty scoped section — they
 *   cannot delegate, so the Lead-oriented policy is noise there;
 * - `tools/execute` waterfall: fill `defaultEffort` only when the tool schema
 *   declares `reasoning_effort` and the call omitted it (explicit wins).
 */
import z from '@deepseek-ai/schemastery';
import { buildPolicyText, fillEffortDefault, normalizeEffort } from './policy.mjs';

export const name = 'dsh-agents-team-next';

export const inject = ['tools', 'systemPrompt'];

export const Config = z.object({
  enabled: z.boolean().default(true),
  defaultEffort: z.string().default('low'),
});

/**
 * Section order, late in the prompt (between WEB_SURFACE 10100 and
 * DEPLOYMENT_PERSONA_SUFFIX 10200). Prompt caching is prefix-based: a future
 * text edit at a late position only re-colds the small prompt tail, while the
 * v0.3 position (TEAM_POLICY+1 = 601, near the front) would have invalidated
 * the entire cached system-prompt prefix again on every future edit.
 */
const SECTION_ORDER = 10150;

export function apply(ctx, config = {}) {
  const parsed = Config(config);
  const warn = (message) => {
    try { ctx.logger?.warn?.(message); } catch { /* logging is best-effort */ }
  };
  const fallback = normalizeEffort(parsed.defaultEffort, 'low', warn);
  if (!parsed.enabled) return;

  try {
    ctx.systemPrompt.section({
      name: 'agents-team-next:policy',
      order: SECTION_ORDER,
      interpolate: false,
      text: buildPolicyText(),
    });
  } catch (error) {
    warn(`agents-team-next: policy section registration failed: ${error?.message ?? error}`);
  }

  // Teammates cannot spawn or delegate, so the Lead-oriented policy is noise
  // and over-generalization risk in their sessions. Shadow the global section
  // with an empty scoped section on each teammate's own agent context: scoped
  // sections shadow globals by name, and empty sections render nothing. The
  // lead and non-member agents keep the global section untouched.
  ctx.on('agent/created', ({ agent } = {}) => {
    try {
      if (agent === null || typeof agent !== 'object' || agent.ctx === undefined) return;
      const membership = ctx.agentTeams?.tryMembership?.(agent);
      if (membership === undefined || membership === null) return;
      if (membership.role === 'lead') return;
      agent.ctx.systemPrompt.section({
        name: 'agents-team-next:policy',
        order: SECTION_ORDER,
        interpolate: false,
        text: '',
      });
    } catch {
      // never break agent creation; the worst case is the teammate keeping the global section
    }
  });

  ctx.on('tools/execute', (exec, next) => {
    if (exec === null || typeof exec !== 'object' || exec.name !== 'subagent') return next();
    if (exec.arguments === null || typeof exec.arguments !== 'object' || Array.isArray(exec.arguments)) return next();
    if (exec.arguments.reasoning_effort !== undefined) return next();
    let tool;
    try {
      tool = ctx.tools.get(exec.name, exec.agent) ?? ctx.tools.get(exec.name);
    } catch {
      return next(); // registry hiccup must never block the dispatch
    }
    const filled = fillEffortDefault(tool, exec.arguments, fallback);
    if (filled === null) return next();
    exec.arguments = filled;
    try { ctx.logger?.debug?.(`agents-team-next: filled omitted reasoning_effort=${fallback}`); } catch { /* best-effort */ }
    return next();
  });
}
