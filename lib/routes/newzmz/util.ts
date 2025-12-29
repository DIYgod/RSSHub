import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const rootUrl = 'https://nzmz.xyz';

/**
 * Retrieve all movies and TV shows under a specified category on the homepage and obtain their detail links.
 * @param {function} tryGet     - cache.tryGet
 * @param {string} homeUrl      - Homepage URL
 * @param {string} id           - Category id
 * @param {string} modSelector  - Selector for mods
 * @param {string} itemSelector - Selector for items
 * @returns {Array} An array containing the links in the map.
 */
const getItems = async (tryGet, homeUrl, id, modSelector, itemSelector) => {
    const response = await tryGet(homeUrl, async () => {
        const { data: response } = await got(homeUrl);

        return response;
    });

    const $ = load(response);

    return $(modSelector)
        .eq(Number.parseInt(id, 10))
        .find(itemSelector)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });
};

/**
 * Obtain the information corresponding to a given movie or TV show item based on the provided URL.
 * @param {function} tryGet - cache.tryGet
 * @param {string} itemUrl  - Item URL
 * @returns {Object} An object containing information of the item.
 */
const getItemInfo = (tryGet, itemUrl) =>
    tryGet(`newzmz#${itemUrl.match(/details-(.*?)\.html/)[1]}`, async () => {
        const { data: detailResponse } = await got(itemUrl);

        const content = load(detailResponse);

        const nameZh = content('div.chsname').text();
        const nameEn = content('div.engname').text();
        const alias = content('div.aliasname')
            .text()
            .replace(/又名：/, '')
            .split('/')
            .map((a) => a.trim())
            .filter(Boolean);

        const link = content('a.addgz').prop('href');

        return {
            link,
            pubDate: parseDate(
                content('span.duration')
                    .first()
                    .text()
                    .match(/(\d{4}-\d{2}-\d{2})/)[1]
            ),
            description: {
                image: content('div.details-bg img').prop('src'),
                nameZh,
                nameEn,
                alias,
                update: content('span.upday').text(),
                links: content('div.ep-infos a[title]')
                    .toArray()
                    .map((a) => {
                        a = content(a);

                        return {
                            title: a.prop('title'),
                            link: a.prop('href'),
                        };
                    }),
            },
            author: content('ul.sws-list')
                .first()
                .find('h5.title')
                .toArray()
                .map((a) => content(a).text())
                .join(' / '),
            category: [nameZh, nameEn, ...alias],
        };
    });

/**
 * Retrieve all the episode items from the corresponding download page of a movie or TV show.
 * @param {Object} i                - Preprocessed item object
 * @param {string} downLinkType     - Type of download link, with the default value being `磁力链`. The website provides various types of download links, including but not limited to `磁力链`, `百度网盘`, `阿里云盘`, `夸克网盘`, `UC网盘`, and more. If the specified download link type cannot be found, the first download link will be returned instead.
 * @param {string} itemSelector     - Selector for items
 * @param {string} categorySelector - Selector for categories
 * @param {string} downLinkSelector - Selector for download links
 * @returns {Array} An array containing RSS feed objects in the map.
 */
const processItems = async (i, downLinkType, itemSelector, categorySelector, downLinkSelector) => {
    const { data: detailResponse } = await got(i.link);

    const content = load(detailResponse);

    return content(itemSelector)
        .toArray()
        .map((item) => {
            item = content(item);

            const categories = item
                .find(categorySelector)
                .toArray()
                .map((c) => content(c).text());

            const downLinks = item
                .find(downLinkSelector)
                .toArray()
                .map((downLink) => {
                    downLink = content(downLink);

                    return {
                        title: downLink.find('p.link-name').text(),
                        link: downLink.find('a[title]').prop('href'),
                    };
                });

            const subtitle = item
                .find('span.up')
                .text()
                .replaceAll(/[\s-]+/g, '');
            const title = `${i.description.nameZh || i.description.nameEn}|${subtitle}`;
            const guid = `newzmz#${i.link.match(/view\/(.*?)\.html/)[1]}-${subtitle}`;

            return {
                guid,
                title,
                link: i.link,
                description: renderDescription({
                    ...i.description,
                    categories,
                    downLinks,
                }),
                author: i.author,
                category: [...i.category, ...categories].filter(Boolean),
                pubDate: i.pubDate,
                enclosure_url: downLinks.findLast((l) => l.title === downLinkType)?.link ?? downLinks[0].link,
                enclosure_type: 'application/x-bittorrent',
            };
        });
};

export { getItemInfo, getItems, processItems, rootUrl };
