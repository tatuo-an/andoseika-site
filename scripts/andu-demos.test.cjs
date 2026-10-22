/* Component handler and model tests. No browser, network, credentials or installed test runner. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const root = path.resolve(__dirname, '..');

function harness(file, name, props = {}) {
  let cursor = 0;
  const state = [], cache = new Map();
  const fakeReact = { ...React, useState(initial) { const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; } };
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    const localRequire = specifier => {
      if (specifier === 'react') return fakeReact;
      if (specifier.startsWith('.') || specifier.startsWith('@/')) {
        const candidate = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
        const resolved = [candidate, candidate + '.ts', candidate + '.tsx'].find(name => fs.existsSync(name) && fs.statSync(name).isFile());
        if (resolved) return load(resolved);
      }
      return require(specifier);
    };
    vm.runInNewContext('(function(require,module,exports){' + output + '\n})', { console })(localRequire, module, module.exports);
    return module.exports;
  }
  const exports = load(path.join(root, file));
  let tree;
  const expand = node => {
    if (Array.isArray(node)) return node.flatMap(expand);
    if (!node || typeof node !== 'object') return node === false || node == null ? [] : [node];
    if (typeof node.type === 'function' && ['DemoFrame','Feedback','DemoError'].includes(node.type.name)) return expand(node.type(node.props));
    return [node, ...expand(node.props?.children)];
  };
  const render = () => { cursor = 0; tree = exports[name](props); return expand(tree); };
  let nodes = render();
  const get = predicate => { const found = nodes.find(node => node && typeof node === 'object' && predicate(node)); assert.ok(found, 'Element not found'); return found; };
  const text = () => nodes.filter(node => typeof node === 'string' || typeof node === 'number').join(' ');
  return {
    exports, cache, text,
    change(label, value, checked) { const node = get(node => node.props['aria-label'] === label || node.props.id === label); node.props.onChange({ target: { value, checked } }); nodes = render(); },
    button(label, index = 0) { const buttons = nodes.filter(node => node?.type === 'button' && expand(node.props.children).filter(value => typeof value === 'string' || typeof value === 'number').join('') === label); assert.ok(buttons[index], 'Button not found: ' + label); buttons[index].props.onClick(); nodes = render(); },
    event(predicate, key, event) { get(predicate).props[key](event); nodes = render(); },
    find: get,
  };
}
function model() {
  const source = fs.readFileSync(path.join(root, 'src/components/ai/demo-models.ts'), 'utf8');
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: module.exports, module });
  return module.exports;
}
const m = model();
test('numeric boundaries reject blank, negative, exponent, nonfinite and excess precision', () => {
  for (const raw of ['', ' ', '-1', 'Infinity', 'NaN', '0x10', '1e3', '1.001']) assert.equal(m.numberValue(raw, 10000), null, raw);
  assert.equal(m.numberValue('0', 10000), 0);
  assert.equal(m.numberValue('10000', 10000, true), 10000);
  assert.equal(m.numberValue('10001', 10000, true), null);
  assert.equal(m.numberValue('2.5', 10000, true), null);
});
test('payroll independently calculated totals, rounding and invalid suppression', () => {
  assert.equal(m.payrollTotals(m.PAYROLL_SAMPLE).amount, 120 * 1400 + 88.5 * 1300 + 64 * 1200);
  assert.equal(m.payrollTotals([{ name:'A', hours:'0.05', rate:'11' }]).amount, 1);
  assert.equal(m.payrollTotals([{ name:'A', hours:'', rate:'1400' }]), null);
});
test('delivery cannot return more than delivered; zero is valid', () => {
  assert.equal(m.deliveryResult({ delivered:'5', returned:'6' }), null);
  assert.equal(m.deliveryResult({ delivered:'0', returned:'0' }), 0);
  assert.equal(m.deliveryResult(m.DELIVERY_SAMPLE[0]), 21);
});
test('CSV validates shape, bounds, duplicate IDs, empty and maximum length', () => {
  assert.equal(m.parseOrders(m.ORDER_CSV).rows.length, 3);
  for (const csv of ['', 'bad', '注文ID,商品,数量,単価\nA,B,,100', '注文ID,商品,数量,単価\nA,B,1,100\nA,C,1,100', '注文ID,商品,数量,単価\nA,B,1.5,100', '注文ID,商品,数量,単価\nA,B,0,100', 'x'.repeat(4001)]) assert.ok(m.parseOrders(csv).error);
});
test('time fields reject impossible and overnight times, rest exceeding work', () => {
  assert.equal(m.workMinutes(m.TIME_SAMPLE[0]), 420);
  for (const row of [{start:'',end:'17:00',rest:'0'}, {start:'24:00',end:'25:00',rest:'0'}, {start:'17:00',end:'09:00',rest:'0'}, {start:'09:00',end:'10:00',rest:'61'}]) assert.equal(m.workMinutes(row), null);
  assert.equal(m.workMinutes({start:'09:00',end:'09:00',rest:'0'}), 0);
});

test('payroll handlers: initial, edit, invalid, zero and reset', () => {
  const h=harness('src/app/ai/demo/tool-demos.tsx','PayrollDemo',{embedded:true});
  assert.match(h.text(),/359,850円/);
  h.change('hours-0','160'); assert.match(h.text(),/415,850円/);
  h.change('hours-0',''); assert.match(h.text(),/入力を確認/); assert.doesNotMatch(h.text(),/415,850円/);
  h.change('hours-0','-1'); assert.ok(h.find(node=>node.props.role==='alert'));
  h.button('サンプルに戻す'); assert.match(h.text(),/359,850円/);
  [0,1,2].forEach(i=>h.change('hours-'+i,'0')); assert.match(h.text(),/0円/);
});
test('sales handlers: empty search, filters, status preserved on refresh, no duplicate, reset', () => {
  const h=harness('src/app/ai/demo/tool-demos.tsx','SalesDemo',{embedded:true});
  h.change('sales-query','存在しない'); assert.match(h.text(),/条件に合う営業先はありません/);
  h.button('絞り込みを解除する'); h.change('sales-industry','飲食'); assert.match(h.text(),/2 件を表示/);
  h.change('sales-industry','すべて'); h.change('サンプル商店Aの対応状況','相談中');
  h.button('情報更新を試す'); assert.match(h.text(),/6 件登録/); assert.equal(h.find(node=>node.props['aria-label']==='サンプル商店Aの対応状況').props.value,'相談中');
  h.button('更新の見本を反映済み'); assert.match(h.text(),/6 件登録/);
  h.button('サンプルに戻す'); assert.match(h.text(),/5 件登録/);
});
test('delivery handlers: update, invalid, reset', () => {
  const h=harness('src/components/ai/business-demos.tsx','DeliveryDemo');
  h.change('見本商品Aの回収数','5'); assert.match(h.text(),/19点/);
  h.change('見本商品Aの回収数','25'); assert.match(h.text(),/回収数は納品数以下/);
  h.button('サンプルに戻す'); assert.match(h.text(),/21点/);
});
test('online handlers: import, mark, reimport replaces, invalid preserves list, reset', () => {
  const h=harness('src/components/ai/business-demos.tsx','OnlineDemo');
  h.button('見本を取り込む'); assert.match(h.text(),/3件の見本/);
  h.event(node=>node.type==='input'&&node.props.type==='checkbox','onChange',{target:{checked:true}}); assert.match(h.text(),/1\s*\/\s*3 件/);
  h.button('見本を取り込む'); assert.match(h.text(),/0\s*\/\s*3 件/);
  h.change('注文の見本',''); h.button('見本を取り込む'); assert.ok(h.find(node=>node.props.role==='alert')); assert.match(h.text(),/見本001/);
  h.button('サンプルに戻す'); assert.doesNotMatch(h.text(),/発送準備済み/);
});
test('market handlers: amount, partition, invalid and reset', () => {
  const h=harness('src/components/ai/business-demos.tsx','MarketDemo');
  h.change('見本商品Aの数量','20'); assert.match(h.text(),/4,000円/);
  h.change('見本商品Aの区分','仕入れ'); assert.match(h.text(),/4,750円/);
  h.change('見本商品Aの数量',''); assert.ok(h.find(node=>node.props.role==='alert')); assert.doesNotMatch(h.text(),/4,750円/);
  h.button('サンプルに戻す'); assert.match(h.text(),/2,000円/);
});
test('booking: empty error, reserve fills one slot, cancel and reset', () => {
  const h=harness('src/components/ai/showcase-demos.tsx','BookingDemo');
  h.button('予約の見本を試す'); assert.ok(h.find(node=>node.props.role==='alert'));
  h.change('試す予約枠','見本日A · 10:00'); h.button('予約の見本を試す'); assert.match(h.text(),/満席/);
  h.button('この枠を空きに戻す'); assert.doesNotMatch(h.text(),/満席（見本）/);
  h.button('サンプルに戻す'); assert.match(h.text(),/0 枠/);
});
test('SNS: empty error, three previews and reset', () => {
  const h=harness('src/components/ai/showcase-demos.tsx','SnsDemo');
  h.change('投稿文の見本',' '); h.button('投稿の見た目を確認する'); assert.ok(h.find(node=>node.props.role==='alert'));
  h.change('投稿文の見本','見本の投稿'); h.button('投稿の見た目を確認する'); assert.match(h.text(),/Facebook/); assert.match(h.text(),/Instagram/); assert.match(h.text(),/Threads/);
  h.button('サンプルに戻す'); assert.doesNotMatch(h.text(),/投稿見本/);
});
test('car: search, empty result, clear, inquiry preview, reset', () => {
  const h=harness('src/components/ai/showcase-demos.tsx','CarDemo');
  h.change('見本の車名','不存在'); assert.match(h.text(),/条件の見本車はありません/);
  h.button('絞り込みを解除する'); h.change('見本車の種類','コンパクト'); h.button('問い合わせの見本を見る'); assert.match(h.text(),/見本車Bについて相談/);
  h.button('サンプルに戻す'); assert.match(h.text(),/3台/);
});
test('timecard: sample load, edit, negative interval, blank and reset', () => {
  const h=harness('src/components/ai/showcase-demos.tsx','TimecardDemo');
  h.button('読み取り済みの見本を入れる'); assert.match(h.text(),/13 時間/);
  h.change('見本1日目の退勤','18:00'); assert.match(h.text(),/14 時間/);
  h.change('見本1日目の退勤','08:00'); assert.ok(h.find(node=>node.props.role==='alert'));
  h.change('見本1日目の出勤',''); assert.match(h.text(),/空欄/);
  h.button('サンプルに戻す'); assert.match(h.text(),/読み取り済みの見本を入れる/);
});
test('shop: quantity, cap, blank, negative, no checkout and reset', () => {
  const h=harness('src/components/ai/showcase-demos.tsx','ShopDemo');
  h.change('見本商品の数量','2'); h.button('カートの見本に入れる'); assert.match(h.text(),/2,000円/);
  h.change('見本商品の数量','9'); h.button('カートの見本に入れる'); assert.match(h.text(),/合計9点まで/);
  for(const raw of ['', '-1']) { h.change('見本商品の数量',raw); assert.ok(h.find(node=>node.props.role==='alert')); }
  h.button('サンプルに戻す'); assert.match(h.text(),/0円/);
});
test('castle: search, empty, visit, seal search, notice simulation, import and full reset', () => {
  const h=harness('src/components/ai/castle-demo.tsx','default');
  h.change('城の見本を検索','不存在'); assert.match(h.text(),/この条件の見本はありません/);
  h.button('絞り込みを解除する'); h.button('訪問済みにする'); assert.match(h.text(),/訪問済み 2 城/);
  h.button('御城印を探す'); h.change('城の見本を検索','限定'); assert.match(h.text(),/2 件表示/);
  h.button('お知らせ・通知'); h.button('通知の表示例を見る'); assert.match(h.text(),/端末の通知設定は変更していません/);
  h.button('取込みの見本'); h.button('同梱の取込み見本を試す'); assert.match(h.text(),/sample-castle-b.jpg/);
  h.button('サンプルに戻す'); assert.match(h.text(),/訪問済み 1 城/); assert.doesNotMatch(h.text(),/sample-castle-b.jpg/);
});

test('inline shells start closed, have no demo import until open, close clears content', () => {
  const h=harness('src/components/ai/InlineDemo.tsx','InlineDemo',{kind:'castle',label:'お城'});
  assert.doesNotMatch(h.text(),/入力は保存/);
  assert.ok(![...h.cache.keys()].some(key=>key.endsWith('castle-demo.tsx')));
  h.event(node=>node.type==='details','onToggle',{currentTarget:{open:true}}); assert.match(h.text(),/閉じると元に戻ります/);
  h.event(node=>node.type==='details','onToggle',{currentTarget:{open:false}}); assert.doesNotMatch(h.text(),/入力は保存/);
});
test('source boundaries: all 7 works covered, 11 unique inline demos, no external transitions', () => {
  const source=fs.readFileSync(path.join(root,'src/app/ai/page.tsx'),'utf8');
  const demos=[...source.matchAll(/<InlineDemo kind="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(demos.length,11); assert.equal(new Set(demos).size,11);
  const workBlocks=[...source.matchAll(/<article className="work[^>]*>[^]*?<\/article>/g)].map(match=>match[0]);
  assert.equal(workBlocks.length,7);
  for(let i=1;i<=7;i++) { const number=String(i).padStart(2,'0'); const block=workBlocks.find(block=>block.includes('仕事の記録 / '+number)); assert.ok(block?.includes('<InlineDemo'),'work '+number); }
  assert.doesNotMatch(source,/href="\/ai\/demo/);
  assert.doesNotMatch(source, /id="services"|href="#services"|<h2>頼めること/);
  assert.doesNotMatch(source.split('<section className="works"')[0],/万円/);
});
test('sample demo modules have no backend, persistence, tracking or notification calls', () => {
  for(const name of ['business-demos.tsx','showcase-demos.tsx','castle-demo.tsx','demo-models.ts','InlineDemo.tsx']) {
    const source=fs.readFileSync(path.join(root,'src/components/ai',name),'utf8');
    assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|navigator\.|Notification\.|process\.env|https?:\/\//,name);
  }
});
test('media source consistency: standard adds 2 to light, full includes up to 10, LINE counts', () => {
  for(const file of ['src/app/ai/page.tsx','src/app/ai/sns/page.tsx']) {
    const source=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(source,/LINE配信も選んだ媒体数に含みます|LINE配信を選ぶ場合も1媒体に数え/);
    assert.match(source,/計5媒体/);
    assert.match(source,/最大10媒体/);
    assert.doesNotMatch(source,/計2媒体|計4媒体|計7媒体|好きな媒体を4つ/);
    assert.doesNotMatch(source,/label: "X"|label: "YouTube"|TARGET_SNS_ROWS/);
  }
});
test('existing payroll/sales reuse also has no persistence or service call', () => {
  const source=fs.readFileSync(path.join(root,'src/app/ai/demo/tool-demos.tsx'),'utf8');
  assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|navigator\.|Notification\.|process\.env/);
});
