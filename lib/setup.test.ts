import { afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
    http.post(`https://api.openai.com/v1/chat/completions`, () =>
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
    )
);
server.listen();

afterAll(() => server.close());
afterEach(() => server.resetHandlers());
