const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

test('patched mailer composes the existing Japanese HTML mail fields without delivery', async () => {
  const mailer = require('nodemailer');
  const transport = mailer.createTransport({ jsonTransport: true, disableFileAccess: true, disableUrlAccess: true });
  const result = await transport.sendMail({ from: 'Site <sender@example.test>', to: 'recipient@example.test', replyTo: 'reply@example.test', subject: 'ご注文ありがとうございます', html: '<p>お申し込みの控えです。</p>' });
  const message = JSON.parse(result.message);
  assert.equal(message.subject, 'ご注文ありがとうございます');
  assert.equal(message.html, '<p>お申し込みの控えです。</p>');
  assert.equal(message.to[0].address, 'recipient@example.test');
  assert.equal(message.replyTo[0].address, 'reply@example.test');
  transport.close();
});

test('existing Gmail SMTP service configuration is accepted without connecting', () => {
  const transport = require('nodemailer').createTransport({ service: 'gmail', auth: { user: 'local@example.test', pass: 'test-only-not-a-credential' } });
  assert.equal(transport.transporter.options.host, 'smtp.gmail.com');
  assert.equal(transport.transporter.options.secure, true);
  transport.close();
});

test('cart resolves the patched UUID package and its v4 interface still works', () => {
  const cartRequire = createRequire(require.resolve('use-shopping-cart'));
  const uuid = cartRequire('uuid');
  const ids = Array.from({ length: 200 }, () => uuid.v4());
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => uuid.validate(id) && uuid.version(id) === 4));
});

test('updated Auth.js returns an empty anonymous session without contacting a provider', async () => {
  const { Auth } = await import('@auth/core');
  const Google = (await import('next-auth/providers/google')).default;
  const Line = (await import('next-auth/providers/line')).default;
  const previousFetch = global.fetch;
  global.fetch = async () => { throw Error('No external request is permitted in this test'); };
  try {
    const response = await Auth(new Request('http://localhost/api/auth/session'), {
      basePath: '/api/auth', trustHost: true, secret: 'local-test-only-not-a-production-secret',
      providers: [Google({ clientId: 'local-test', clientSecret: 'local-test' }), Line({ clientId: 'local-test', clientSecret: 'local-test' })],
    });
    assert.equal(response.status, 200);
    assert.equal(await response.json(), null);
  } finally { global.fetch = previousFetch; }
});

test('existing auth policy denies missing/error sessions and preserves Google and LINE providers', () => {
  const ts = require('typescript');
  const source = fs.readFileSync(path.join(__dirname, '../src/auth.config.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, process: { env: {} }, require: name => require(name) });
  const config = mod.exports.authConfig;
  assert.deepEqual(Array.from(config.providers, p => p.id), ['google', 'line']);
  const request = { nextUrl: new URL('https://example.test/mypage') };
  assert.equal(config.callbacks.authorized({ auth: null, request }), false);
  assert.equal(config.callbacks.authorized({ auth: { error: 'Configuration' }, request }), false);
  assert.equal(config.callbacks.authorized({ auth: { user: { email: 'local@example.test' } }, request }), true);
});
