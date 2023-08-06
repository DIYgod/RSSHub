const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://nzmz.xyz';

const getItems = async (homeUrl, id, modSelector, itemSelector) => {
    const { data: response } = await got(homeUrl);

    const $ = cheerio.load(response);

    return $(modSelector)
        .eq(parseInt(id, 10))
        .find(itemSelector)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });
};

const getItemInfo = async (itemUrl) => {
    const { data: detailResponse } = await got(itemUrl);

    const content = cheerio.load(detailResponse);

    const nameZh = content('div.chsname').text();
    const nameEn = content('div.engname').text();
    const alias = content('div.aliasname')
        .text()
        .replace(/又名：/, '')
        .split('/')
        .map((a) => a.trim())
        .filter((a) => a);

    const link = content('a.addgz').prop('href');

    return {
        guid: link.match(/view\/(.*?)\.html/)[1],
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
        category: [].concat(nameZh, nameEn, alias),
    };
};

const processItems = async (i, downLinkType, itemSelector, categorySelector, downLinkSelector) => {
    const { data: detailResponse } = await got(i.link);

    const content = cheerio.load(detailResponse);

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
                .replace(/[\s-]+/g, '');
            const title = `${i.description.nameZh || i.description.nameEn}|${subtitle}`;
            const guid = `newzmz#${i.guid}-${subtitle}`;

            return {
                guid,
                title,
                link: i.link,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    ...i.description,
                    ...{
                        categories,
                        downLinks,
                    },
                }),
                author: i.author,
                category: [...i.category, ...categories].filter((c) => c),
                pubDate: i.pubDate,
                enclosure_url: downLinks.filter((l) => l.title === downLinkType).pop()?.link ?? downLinks[0].link,
                enclosure_type: 'application/x-bittorrent',
            };
        });
};

module.exports = {
    rootUrl,
    getItems,
    getItemInfo,
    processItems,
};
