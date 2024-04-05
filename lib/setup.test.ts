import { afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
    http.post(`https://api.openai.mock/v1/chat/completions`, () =>
        HttpResponse.json({
            choices: [
                {
                    message: {
                        content: 'Summary of the article.',
                    },
                },
            ],
        })
    ),
    http.get(`http://rsshub.test/config`, () =>
        HttpResponse.json({
            UA: 'test',
        })
    ),
    http.get(`http://rsshub.test/buildData`, () =>
        HttpResponse.text(`<div class="content">
            <ul>
                <li>
                    <a href="/1">1</a>
                    <div class="description">RSSHub1</div>
                </li>
                <li>
                    <a href="/2">2</a>
                    <div class="description">RSSHub2</div>
                </li>
            </ul>
        </div>`)
    ),
    http.get(`https://mp.weixin.qq.com/rsshub_test/wechatMp_fetchArticle`, () =>
        HttpResponse.text(
            '\n' +
                '<meta name="description" content="summary" />\n' +
                '<meta name="author" content="author" />\n' +
                '<meta property="og:title" content="title" />\n' +
                '<meta property="twitter:card" content="summary" />\n' +
                '<div class="rich_media_content" id="js_content" style="visibility: hidden;">description</div>\n' +
                '<div class="profile_inner"><strong class="profile_nickname">mpName</strong></div>\n' +
                '<script type="text/javascript" nonce="000000000">\n' +
                'var appmsg_type = "9";\n' +
                `var ct = "${1_636_626_300}";\n` +
                '</script>'
        )
    ),
    http.get(`http://rsshub.test/headers`, ({ request }) =>
        HttpResponse.json({
            ...Object.fromEntries(request.headers.entries()),
        })
    ),
    http.post(`http://rsshub.test/form-post`, async ({ request }) => {
        const formData = await request.formData();
        return HttpResponse.json({
            test: formData.get('test'),
        });
    }),
    http.post(`http://rsshub.test/json-post`, async ({ request }) => {
        const jsonData = (await request.json()) as {
            test: string;
        };
        return HttpResponse.json({
            test: jsonData?.test,
        });
    }),
    http.get(`http://rsshub.test/rss`, () => HttpResponse.text('<rss version="2.0"><channel><item></item></channel></rss>'))
);
server.listen();

afterAll(() => server.close());
afterEach(() => server.resetHandlers());

export default server;
