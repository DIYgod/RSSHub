// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';
import { art } from '@/utils/render';

const getArchive = async (region, limit, tag, providerId) => {
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
                .match(/root.App.main\s+=\s+({.+});/)[1]
        );

        return appData.context.dispatcher.stores;
    });

const parseList = (region, response) =>
    response.map((item) => ({
        title: item.title,
        link: new URL(item.url, `https://${region}.news.yahoo.com`).href,
        description: item.summary,
        pubDate: parseDate(item.published_at, 'X'),
    }));

const parseItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = load(response);

        const ldJson = JSON.parse($('script[type="application/ld+json"]').first().text());
        const body = $('.caas-body');

        body.find('noscript').remove();
        // remove padding
        body.find('.caas-figure-with-pb, .caas-img-container').each((_, ele) => {
            ele = $(ele);
            ele.removeAttr('style');
        });

        body.find('img').each((_, ele) => {
            ele = $(ele);
            let dataSrc = ele.data('src');

            if (dataSrc) {
                const match = dataSrc.match(/.*--\/.*--\/(.*)/);
                if (match?.[1]) {
                    dataSrc = match?.[1];
                }
                ele.attr('src', dataSrc);
                ele.removeAttr('data-src');
            }
        });
        // fix blockquote iframe
        body.find('.caas-iframe').each((_, ele) => {
            ele = $(ele);
            if (ele.data('type') === 'youtube') {
                ele.replaceWith(
                    art(path.join(__dirname, '../../templates/youtube.art'), {
                        id: ele.find('blockquote').data('src').split('/').pop()?.split('?')?.[0],
                    })
                );
            }
        });

        item.description = body.html();
        item.category = ldJson.keywords;
        item.updated = parseDate(ldJson.dateModified);

        return item;
    });

module.exports = {
    getArchive,
    getCategories,
    getProviderList,
    getStores,
    parseList,
    parseItem,
};
