import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { countReplies, viewThread } from './query';
import { renderContent } from './templates/content';

export const route: Route = {
    path: '/thread/:id',
    radar: [
        {
            source: ['lkong.com/thread/:id', 'lkong.com/'],
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk', 'ma6254'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.lkong.com';
    const apiUrl = 'https://api.lkong.com/api';
    const currentUrl = `${rootUrl}/thread/${id}`;

    const countResponse = await got({
        method: 'post',
        url: apiUrl,
        json: countReplies(id),
    });

    if (countResponse.data.errors) {
        throw new Error(countResponse.data.errors[0].message);
    }

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: viewThread(id, Math.ceil(countResponse.data.data.thread.replies / 20)),
    });

    const items = response.data.data.posts.map((item) => ({
        guid: item.pid,
        author: item.user.name,
        title: `#${item.lou} ${item.user.name}`,
        link: `${rootUrl}/thread/${id}?pid=${item.pid}`,
        pubDate: parseDate(item.dateline),
        description:
            (item.quote ? renderToString(<LkongQuote target={`${rootUrl}/thread/${id}?pid=${item.quote.pid}`} author={item.quote.author.name} content={renderContent(JSON.parse(item.quote.content))} />) : '') +
            renderContent(JSON.parse(item.content)),
    }));

    return {
        title: `${response.data.data.thread.title} - 龙空`,
        link: currentUrl,
        item: items,
    };
}

const quoteStyles = `
.quote {
    margin: 15px 0px 15px;
    width: 100%;
    border: 1px solid #eee;
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 8px 14px;
    cursor: pointer;
}

.quote-link {
    color: #1890ff;
    text-decoration: none;
}
`;

const LkongQuote = ({ target, author, content }: { target: string; author: string; content: string }) => (
    <>
        <div class="quote">
            <a href={target} class="quote-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="13.16" height="12" viewBox="0 0 13.16 12" class="css-1f5j0lz">
                    <path d="M5.71,0,0,5l5.71,5V6.57S13.63,4,12,12c0,0,5.11-9.71-6.42-9L5.71,0Z"></path>
                </svg>
                {author}
            </a>
            :{raw(content)}
        </div>
        <style>{quoteStyles}</style>
    </>
);
