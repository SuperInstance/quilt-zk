import { CIRCUITS, ZKCell } from '../src/index.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log('  ✓', name); pass++; }
  catch (e) { console.log('  ✗', name, ':', e.message); fail++; }
}
function eq(a, b) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`expected ${b}, got ${a}`); }

test('prove value >= threshold', () => {
  const p = CIRCUITS.VALUE_AT_LEAST.prove({ value: 75_000 }, { threshold: 50_000 });
  eq(p.holds, true);
  eq(p.verify(CIRCUITS.VALUE_AT_LEAST), true);
});

test('prove value < threshold fails', () => {
  const p = CIRCUITS.VALUE_AT_LEAST.prove({ value: 1_000 }, { threshold: 50_000 });
  eq(p.holds, false);
});

test('prove value <= threshold', () => {
  const p = CIRCUITS.VALUE_AT_MOST.prove({ value: 50 }, { threshold: 100 });
  eq(p.holds, true);
});

test('prove value in set', () => {
  const set = ['a', 'b', 'c'];
  let setHash = 0;
  const setStr = JSON.stringify([...set].sort());
  for (const c of setStr) setHash = (setHash * 31 + c.charCodeAt(0)) >>> 0;
  const p = CIRCUITS.VALUE_IN_SET.prove({ value: 'b', set }, { setHash });
  eq(p.holds, true);
});

test('prove sum equals total', () => {
  const p = CIRCUITS.SUM_EQUALS.prove({ values: [10, 20, 30] }, { total: 60 });
  eq(p.holds, true);
});

test('prove wrong sum fails', () => {
  const p = CIRCUITS.SUM_EQUALS.prove({ values: [10, 20, 30] }, { total: 100 });
  eq(p.holds, false);
});

test('ZKCell wraps a circuit', () => {
  const cell = new ZKCell('proof.bank', CIRCUITS.VALUE_AT_LEAST, { value: 100 }, { threshold: 50 });
  eq(cell.verify(), true);
  cell.refresh({ value: 10 }, { threshold: 50 });
  eq(cell.verify(), false);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
