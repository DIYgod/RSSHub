import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:category/:search',
    categories: ['journal'],
    example: '/archdaily/search/projects/Urban Design',
    parameters: {
        category: 'The category to search in, including "all", "projects", "products", "folders", "articles", "competitions" and "events"',
        search: 'The search query',
    },
    features: {
        requireConfig: false,
    },
    radar: [
        {
            source: ['www.archdaily.com/search/:category'],
            target: '/search/:category/:search',
        },
    ],
    name: 'Search',
    maintainers: ['Friday_Anubis'],
    handler,
};

async function handler(ctx) {
    const { category, search } = ctx.req.param();

    const baseUrl = 'https://www.archdaily.com';
    const allowedCategories = new Set(['all', 'projects', 'products', 'folders', 'articles', 'competitions', 'events']);
    const finalCategory = allowedCategories.has(category) ? category : 'all';

    if (finalCategory === 'competitions' || finalCategory === 'events') {
        const pageCategory = finalCategory;
        const listingUrl = `${baseUrl}/search/${pageCategory}/text/${encodeURIComponent(search)}`;
        const { data: response } = await got(listingUrl);
        const $ = load(response);

        const seen = new Set<string>();
        const list = $('li.afd-search-list__item')
            .toArray()
            .map((item) => {
                const element = $(item);
                const linkElement = element.find('a.afd-search-list__link').first();
                const href = linkElement.attr('href');
                const titleElement = element.find('h2.afd-search-list__title').first();
                const imageElement = element.find('img.afd-search-list__img').first();

                const title = titleElement.text().trim() || imageElement.attr('alt')?.trim();
                if (!href || !title) {
                    return;
                }

                const link = normalizeArchdailyLink(href, baseUrl);
                if (!link || !link.startsWith('https://www.archdaily.com/') || link.includes('/search/') || seen.has(link)) {
                    return;
                }
                seen.add(link);

                const articleId = getArchdailyArticleId(link);

                return {
                    title,
                    link,
                    image: normalizeImageUrl(imageElement.attr('src')),
                    guid: articleId ? `archdaily-${pageCategory}-${articleId}` : `${pageCategory}:${link}`,
                };
            })
            .filter(Boolean);

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.guid, async () => {
                    const detail = await getCompetitionMeta(item.link);

                    return {
                        title: item.title,
                        link: item.link,
                        guid: item.guid,
                        description: `${item.image ? `<img src="${item.image}"><br>` : ''}${detail.description ?? ''}`,
                        pubDate: detail.pubDate,
                    };
                })
            )
        );

        return {
            title: `ArchDaily - ${search} in ${pageCategory}`,
            link: listingUrl,
            description: `Search results for "${search}" in ${pageCategory} on ArchDaily`,
            item: items,
        };
    }

    const response = await ofetch<{ results?: any[] }>(`${baseUrl}/search/api/v1/us/${finalCategory}?q=${encodeURIComponent(search)}`);

    const items = (response?.results ?? [])
        .map((item) => {
            const title = item?.title || item?.name;
            const link = item?.url;
            if (!title || !link) {
                return;
            }

            if (finalCategory === 'folders') {
                const images = (item?.images ?? []).map((image) => normalizeImageUrl(image)).filter(Boolean);
                const author = item?.user?.slug_name;
                const profileUrl = item?.user?.profile_url;
                const folderTitle = author ? `${title} by ${author}` : title;

                return {
                    title: folderTitle,
                    link,
                    guid: item?.id ? `archdaily-folder-${item.id}` : undefined,
                    description: [
                        `<p><strong>${folderTitle}</strong></p>`,
                        item?.last_update ? `<p>Updated: ${item.last_update}</p>` : undefined,
                        profileUrl ? `<p><a href="${profileUrl}">Uploader Profile</a></p>` : undefined,
                        images.map((image) => `<img src="${image}">`).join('<br>'),
                    ]
                        .filter(Boolean)
                        .join(''),
                    pubDate: item?.last_update ? parseDate(item.last_update) : undefined,
                    author,
                    category: ['folders', title],
                };
            }

            const image = normalizeImageUrl(item?.featured_images?.url_large || item?.featured_images?.url_medium || item?.featured_images?.url_small);
            const itemCategory = (item?.tags ?? []).map((tag) => tag?.name).filter(Boolean);

            return {
                title,
                link,
                description: `${image ? `<img src="${image}"><br>` : ''}${item?.meta_description ?? ''}`,
                pubDate: item?.publication_date ? parseDate(item.publication_date) : undefined,
                author: item?.author?.name,
                category: itemCategory,
            };
        })
        .filter(Boolean);

    const seenOutput = new Set<string>();
    const dedupedItems = items.filter((item) => {
        const key = item?.guid || item?.link;
        if (!key || seenOutput.has(key)) {
            return false;
        }
        seenOutput.add(key);
        return true;
    });

    return {
        title: `ArchDaily - ${search}${finalCategory === 'all' ? '' : ` in ${finalCategory}`}`,
        link: `${baseUrl}/search/${finalCategory}?q=${encodeURIComponent(search)}`,
        description: `Search results for "${search}" on ArchDaily`,
        item: dedupedItems,
    };
}

function normalizeImageUrl(url?: string) {
    if (!url) {
        return;
    }
    if (url.startsWith('//')) {
        return `https:${url}`;
    }
    return url;
}

function normalizeArchdailyLink(url: string, baseUrl: string) {
    const normalize = (input: string) => {
        const parsed = new URL(input);
        parsed.search = '';
        parsed.hash = '';
        return parsed.toString();
    };

    if (url.startsWith('/')) {
        return normalize(`${baseUrl}${url}`);
    }
    if (url.startsWith('https://www.archdaily.com/')) {
        return normalize(url);
    }
}

function getArchdailyArticleId(link: string) {
    const matched = link.match(/archdaily\.com\/(\d+)\//);
    return matched ? matched[1] : undefined;
}

async function getCompetitionMeta(link: string) {
    const { data } = await got(link);
    const $ = load(data);

    const publishedTime =
        $('meta[property="article:published_time"]').attr('content') ??
        $('script[type="application/ld+json"]')
            .toArray()
            .map((script) => $(script).text())
            .map((jsonText) => {
                try {
                    return JSON.parse(jsonText);
                } catch {
                    return;
                }
            })
            .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
            .find((entry) => entry && typeof entry === 'object' && entry.datePublished)?.datePublished;

    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');

    return {
        pubDate: publishedTime ? parseDate(publishedTime) : undefined,
        description,
    };
}
