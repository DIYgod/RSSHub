import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:language?/:channel?/:subChannel?',
    categories: ['traditional-media'],
    example: '/rfa/english',
    parameters: { language: 'language, English by default', channel: 'channel', subChannel: 'subchannel, where applicable' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['zphw'],
    handler,
    description: `Delivers a better experience by supporting parameter specification.

Parameters can be obtained from the official website, for instance:

\`https://www.rfa.org/cantonese\` corresponds to \`/rfa/cantonese\`

\`https://www.rfa.org/cantonese/htm\` corresponds to \`/rfa/cantonese/htm\``,
};

const renderElement = (element: any) => {
    switch (element.type) {
        case 'text':
            return `<p>${element.content}</p>`;
        case 'header':
            return `<h${element.level ?? 2}>${element.content}</h${element.level ?? 2}>`;
        case 'divider':
            return '<hr>';
        case 'image':
            return `<figure><img src="${element.url}" alt="${element.alt_text ?? ''}">${element.caption ? `<figcaption>${element.caption}</figcaption>` : ''}</figure>`;
        case 'video': {
            const stream = element.streams?.find((s) => s.stream_type === 'mp4');
            return stream ? `<figure><video controls src="${stream.url}" poster="${element.promo_image?.url ?? ''}"></video>${element.headlines?.basic ? `<figcaption>${element.headlines.basic}</figcaption>` : ''}</figure>` : '';
        }
        case 'oembed_response':
            return element.raw_oembed?.html ?? '';
        case 'list': {
            const tag = element.list_type === 'ordered' ? 'ol' : 'ul';
            return `<${tag}>${element.items.map((el) => `<li>${el.content}</li>`).join('')}</${tag}>`;
        }
        case 'gallery':
            return element.content_elements.map((el) => renderElement(el)).join('');
        case 'quote':
            return `<blockquote>${element.content_elements.map((el) => renderElement(el)).join('')}${element.citation?.content ? `<cite>${element.citation.content}</cite>` : ''}</blockquote>`;
        case 'raw_html':
            return element.content;
        case 'custom_embed':
            return '';
        default:
            throw new Error(`Unsupported element type: ${element.type}`);
    }
};

async function handler(ctx: Context) {
    const { language = 'english', channel, subChannel } = ctx.req.param();
    const baseUrl = 'https://www.rfa.org';
    const link = `${baseUrl}/${[language, channel, subChannel].filter(Boolean).join('/')}/`;

    const response = await ofetch(link);
    const $ = load(response);
    const contentCache = JSON.parse(response.match(/Fusion\.contentCache=(\{.*?\});Fusion\.layout/)?.[1] ?? '{}');

    const list = new Map<string, any>(
        Object.values<any>(contentCache['content-api-collections'] ?? {})
            .flatMap((entry) => entry.data?.content_elements ?? [])
            .map((story) => [story._id, story])
    )
        .values()
        .toArray()
        .map((story) => {
            const website = Object.values<any>(story.websites)[0];
            return {
                title: story.headlines.basic,
                description: story.description.basic,
                link: new URL(website.website_url, baseUrl).href,
                pubDate: parseDate(story.display_date),
                author: story.credits?.by?.map((author) => author.name).join(', '),
                category: website.website_section?.name,
                image: story.promo_items.basic.url,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const globalContent = JSON.parse(response.match(/Fusion\.globalContent=(\{.*?\});Fusion\.globalContentConfig/)?.[1] ?? '{}');

                if (globalContent.content_elements) {
                    item.description = [globalContent.promo_items?.basic, ...globalContent.content_elements]
                        .filter(Boolean)
                        .map((element) => renderElement(element))
                        .join('');
                }
                item.category = [...new Set([item.category, ...(globalContent.taxonomy?.sections?.map((section) => section.name) ?? []), ...(globalContent.taxonomy?.tags?.map((tag) => tag.text) ?? [])].filter(Boolean))];
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        image: $('meta[name="og:image"]').attr('content'),
        language: $('html').attr('lang'),
        item: items,
    };
}
