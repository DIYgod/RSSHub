import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

const renderContent = (content) => renderToString(<ZhubaiContent content={content} />);

export const route: Route = {
    path: '/top20',
    categories: ['blog'],
    example: '/zhubai/top20',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['analy.zhubai.love/'],
        },
    ],
    name: '上周热门 TOP 20',
    maintainers: ['nczitzk'],
    handler,
    url: 'analy.zhubai.love/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'http://analy.zhubai.wiki';
    const apiRootUrl = 'https://open.zhubai.wiki';
    const apiUrl = new URL('a/zb/s/ht/pl/wk', apiRootUrl).href;

    const { data: response } = await got.post(apiUrl);

    let items = response.data.slice(0, limit).map((item) => ({
        title: item.pn,
        link: item.pu ?? item.pq ?? item.fp,
        description: item.pa,
        author: item.zn,
        pubDate: parseRelativeDate(item.lu.replace(/\.\d+/, '')),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const matches = item.link.match(/\/(?:pl|pq|fp)\/([\w-]+)\/(\d+)/);

                const { data } = await got(`https://${matches[1]}.zhubai.love/api/posts/${matches[2]}`);

                item.title = data.title ?? item.title;
                item.description = data.content ? renderContent(JSON.parse(data.content)) : item.description;
                item.author = data.author?.name ?? item.author;
                item.pubDate = data.created_at ? parseDate(data.created_at) : item.pubDate;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(rootUrl);

    const $ = load(currentResponse);

    const icon = $('link[rel="apple-touch-icon"]').prop('href');

    return {
        item: items,
        title: `${$('meta[property="og:title"]').prop('content')} - TOP20`,
        link: rootUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:description"]').prop('content'),
        author: $('meta[name="twitter:site"]').prop('content'),
    };
}

const ZhubaiContent = ({ content }: { content: any[] }) => <>{renderNodes(content)}</>;

const renderNodes = (content: any[]): Array<JSX.Element | string | null> =>
    content?.map((node) => {
        if (node.text) {
            return node.text;
        }
        switch (node.type) {
            case 'paragraph':
                return <p>{renderNodes(node.children)}</p>;
            case 'link':
                return <a href={node.url}>{renderNodes(node.children)}</a>;
            case 'image':
                return <img src={node.url} height={node.naturalHeight} width={node.naturalWidth} />;
            case 'list-item':
                return <li>{renderNodes(node.children)}</li>;
            case 'bulleted-list':
                return <ul>{renderNodes(node.children)}</ul>;
            case 'numbered-list':
                return <ol>{renderNodes(node.children)}</ol>;
            case 'block-quote':
                return <blockquote>{renderNodes(node.children)}</blockquote>;
            case 'heading-one':
                return <h1>{renderNodes(node.children)}</h1>;
            case 'heading-two':
                return <h2>{renderNodes(node.children)}</h2>;
            case 'heading-three':
                return <h3>{renderNodes(node.children)}</h3>;
            case 'heading-four':
                return <h4>{renderNodes(node.children)}</h4>;
            case 'heading-five':
                return <h5>{renderNodes(node.children)}</h5>;
            case 'heading-six':
                return <h6>{renderNodes(node.children)}</h6>;
            default:
                return null;
        }
    }) ?? [];
