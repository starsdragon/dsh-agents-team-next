/**
 * Host-plugin integration tests. Importing src/index.mjs needs
 * '@deepseek-ai/schemastery' resolvable — run from the installed copy:
 *   cd ~/.dsh/profiles/web/node_modules/dsh-agents-team-next && node --test test/policy.test.mjs test/index.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Config, apply, inject, name } from '../src/index.mjs';

function makeEnv() {
  const sections = [];
  const listeners = new Map();
  const tools = new Map();
  const memberships = new Map();
  const logger = {
    warnings: [],
    debugs: [],
    warn(message) { this.warnings.push(message); },
    debug(message) { this.debugs.push(message); },
  };
  const ctx = {
    logger,
    systemPrompt: {
      getSectionOrder: () => 2800,
      section(sect) { sections.push(sect); return () => {}; },
    },
    tools: {
      get(toolName, scope) {
        if (scope !== undefined) {
          const scoped = tools.get(`${toolName}@${scope}`);
          if (scoped !== undefined) return scoped;
        }
        return tools.get(toolName);
      },
    },
    agentTeams: {
      tryMembership(agent) { return memberships.get(agent); },
    },
    on(event, listener) { listeners.set(event, listener); return () => listeners.delete(event); },
  };
  return { ctx, sections, listeners, tools, memberships, logger };
}

function fakeAgent(role) {
  const shadowSections = [];
  return {
    id: `agent-${role ?? 'plain'}`,
    ctx: {
      systemPrompt: {
        section(sect) { shadowSections.push(sect); return () => {}; },
      },
    },
    shadowSections,
  };
}

test('module surface and Config defaults', () => {
  assert.equal(name, 'dsh-agents-team-next');
  assert.deepEqual(inject, ['tools', 'systemPrompt']);
  const parsed = Config({});
  assert.equal(parsed.enabled, true);
  assert.equal(parsed.defaultEffort, 'low');
  assert.deepEqual(Config({ enabled: false, defaultEffort: 'medium' }), { enabled: false, defaultEffort: 'medium' });
});

test('apply registers the policy section at the late cache-friendly order', () => {
  const env = makeEnv();
  apply(env.ctx, {});
  assert.equal(env.sections.length, 1);
  const section = env.sections[0];
  assert.equal(section.name, 'agents-team-next:policy');
  // late order (between WEB_SURFACE 10100 and PERSONA_SUFFIX 10200): future
  // text edits re-cold only the prompt tail, never the whole prefix
  assert.equal(section.order, 10150);
  assert.equal(section.interpolate, false);
  assert.ok(section.text.includes('完成与收尾纪律'));
  assert.ok(!section.text.includes('兜底'));
  assert.ok(env.listeners.has('tools/execute'));
  assert.ok(env.listeners.has('agent/created'));
});

test('enabled: false registers neither section nor listeners', () => {
  const env = makeEnv();
  apply(env.ctx, { enabled: false });
  assert.equal(env.sections.length, 0);
  assert.equal(env.listeners.size, 0);
});

test('agent/created shadows the section empty for teammates only', () => {
  const env = makeEnv();
  apply(env.ctx, {});
  const onCreated = env.listeners.get('agent/created');

  const teammate = fakeAgent('teammate');
  env.memberships.set(teammate, { role: 'teammate' });
  onCreated({ agent: teammate });
  assert.equal(teammate.shadowSections.length, 1);
  assert.equal(teammate.shadowSections[0].name, 'agents-team-next:policy');
  assert.equal(teammate.shadowSections[0].order, 10150);
  assert.equal(teammate.shadowSections[0].text, '', 'shadow must render nothing');

  const lead = fakeAgent('lead');
  env.memberships.set(lead, { role: 'lead' });
  onCreated({ agent: lead });
  assert.equal(lead.shadowSections.length, 0, 'lead keeps the global section');

  const plain = fakeAgent();
  onCreated({ agent: plain });
  assert.equal(plain.shadowSections.length, 0, 'non-member agents keep the global section');

  const noCtx = { id: 'weird' };
  onCreated({ agent: noCtx });
  onCreated({});
  onCreated({ agent: null });
});

test('agent/created survives membership lookup failures', () => {
  const env = makeEnv();
  apply(env.ctx, {});
  const onCreated = env.listeners.get('agent/created');
  // throwing service access must never break agent creation
  env.ctx.agentTeams = null;
  assert.doesNotThrow(() => onCreated({ agent: fakeAgent('teammate') }));
  env.ctx.agentTeams = {
    tryMembership() { throw new Error('boom'); },
  };
  const teammate = fakeAgent('teammate');
  assert.doesNotThrow(() => onCreated({ agent: teammate }));
  assert.equal(teammate.shadowSections.length, 0);
});

test('tools/execute fills an omitted effort on schema-bearing subagent calls', () => {
  const env = makeEnv();
  apply(env.ctx, {});
  const handler = env.listeners.get('tools/execute');
  env.tools.set('subagent', { parameters: { prompt: {}, reasoning_effort: { type: 'string' } } });

  const exec = { name: 'subagent', arguments: { prompt: 'go' }, agent: 'agent-1' };
  const token = {};
  assert.equal(handler(exec, () => token), token, 'next() result propagates');
  assert.deepEqual(exec.arguments, { prompt: 'go', reasoning_effort: 'low' });
  assert.ok(env.logger.debugs.some((m) => /reasoning_effort=low/.test(m)));
});

test('tools/execute also handles the nested parameters.properties shape', () => {
  const env = makeEnv();
  apply(env.ctx, {});
  const handler = env.listeners.get('tools/execute');
  env.tools.set('subagent', { parameters: { properties: { prompt: {}, reasoning_effort: {} } } });
  const exec = { name: 'subagent', arguments: { prompt: 'go' } };
  handler(exec, () => {});
  assert.deepEqual(exec.arguments, { prompt: 'go', reasoning_effort: 'low' });
});

test('explicit effort is never overridden', () => {
  const env = makeEnv();
  apply(env.ctx, {});
  const handler = env.listeners.get('tools/execute');
  env.tools.set('subagent', { parameters: { reasoning_effort: {} } });
  const exec = { name: 'subagent', arguments: { reasoning_effort: 'max' } };
  handler(exec, () => {});
  assert.deepEqual(exec.arguments, { reasoning_effort: 'max' });
});

test('tools.get failures and effort-less schemas pass through untouched', () => {
  const env = makeEnv();
  apply(env.ctx, {});
  const handler = env.listeners.get('tools/execute');

  // registry throws → dispatch must survive
  const throwing = makeEnv();
  apply(throwing.ctx, {});
  throwing.ctx.tools.get = () => { throw new Error('registry boom'); };
  const throwHandler = throwing.listeners.get('tools/execute');
  const execA = { name: 'subagent', arguments: { prompt: 'a' } };
  throwHandler(execA, () => {});
  assert.deepEqual(execA.arguments, { prompt: 'a' });

  // schema without reasoning_effort (e.g. spawn_teammate) → untouched
  env.tools.set('subagent', { parameters: { prompt: {} } });
  const execB = { name: 'subagent', arguments: { prompt: 'b' } };
  handler(execB, () => {});
  assert.deepEqual(execB.arguments, { prompt: 'b' });

  // non-subagent tool names → untouched
  const execC = { name: 'spawn_teammate', arguments: { name: 'x' } };
  handler(execC, () => {});
  assert.deepEqual(execC.arguments, { name: 'x' });

  // degenerate exec / arguments → untouched
  const execD = { name: 'subagent', arguments: null };
  handler(execD, () => {});
  assert.equal(execD.arguments, null);
  handler(null, () => {});
});

test('custom defaultEffort is used and unknown values normalize to low with a warning', () => {
  const medium = makeEnv();
  apply(medium.ctx, { defaultEffort: 'medium' });
  const mediumHandler = medium.listeners.get('tools/execute');
  medium.tools.set('subagent', { parameters: { reasoning_effort: {} } });
  const execM = { name: 'subagent', arguments: {} };
  mediumHandler(execM, () => {});
  assert.deepEqual(execM.arguments, { reasoning_effort: 'medium' });

  const turbo = makeEnv();
  apply(turbo.ctx, { defaultEffort: 'turbo' });
  assert.ok(turbo.logger.warnings.some((m) => /turbo/.test(m)), 'unknown effort warns');
  const turboHandler = turbo.listeners.get('tools/execute');
  turbo.tools.set('subagent', { parameters: { reasoning_effort: {} } });
  const execT = { name: 'subagent', arguments: {} };
  turboHandler(execT, () => {});
  assert.deepEqual(execT.arguments, { reasoning_effort: 'low' });
});
