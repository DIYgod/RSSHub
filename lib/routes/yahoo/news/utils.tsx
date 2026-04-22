import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const getArchive = async (region, limit, tag, providerId?) => {
    const { data: response } = await got(
        `https://${region}.news.yahoo.com/_td-news/api/resource/NCPListService;api=archive;ncpParams=${encodeURIComponent(
            JSON.stringify({
                query: {
                    count: limit,
                    // imageSizes: '220x128',
                    start: 0,
                    providerid: providerId,
                    tag,
                },
            })
        )}`
    );
    return response;
};

const getList = async (region, listId) => {
    const { data: response } = await got(`https://${region}.news.yahoo.com/_td-news/api/resource/StreamService;category=LISTID%3A${listId};useNCP=true`);
    return response;
};

const getCategories = (region) =>
    cache.tryGet(`yahoo:${region}:categoryMap`, async () => {
        const { PageStore } = await getStores(region);

        const { Col1: col1 } = PageStore.pagesConfigRaw.base.section.regions;
        const { categoryMap } = col1.find((c) => c.name === 'ArchiveFilterBar').props;
        for (const [key, value] of Object.entries(categoryMap)) {
            categoryMap[key] = {
                name: value,
                yctMap: col1.find((c) => c.name === 'StreamContainerArchive').props.yctMap[key],
            };
        }

        return categoryMap;
    });

const getProviderList = async (region) => {
    const stores = await getStores(region);
    return stores.providerList.map((provider) => ({
        title: provider.title,
        key: provider.key,
        link: new URL(`${provider.key}--所有類別`, `https://${region}.news.yahoo.com`).href,
    }));
};

const findStoresObject = (node) => {
    if (!node || typeof node !== 'object') {
        return null;
    }
    if ('breakingNews' in node) {
        return node;
    }
    for (const value of Object.values(node)) {
        const found = findStoresObject(value);
        if (found) {
            return found;
        }
    }
    return null;
};

const getStores = (region) =>
    cache.tryGet(`yahoo:${region}:stores`, async () => {
        const { data: response } = await got(`https://${region}.news.yahoo.com/archive`);
        const $ = load(response);

        const script = $('script:contains("pageBenjiConfig")').text();
        const rscText = script.match(/self\.__next_f\.push\(\[1,"\d:(.*)"\]\)/)?.[1];
        const rscData = JSON.parse(JSON.parse(`"${rscText}"`));

        const stores = findStoresObject(rscData);
        if (!stores) {
            throw new Error(`Unable to locate stores data for region ${region}`);
        }

        return stores;
    });

const parseList = (region, response) =>
    response.map((item) => ({
        title: item.title,
        link: item.url.startsWith('http') ? item.url : new URL(item.url, `https://${region}.news.yahoo.com`).href,
        description: item.summary,
        pubDate: parseDate(item.published_at, 'X'),
    }));

const parseItem = (item) =>
    cache.tryGet(item.link, async () => {
        const { data: response } = await got(item.link, {
            headers: {
                'User-Agent': config.trueUA,
            },
        });
        const $ = load(response);

        const ldJson = JSON.parse(
            $('script[type="application/ld+json"]')
                .toArray()
                .find((ele) => $(ele).text().includes('"@type":"NewsArticle"'))?.children[0].data
        );
        const author = ldJson.author.name;
        const body = $('.atoms');

        body.find('noscript, .recommendation-contents, .text-gandalf, [id^="sda-inbody-"]').remove();
        // remove padding
        body.find('.caas-figure-with-pb, .caas-img-container').each((_, ele) => {
            const $ele = $(ele);
            $ele.removeAttr('style');
        });

        body.find('img').each((_, ele) => {
            const $ele = $(ele);
            let dataSrc = $ele.data('src') as string;

            if (dataSrc) {
                const match = dataSrc.match(/.*--\/.*--\/(.*)/);
                if (match?.[1]) {
                    dataSrc = match?.[1];
                }
                $ele.attr('src', dataSrc);
                $ele.removeAttr('data-src');
            }
        });
        // fix blockquote iframe
        body.find('.caas-iframe').each((_, ele) => {
            const $ele = $(ele);
            if ($ele.data('type') === 'youtube') {
                const blockquoteSrc = $ele.find('blockquote').data('src') as string;
                $ele.replaceWith(
                    renderToString(
                        <iframe
                            width="560"
                            height="315"
                            src={`https://www.youtube-nocookie.com/embed/${blockquoteSrc.split('/').pop()?.split('?')?.[0]}`}
                            frameborder="0"
                            allow="encrypted-media; picture-in-picture; web-share"
                            allowfullscreen
                            referrerpolicy="strict-origin-when-cross-origin"
                        ></iframe>
                    )
                );
            }
        });

        item.description = body
            .toArray()
            .map((ele) => $(ele).html())
            .join('');
        item.author = author;
        item.category = ldJson.keywords;
        item.pubDate = parseDate(ldJson.datePublished);
        item.updated = parseDate(ldJson.dateModified);

        return item;
    });

export { getArchive, getCategories, getList, getProviderList, getStores, parseItem, parseList };
