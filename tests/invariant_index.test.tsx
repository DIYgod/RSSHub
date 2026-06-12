import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import * as http from 'http';

describe('Security: XSS prevention in freecomputerbooks route handler', () => {
  let mockServer: http.Server;
  const port = 9876;
  const baseUrl = `http://localhost:${port}`;

  beforeAll((done) => {
    mockServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/rss+xml' });
      if (req.url === '/xss-payload') {
        res.end(`<?xml version="1.0"?>
<rss><channel><item>
<title>Test</title>
<link>${baseUrl}/article</link>
<description>&lt;script&gt;alert('xss')&lt;/script&gt;&lt;img src=x onerror="alert('xss')"&gt;</description>
</item></channel></rss>`);
      } else if (req.url === '/valid') {
        res.end(`<?xml version="1.0"?>
<rss><channel><item>
<title>Safe Article</title>
<link>${baseUrl}/article</link>
<description>This is safe content with &lt;b&gt;bold&lt;/b&gt; text.</description>
</item></channel></rss>`);
      } else if (req.url === '/article') {
        res.end('<html><body>Article content</body></html>');
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    mockServer.listen(port, done);
  });

  afterAll((done) => {
    mockServer.close(done);
  });

  const payloads = [
    { url: `${baseUrl}/xss-payload`, name: 'script injection' },
    { url: `${baseUrl}/xss-payload`, name: 'event handler injection' },
    { url: `${baseUrl}/valid`, name: 'valid safe content' },
  ];

  test.each(payloads)('output must not contain executable script tags: $name', async ({ url }) => {
    // Dynamically import to ensure we test the actual production code
    const { default: handler } = await import('../lib/routes/freecomputerbooks/index.tsx');
    
    // Mock ctx object for the route handler
    const mockCtx = {
      params: { url },
      cache: {
        tryGet: async (key: string, fn: () => Promise<any>) => fn(),
      },
    };

    const result = await handler(mockCtx);
    const output = JSON.stringify(result);

    // Security invariant: output must never contain unescaped script tags or event handlers
    expect(output).not.toMatch(/<script[^>]*>/i);
    expect(output).not.toMatch(/on\w+\s*=/i);
    expect(output).not.toMatch(/javascript:/i);
  });
});