import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/hamel/blog',
    radar: [
        {
            source: ['hamel.dev/'],
        },
    ],
    url: 'hamel.dev/',
    name: 'Blog',
    maintainers: ['liyaozhong'],
    handler,
    description: "Hamel's Blog Posts",
};

async function handler() {
    const rootUrl = 'https://hamel.dev';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    let items = $('tr[data-index]')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const $link = $item.find('td a').last();
            const $date = $item.find('.listing-date');

            const href = $link.attr('href');
            const title = $link.text();
            const dateStr = $date.text();

            if (!href || !title) {
                throw new Error('Hamel returned a directory entry without its article title or link.');
            }

            const link = new URL(href, rootUrl).href;
            const parsedDate = dateStr ? parseDate(dateStr, 'M/D/YY') : undefined;
            const pubDate = parsedDate && Number.isFinite(parsedDate.getTime()) ? timezone(parsedDate, 0) : undefined;

            return {
                title,
                link,
                pubDate,
            };
        });

    items = await Promise.all(
        items.map(async (item) => {
            try {
                return {
                    ...item,
                    ...(await cache.tryGet(item.link!, async () => {
                        const detailResponse = await got(item.link);
                        let $detail = load(detailResponse.data);
                        let articleUrl = item.link!;
                        const redirectMap = /var redirects = (\{[^;]*\});/.exec($detail('script').text());
                        if ($detail('title').text() === 'Redirect' && redirectMap) {
                            const destination = JSON.parse(redirectMap[1])[''];
                            if (typeof destination === 'string') {
                                const target = new URL(destination, item.link!);
                                if (target.origin !== new URL(item.link!).origin) {
                                    throw new Error('Hamel linked a redirect outside the original article site.');
                                }
                                const redirectedResponse = await got(target.href);
                                $detail = load(redirectedResponse.data);
                                articleUrl = target.href;
                            }
                        }
                        const content = $detail('.content, .post-content, .post__content, blockquote.abstract').first();
                        if (content.is('blockquote.abstract')) {
                            content.children('.descriptor').remove();
                        }
                        const category = content
                            .find('.quarto-category')
                            .toArray()
                            .map((tag) => $detail(tag).text());
                        const author = content
                            .find('.quarto-title-meta-heading')
                            .filter((_, heading) => $detail(heading).text() === 'Author')
                            .next()
                            .text()
                            .trim();
                        content.find('#title-block-header').remove();
                        content.children('noscript').remove();
                        content.find('.author-bio').closest('div.mt-8').remove();
                        if (articleUrl !== item.link) {
                            content.find('[src], [href], [poster]').each((_, element) => {
                                const node = $detail(element);
                                for (const attribute of ['src', 'href', 'poster']) {
                                    const value = node.attr(attribute);
                                    if (value && URL.canParse(value, articleUrl)) {
                                        node.attr(attribute, new URL(value, articleUrl).href);
                                    }
                                }
                            });
                        }
                        return {
                            description: content.html(),
                            category,
                            author: author || undefined,
                        };
                    })),
                };
            } catch (error) {
                if (error instanceof FetchError && error.statusCode === 403 && new URL(item.link!).hostname === 'medium.com') {
                    return item;
                }
                throw error;
            }
        })
    );

    return {
        title: "Hamel's Blog",
        link: rootUrl,
        item: items,
    };
}
