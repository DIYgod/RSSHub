// @ts-nocheck
const zlib = require('zlib');
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
const { getAcwScV2ByArg1 } = require('../5eplay/utils');

const host = 'https://segmentfault.com';

const acw_sc__v2 = (link, tryGet) =>
    tryGet(
        'segmentfault:acw_sc__v2',
        async () => {
            const response = await got(link, {
                decompress: false,
            });

            const unzipData = zlib.createUnzip();
            unzipData.write(response.body);

            let acw_sc__v2 = '';
            for await (const data of unzipData) {
                const strData = data.toString();
                const matches = strData.match(/var arg1='(.*?)';/);
                if (matches) {
                    acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
                    break;
                }
            }
            return acw_sc__v2;
        },
        config.cache.routeExpire,
        false
    );

const parseList = (data) =>
    data.map((item) => ({
        title: item.title,
        link: new URL(item.url, host).href,
        author: item.user.name,
        pubDate: parseDate(item.created, 'X'),
    }));

const parseItems = (cookie, item, tryGet) =>
    tryGet(item.link, async () => {
        const response = await got(item.link, {
            headers: {
                cookie: `acw_sc__v2=${cookie};`,
            },
        });
        const content = load(response.data);

        item.description = content('article').html();
        item.category = content('.badge-tag')
            .toArray()
            .map((item) => content(item).text());

        return item;
    });

module.exports = {
    host,
    acw_sc__v2,
    parseList,
    parseItems,
};
