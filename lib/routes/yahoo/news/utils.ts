import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import { art } from '@/utils/render';

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

const getCategories = (region, tryGet) =>
    tryGet(`yahoo:${region}:categoryMap`, async () => {
        const { PageStore } = await getStores(region, tryGet);

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

const getProviderList = (region, tryGet) =>
    tryGet(`yahoo:${region}:providerList`, async () => {
        const { ProviderListStore } = await getStores(region, tryGet);

        return ProviderListStore.providerList.flatMap((list) =>
            list.providers.map((provider) => ({
                title: `${list.title} - ${provider.title}`,
                key: provider.key,
                link: new URL(provider.url, `https://${region}.news.yahoo.com`).href,
            }))
        );
    });

const getStores = (region, tryGet) =>
    tryGet(`yahoo:${region}:stores`, async () => {
        const { data: response } = await got(`https://${region}.news.yahoo.com/archive`);
        const $ = load(response);

        const appData = JSON.parse(
            $('script:contains("root.App.main")')
                .text()
                .match(/root.App.main\s+=\s+({.+});/)?.[1] as string
        );

        return appData.context.dispatcher.stores;
    });

const parseList = (region, response) =>
    response.map((item) => ({
        title: item.title,
        link: item.url.startsWith('http') ? item.url : new URL(item.url, `https://${region}.news.yahoo.com`).href,
        description: item.summary,
        pubDate: parseDate(item.published_at, 'X'),
    }));

const parseItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = load(response);

        const ldJson = JSON.parse(
            $('script[type="application/ld+json"]')
                .toArray()
                .find((ele) => $(ele).text().includes('"@type":"NewsArticle"'))?.children[0].data
        );
        const author = ldJson.author.name;
        const body = $('.atoms');

        body.find('noscript, .text-gandalf, [id^="sda-inbody-"]').remove();
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
                    art(path.join(__dirname, '../templates/youtube.art'), {
                        id: blockquoteSrc.split('/').pop()?.split('?')?.[0],
                    })
                );
            }
        });

        item.description = body.html();
        item.author = author;
        item.category = ldJson.keywords;
        item.pubDate = parseDate(ldJson.datePublished);
        item.updated = parseDate(ldJson.dateModified);

        return item;
    });

export { getArchive, getList, getCategories, getProviderList, getStores, parseList, parseItem };
