import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { getData, getList } from './utils';

const _website = 'dlnews';
const topics = {
    defi: 'DeFi',
    fintech: 'Fintech/VC/Deals',
    'llama-u': 'Llama U',
    markets: 'Markets',
    'people-culture': 'People & Culture',
    regulation: 'Regulation',
    snapshot: 'Snapshot',
    web3: 'Web3',
};
const renderDescription = (blocks) =>
    renderToString(
        <>
            {blocks.map((block) => {
                switch (block.type) {
                    case 'custom_embed':
                        return (
                            <ul>
                                {block.data.split('\n').map((line) => (
                                    <li>{raw(line)}</li>
                                ))}
                            </ul>
                        );
                    case 'header':
                        return <h2>{raw(block.data)}</h2>;
                    case 'list':
                        return block.list_type === 'unordered' ? (
                            <ul>
                                {block.items.map((item) => (
                                    <li>{raw(item.content)}</li>
                                ))}
                            </ul>
                        ) : (
                            <ol>
                                {block.items.map((item) => (
                                    <li>{raw(item.content)}</li>
                                ))}
                            </ol>
                        );
                    case 'image':
                        return (
                            <figure>
                                <img src={block.src} alt={block.alt} />
                                <figcaption>{raw(block.caption)}</figcaption>
                            </figure>
                        );
                    case 'text':
                        return <p>{raw(block.data)}</p>;
                    default:
                        return null;
                }
            })}
        </>
    );
const extractArticle = (item) =>
    cache.tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = load(response);
        const scriptTagContent = $('script#fusion-metadata').text();
        const jsonData = JSON.parse(scriptTagContent.match(/Fusion\.globalContent=({.*?});Fusion\.globalContentConfig/)[1]).content_elements;
        const filteredData = [];
        for (const v of jsonData) {
            if (v.type === 'header' && v.content.includes('What we’re reading')) {
                break;
            } else if (v.type === 'custom_embed' && Boolean(v.embed.config.text)) {
                filteredData.push({ type: v.type, data: v.embed.config.text });
            } else if (v.type === 'text' && !v.content.includes('<b>NOW READ: </b>')) {
                filteredData.push({ type: v.type, data: v.content });
            } else {
                switch (v.type) {
                    case 'header':
                        filteredData.push({ type: v.type, data: v.content });

                        break;

                    case 'list':
                        filteredData.push({ type: v.type, list_type: v.list_type, items: v.items });

                        break;

                    case 'image':
                        filteredData.push({ type: v.type, src: v.url, alt: v.alt_text, caption: v.subtitle });

                        break;

                    default:
                        throw new Error(`Unknown type: ${v.type}`);
                }
            }
        }
        item.description = renderDescription(filteredData);
        return item;
    });

export const route: Route = {
    path: '/:category?',
    radar: [
        {
            source: ['dlnews.com/articles/:category'],
            target: '/:category',
        },
    ],
    url: 'dlnews.com/articles',
    name: 'Latest News',
    maintainers: ['Rjnishant530'],
    handler,
    example: '/dlnews/people-culture',
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const baseUrl = 'https://www.dlnews.com';
    const apiPath = '/pf/api/v3/content/fetch/articles-api';
    const vertical = category ?? '';

    const query = {
        author: '',
        date: 'now-1y/d',
        offset: 0,
        query: '',
        size: 15,
        sort: 'display_date:desc',
        vertical,
    };
    const data = await getData(`${baseUrl}${apiPath}?query=${encodeURIComponent(JSON.stringify(query))}&_website=${_website}`);
    const list = getList(data);
    const items = await pMap(list, (item) => extractArticle(item), { concurrency: 3 });

    return {
        title: Object.hasOwn(topics, category) ? `${topics[category]} : DL News` : 'DL News',
        link: baseUrl,
        item: items,
        description: Object.hasOwn(topics, category) ? `${topics[category]} : News on dlnews.com` : 'Latest News on dlnews.com',
        logo: 'https://www.dlnews.com/pf/resources/favicon.ico?d=284',
        icon: 'https://www.dlnews.com/pf/resources/favicon.ico?d=284',
        language: 'en-us',
    };
}
