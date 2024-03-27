import { beforeAll, afterAll, afterEach } from 'vitest';
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
    )
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
