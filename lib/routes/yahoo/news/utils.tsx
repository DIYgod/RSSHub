import { type CheerioAPI, load } from 'cheerio';
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
        providerid: providerId ?? '',
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
        const streamLines = Object.entries(categoryMap);
        for (const [key, value] of streamLines) {
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
    if (!(node instanceof Object)) {
        return null;
    }
    if ('breakingNews' in node) {
        return node;
    }
    const streamLines = Object.values(node);
    for (const value of streamLines) {
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
function getStructuredData(content: CheerioAPI) {
    return content('script[type="application/ld+json"]')
        .toArray()
        .flatMap((element) => {
            try {
                const data = JSON.parse(content(element).text());
                const entries = Array.isArray(data) ? data : [data];
                return entries.flatMap((entry) => (entry && typeof entry === 'object' ? [entry, ...(Array.isArray(entry['@graph']) ? entry['@graph'] : [])] : []));
            } catch {
                return [];
            }
        })
        .filter((entry) => entry && typeof entry === 'object');
}
function parseArticleDate(value: unknown) {
    if (typeof value !== 'string' || !value) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
function parseArticleImage(value: unknown) {
    if (typeof value === 'string' && URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol)) {
        return value;
    }
}
function getYoutubeVideoId(value: string | undefined) {
    if (!value || !URL.canParse(value)) {
        return;
    }
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
        return;
    }
    const videoId = ['youtu.be', 'www.youtu.be'].includes(url.hostname)
        ? url.pathname.split('/', 2)[1]
        : ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)
          ? url.pathname === '/watch'
              ? url.searchParams.get('v')
              : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
          : undefined;
    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : undefined;
}
async function fetchItem(link: string) {
    const { data: response } = await got(link, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $ = load(response);
    const ldJson = getStructuredData($).find((entry) => entry['@type'] === 'NewsArticle') ?? {};
    const author = ldJson.author?.name;
    const body = $('.atoms').length ? $('.atoms') : $('.article-detail').length ? $('.article-detail') : $('.bodyItems-wrapper');
    body.find('noscript, .recommendation-contents, .text-gandalf, [id^="sda-inbody-"], [data-testid="inarticle-ad"]').remove();
    // remove padding
    body.find('.caas-figure-with-pb, .caas-img-container').each((_, ele) => {
        const $ele = $(ele);
        $ele.removeAttr('style');
    });
    body.find('img').each((_, ele) => {
        const $ele = $(ele);
        let dataSrc = $ele.attr('data-src');
        if (!dataSrc) {
            return;
        }
        const match = dataSrc.match(/.*--\/.*--\/(.*)/);
        if (match?.[1]) {
            dataSrc = match?.[1];
        }
        $ele.attr('src', dataSrc);
        $ele.removeAttr('data-src');
    });
    // fix blockquote iframe
    body.find('.caas-iframe').each((_, ele) => {
        const $ele = $(ele);
        if ($ele.data('type') !== 'youtube') {
            return;
        }
        const videoId = getYoutubeVideoId($ele.find('blockquote').attr('data-src'));
        if (!videoId) {
            return;
        }
        $ele.replaceWith(
            renderToString(
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    frameborder="0"
                    allow="encrypted-media; picture-in-picture; web-share"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin"
                ></iframe>
            )
        );
    });
    return {
        description: body
            .toArray()
            .map((ele) => $(ele).html())
            .join(''),
        author,
        image: parseArticleImage(ldJson.image?.url),
        category:
            typeof ldJson.articleSection === 'string' && ldJson.articleSection
                ? [ldJson.articleSection, ...(Array.isArray(ldJson.keywords) ? ldJson.keywords : typeof ldJson.keywords === 'string' ? [ldJson.keywords] : [])]
                : ldJson.keywords,
        pubDate: parseArticleDate(ldJson.datePublished),
        updated: parseArticleDate(ldJson.dateModified),
    };
}
const parseItem = async (item) => {
    const details = await cache.tryGet(`yahoo:news:article:v5:${item.link}`, () => fetchItem(item.link));
    return {
        ...item,
        description: details.description ?? item.description,
        author: details.author ?? item.author,
        image: details.image ?? item.image,
        category: details.category ?? item.category,
        pubDate: details.pubDate ?? item.pubDate,
        updated: details.updated ?? item.updated,
    };
};
export { getArchive, getCategories, getList, getProviderList, getStores, parseItem, parseList, regionConfig };
