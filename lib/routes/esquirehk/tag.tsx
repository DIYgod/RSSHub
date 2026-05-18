import * as cheerio from 'cheerio';
import { destr } from 'destr';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import type { JSX } from 'hono/jsx/jsx-runtime';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const topics = new Set(['style', 'watches', 'lifestyle', 'health', 'money-investment', 'gear', 'people', 'watch', 'mens-talk']);

const handler = async (ctx) => {
    let { id = 'Fashion' } = ctx.req.param();

    id = id.toLowerCase();

    const rootUrl = 'https://www.esquirehk.com';

    let currentUrl = `${rootUrl}/tag/${id}`;
    if (topics.has(id)) {
        currentUrl = `${rootUrl}/${id}`;
    }

    const response = await ofetch(currentUrl);

    const $ = cheerio.load(response);
    const list = [
        ...$('div[class^="max-w-[100%]"] > div > div:nth-child(2) > a')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.text().trim(),
                    link: new URL(item.attr('href'), currentUrl).href,
                };
            }),
        ...$('div.list-item > div > div:nth-child(2) > a')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.text().trim(),
                    link: new URL(item.attr('href'), currentUrl).href,
                };
            }),
    ]
        .map((item) => ({
            ...item,
            slug: item.link.replace(rootUrl, ''),
        }))
        .filter((item) => !item.slug.startsWith('/campaign'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const resp = await ofetch(`https://api.esquirehk.com${item.slug}`);
                const response = destr(resp) as any;
                if (response.status === '404') {
                    return item;
                }

                item.description = response.intro.raw + renderSubpages(response.subpages);
                item.pubDate = parseDate(response.date.published, 'X');
                item.updated = parseDate(response.date.lastModified, 'X');
                item.author = response.author.name;
                item.category = [...response.tags.topic.map((tag) => tag.name), ...response.tags.normal.map((tag) => tag.name)];

                return item;
            })
        )
    );

    return {
        title: `${$('head title').text()} - Esquirehk`,
        description: $('head meta[name="description"]').attr('content'),
        image: $('head meta[property="og:image"]').attr('content'),
        logo: $('head meta[property="og:image"]').attr('content'),
        link: currentUrl,
        item: items,
    };
};

const renderSubpages = (subpages): string =>
    renderToString(
        <>
            {subpages?.map((page, index) => {
                const blocks: Array<JSX.Element | null> = [];

                switch (page.type) {
                    case 'image': {
                        const image = page.image?.large || page.image?.desktop || page.image?.mobile;
                        blocks.push(<img key={`image-${index}`} src={image?.src} alt={image?.alt} />);

                        break;
                    }
                    case 'video_block': {
                        const videoId = page.source?.split('&')[0];
                        blocks.push(
                            <iframe
                                key={`video-${index}`}
                                id="ytplayer"
                                type="text/html"
                                width="640"
                                height="360"
                                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                                frameborder="0"
                                allowfullscreen
                                referrerpolicy="strict-origin-when-cross-origin"
                            ></iframe>
                        );

                        break;
                    }
                    case 'ctc_product_list':
                        blocks.push(
                            <span key={`products-${index}`}>
                                {page.products?.map((product, productIndex) => {
                                    const img = product.image?.desktop || product.image?.mobile;
                                    return (
                                        <span key={`product-${productIndex}`}>
                                            <img src={img?.src} alt={img?.alt} />
                                            <br />
                                            {product.brand}
                                            <br />
                                            {product.name}
                                            <br />
                                            HKD ${product.price}
                                            <br />
                                            <a href={product.url}>SHOP NOW</a>
                                        </span>
                                    );
                                })}
                            </span>
                        );

                        break;

                    default:
                        blocks.push(<span key={`unknown-${index}`}>UNHANDLED PAGE TYPE: {page.type}</span>);
                }

                if (page.title) {
                    blocks.push(
                        <h2 key={`title-${index}`}>
                            {page.order ? `${page.order} ` : ''}
                            {page.title}
                        </h2>
                    );
                }

                if (page.description?.raw) {
                    blocks.push(<span key={`description-${index}`}>{raw(page.description.raw)}</span>);
                }

                return <span key={`page-${index}`}>{blocks}</span>;
            })}
        </>
    );

export const route: Route = {
    path: '/tag/:id?',
    categories: ['new-media'],
    example: '/esquirehk/tag/Fashion',
    parameters: { id: '标签，可在对应标签页 URL 中找到' },
    name: 'Tag',
    maintainers: ['nczitzk'],
    radar: [
        {
            source: ['www.esquirehk.com/tag/:id', 'www.esquirehk.com/:id'],
        },
    ],
    handler,
};
