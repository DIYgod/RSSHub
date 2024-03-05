// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

const rootUrl = 'https://www.95mm.vip';

module.exports = {
    rootUrl,
    ProcessItems: async (ctx, title, currentUrl) => {
        const response = await got({
            method: 'get',
            url: currentUrl,
            headers: {
                Referer: rootUrl,
            },
        });

        const $ = load(response.data);

        let items = $('div.list-body')
            .toArray()
            .map((item) => {
                item = $(item);

                const a = item.find('a');

                return {
                    title: a.text(),
                    link: a.attr('href'),
                    guid: a.attr('href').replace('95mm.vip', '95mm.org'),
                };
            });

        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const images = detailResponse.data.match(/src": '(.*?)',"width/g);

                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        images: images.map((i) => i.split("'")[1].replaceAll('\\/', '/')),
                    });

                    return item;
                })
            )
        );

        return {
            title: `${title} - MM范`,
            link: currentUrl,
            item: items,
        };
    },
};
