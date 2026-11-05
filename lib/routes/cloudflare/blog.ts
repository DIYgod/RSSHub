import { load } from 'cheerio';
import pMap from 'p-map';
import Parser from 'rss-parser';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const parser = new Parser<Pick<Data, 'language'>, { creators?: string[]; 'content:encoded': string }>({
    customFields: {
        item: [['dc:creator', 'creators', { keepArray: true }]],
    },
});

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'blog.cloudflare.com',
    example: '/cloudflare/blog',
    categories: ['programming'],
    maintainers: ['ljh12138164'],
    description:
        'Uses the [official RSS feed](https://blog.cloudflare.com/rss/) for article metadata and fetches full articles from [Cloudflare Blog](https://blog.cloudflare.com/), including inline images, code blocks, and copyable prompts.',
    zh: {
        description: '来源：[Cloudflare Blog](https://blog.cloudflare.com/)。使用[官方 RSS](https://blog.cloudflare.com/rss/)获取文章列表、作者、日期和标签，再抓取并缓存网页正文，补齐图片、代码块和可复制的提示词。',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['blog.cloudflare.com'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
    handler,
};

async function handler(): Promise<Data> {
    const feedXml = await ofetch('https://blog.cloudflare.com/rss/', { responseType: 'text' });
    const feed = await parser.parseString(feedXml);

    return {
        title: feed.title!,
        description: feed.description,
        link: feed.link,
        image: feed.image?.url,
        language: feed.language,
        item: await pMap(
            feed.items,
            (item) =>
                cache.tryGet(item.link!, async () => ({
                    title: item.title!,
                    link: item.link,
                    description: item['content:encoded'].includes('<!-- unsupported block:') ? await fetchArticle(item.link!) : item['content:encoded'],
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    author: item.creators?.join(', '),
                    category: item.categories,
                    guid: item.guid,
                    enclosure_url: item.enclosure?.url,
                    enclosure_type: item.enclosure?.type,
                    // rss-parser returns XML strings despite declaring enclosure lengths as numbers.
                    enclosure_length: item.enclosure ? Number(item.enclosure.length) : undefined,
                })),
            { concurrency: 3 }
        ),
    };
}

async function fetchArticle(link: string): Promise<string> {
    const response = await ofetch(link);
    const $ = load(response);
    const article = $('.article-content');
    if (!article.length) {
        throw new Error(`Cloudflare Blog article content not found: ${link}`);
    }

    article.find('[data-copy-prompt]').each((_, element) => {
        // The copy button stores the full prompt as a JSON string.
        const prompt = JSON.parse($(element).find('[data-prompt]').attr('data-prompt')!);
        $(element).replaceWith($('<pre>').append($('<code>').text(prompt)));
    });

    article.find('button, img[data-image-placeholder]').remove();
    article.find('[srcset]').removeAttr('srcset');
    article.find('img').each((_, element) => {
        const original = new URL($(element).attr('src')!, link).searchParams.get('href');
        if (original) {
            $(element).attr('src', original);
        }
    });
    article.find('*').each((_, element) => {
        for (const name of Object.keys(element.attribs)) {
            if (name.startsWith('data-astro-cid-')) {
                $(element).removeAttr(name);
            }
        }
    });

    return article.html()!;
}
