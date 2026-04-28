import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const regionConfig = {
    hk: {
        spaceId: '2143854493',
        lang: 'zh-Hant-HK',
        categoryMap: {
            business: { name: '財經', tags: ['yct:001000298', 'yct:001000123', 'yct:001000721'] },
            entertainment: { name: '娛樂', tags: ['yct:001000031'] },
            health: { name: '健康', tags: ['yct:001000395'] },
            'hong-kong': { name: '港聞', tags: ['yct:001000661'] },
            parenting: { name: '親子', tags: ['yct:001000267'] },
            sports: { name: '體育', tags: ['yct:001000001'] },
            supplement: { name: '副刊', tags: ['yct:001000560', 'yct:001000780', 'yct:001000931', 'yct:001001039', 'yct:001000374'] },
            world: { name: '兩岸國際', tags: ['yct:001000680'] },
        },
    },
    tw: {
        spaceId: '2144446726',
        lang: 'zh-Hant-TW',
        categoryMap: {
            entertainment: { name: '娛樂', tags: ['yct:001000031'] },
            finance: { name: '財經', tags: ['yct:001000298', 'yct:001000123'] },
            health: { name: '健康', tags: ['yct:001000395'] },
            lifestyle: { name: '生活', tags: ['ymedia:category=000000126', 'yct:001000560', 'yct:001000374', 'yct:001001117', 'yct:001000659', 'yct:001000616'] },
            politics: { name: '政治', tags: ['yct:001000661'] },
            society: { name: '社會地方', tags: ['ymedia:category=000000179', 'yct:001000798', 'yct:001000667'] },
            sports: { name: '運動', tags: ['yct:001000001'] },
            technology: { name: '科技', tags: ['yct:001000931', 'yct:001000742', 'ymedia:category=000000175'] },
            world: { name: '國際', tags: ['ymedia:category=000000030', 'ymedia:category=000000032'] },
        },
    },
};

const getArchive = async (region, limit, tags?: string[], providerId?) => {
    const { spaceId, lang } = regionConfig[region];
    const params = new URLSearchParams({
        count: limit,
        device: 'desktop',
        documentType: 'article,video',
        id: 'search',
        lang,
        namespace: 'news',
        region: region.toUpperCase(),
        site: 'news',
        start: '0',
        version: 'v1',
        imageSizes: '498x280,100x100',
        providerid: providerId,
        spaceId,
    });
    if (tags) {
        for (const tag of tags) {
            params.append('tag', tag);
        }
    }

    const { data: response } = await got(`https://tw-gw-news.media.yahoo.com/api/v1/gql/saved_query?${params.toString()}`);
    return response.data.stream.contents;
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
        link: new URL(`${provider.key}--所有類別/archive`, `https://${region}.news.yahoo.com`).href,
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
        link: item.canonicalUrl ? item.canonicalUrl.url : item.url.startsWith('http') ? item.url : new URL(item.url, `https://${region}.news.yahoo.com`).href,
        description: item.summary,
        pubDate: item.published_at ? parseDate(item.published_at, 'X') : item.pubDate ? parseDate(item.pubDate) : undefined,
        author: item.provider_name ?? item.provider?.displayName ?? item.publisher,
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
                .find((ele) => $(ele).text().includes('"@type":"NewsArticle"'))?.children[0].data || '{}'
        );
        const author = ldJson.author?.name;
        const body = $('.atoms').length ? $('.atoms') : $('.article-detail').length ? $('.article-detail') : $('.bodyItems-wrapper');

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
        item.author = author ?? item.author;
        item.category = ldJson.keywords;
        item.pubDate = ldJson.datePublished ? parseDate(ldJson.datePublished) : item.pubDate;
        item.updated = ldJson.dateModified ? parseDate(ldJson.dateModified) : item.updated;

        return item;
    });

export { getArchive, getCategories, getList, getProviderList, getStores, parseItem, parseList, regionConfig };
