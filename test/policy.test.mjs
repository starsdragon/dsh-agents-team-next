/** Pure policy-layer tests — no Cordis, no schemastery; runs anywhere. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EFFORT_LEVELS,
  normalizeEffort,
  acceptsEffortParameter,
  fillEffortDefault,
  buildPolicyText,
} from '../src/policy.mjs';

test('effort ladder is ordered and stable', () => {
  assert.deepEqual(EFFORT_LEVELS, ['low', 'medium', 'high', 'xhigh', 'max']);
});

test('normalizeEffort defaults to low and folds known levels', () => {
  assert.equal(normalizeEffort(undefined), 'low');
  assert.equal(normalizeEffort(null), 'low');
  assert.equal(normalizeEffort('MAX'), 'max');
  assert.equal(normalizeEffort(' High '), 'high');
});

test('normalizeEffort falls back with a warning on unknown values', () => {
  const warnings = [];
  assert.equal(normalizeEffort('turbo', 'low', (m) => warnings.push(m)), 'low');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /turbo/);
  assert.match(warnings[0], /low/);
});

test('acceptsEffortParameter handles both parameter shapes in the wild', () => {
  // flat map (tool-subagent / tool-agent-team defineTool style)
  assert.equal(acceptsEffortParameter({ parameters: { prompt: {}, reasoning_effort: { type: 'string' } } }), true);
  // JSON-Schema style
  assert.equal(acceptsEffortParameter({ parameters: { properties: { reasoning_effort: { type: 'string' } } } }), true);
  // effort-less schemas
  assert.equal(acceptsEffortParameter({ parameters: { prompt: {}, description: {} } }), false);
  assert.equal(acceptsEffortParameter({ parameters: { properties: { prompt: {} } } }), false);
  // degenerate tool definitions
  assert.equal(acceptsEffortParameter(null), false);
  assert.equal(acceptsEffortParameter(undefined), false);
  assert.equal(acceptsEffortParameter({}), false);
  assert.equal(acceptsEffortParameter({ parameters: ['array'] }), false);
});

test('fillEffortDefault fills only a genuinely omitted effort', () => {
  const tool = { parameters: { prompt: {}, reasoning_effort: {} } };
  assert.deepEqual(
    fillEffortDefault(tool, { prompt: 'go' }, 'low'),
    { prompt: 'go', reasoning_effort: 'low' },
  );
  // explicit values — including intentionally invalid ones — are the tool's business
  assert.equal(fillEffortDefault(tool, { prompt: 'x', reasoning_effort: 'max' }, 'low'), null);
  assert.equal(fillEffortDefault(tool, { prompt: 'x', reasoning_effort: '' }, 'low'), null);
  // non-object arguments
  assert.equal(fillEffortDefault(tool, null, 'low'), null);
  assert.equal(fillEffortDefault(tool, ['array'], 'low'), null);
  assert.equal(fillEffortDefault(tool, 'string', 'low'), null);
  // effort-less schema
  assert.equal(fillEffortDefault({ parameters: { prompt: {} } }, { prompt: 'x' }, 'low'), null);
});

test('buildPolicyText carries the four required sections with scoped wording', () => {
  const text = buildPolicyText();
  for (const heading of ['派出规划', '完成与收尾纪律', '档位选择', '任务上下文压缩']) {
    assert.ok(text.includes(heading), `missing section: ${heading}`);
  }
  // dispatch-count planning (before and during work) + no empty waiters
  assert.ok(text.includes('开始前'));
  assert.ok(text.includes('工作中'));
  assert.ok(text.includes('只会等待'));
  // cache-aware dispatch: fresh members start cold, fork reuses the cached prefix
  assert.ok(text.includes('缓存前缀从零开始'));
  assert.ok(text.includes('context: fork'));
  // long/flaky operations can be owned end-to-end by a delegated agent
  assert.ok(text.includes('可整体交给一个子代理'));
  // ledger closing discipline: check / remove / pause_turn before ending a turn
  assert.ok(text.includes('op:check'));
  assert.ok(text.includes('op:remove'));
  assert.ok(text.includes('op:pause_turn'));
  assert.ok(text.includes('不留悬空条目'));
  // done means done: user wrap-up outranks reminder loops, changes need evidence
  assert.ok(text.includes('优先于清单提醒'));
  assert.ok(text.includes('不需要了'));
  assert.ok(text.includes('可验证的缺陷证据'));
  // bounded verification: no synchronous hanging, bounded retries
  assert.ok(text.includes('≤2 分钟'));
  assert.ok(text.includes('连续失败 2 次'));
  // compression strictly scoped to dispatched task text
  assert.ok(text.includes('仅指派发给子代理的任务文本'));
  assert.ok(text.includes('不适用于你自己的推理与结论'));
  assert.ok(text.includes('不得为省字数删除'));
  assert.ok(text.includes('避坑'));
});

test('buildPolicyText never mentions a fallback effort (v0.3.1 lesson)', () => {
  // v0.3 told the model "omitted calls fall back to low" — which invited
  // omission, and omitted calls got filled low, truncating reasoning.
  const text = buildPolicyText();
  assert.ok(!text.includes('兜底'), 'policy text must not advertise a fallback effort');
});
