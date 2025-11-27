import path from 'node:path';

import { load } from 'cheerio';

import { config } from '@/config';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const apiUrl = 'https://api.followin.io';
const baseUrl = 'https://followin.io';
const favicon = `${baseUrl}/favicon.ico`;

const getBParam = (lang) => ({
    a: 'web',
    b: '',
    c: lang,
    d: 0,
    e: '',
    f: '',
    g: '',
    h: '0.1.0',
    i: 'official',
});

const getBuildId = (tryGet) =>
    tryGet(
        'followin:buildId',
        async () => {
            const { data: pageResponse } = await got(baseUrl);
            const $ = load(pageResponse);
            const { buildId } = JSON.parse($('script#__NEXT_DATA__').text());
            return buildId;
        },
        config.cache.routeExpire,
        false
    );

const getGToken = (tryGet) =>
    tryGet('followin:gtoken', async () => {
        const { data } = await got.post(`${apiUrl}/user/gtoken`);
        return data.data.gtoken;
    });

const parseList = (list, lang, buildId) =>
    list.map((item) => ({
        title: item.translated_title || item.title,
        description: item.translated_content || item.content,
        link: `${baseUrl}/${lang === 'en' ? '' : `${lang}/`}feed/${item.id}`,
        pubDate: parseDate(item.publish_time, 'x'),
        category: item.tags.map((tag) => tag.name),
        author: item.nickname,
        nextData: `${baseUrl}/_next/data/${buildId}/${lang}/feed/${item.id}.json`,
    }));

const parseItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data } = await got(item.nextData);

        const { queries } = data.pageProps.dehydratedState;
        const info = queries.find((q) => q.queryKey[0] === '/feed/info').state;
        const thread = queries.find((q) => q.queryKey[0] === '/feed/thread');
        item.description = thread
            ? art(path.join(__dirname, 'templates/thread.art'), {
                  list: thread.state.data.list,
              })
            : info.data.translated_full_content || info.data.full_content;

        item.updated = parseDate(info.dataUpdatedAt, 'x');
        item.category = [...new Set([...item.category, ...info.data.tags.map((tag) => tag.name)])];

        return item;
    });

export { apiUrl, baseUrl, favicon, getBParam, getBuildId, getGToken, parseItem, parseList };
