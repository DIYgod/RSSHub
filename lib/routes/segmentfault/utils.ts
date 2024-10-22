import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import { getAcwScV2ByArg1 } from '../5eplay/utils';

const host = 'https://segmentfault.com';

const acw_sc__v2 = (link, tryGet) =>
    tryGet(
        'segmentfault:acw_sc__v2',
        async () => {
            const response = await ofetch(link);

            let acw_sc__v2 = '';
            const matches = response.match(/var arg1='(.*?)';/);
            if (matches) {
                acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
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
        pubDate: parseDate(item.created || item.modified, 'X'),
        description: item.excerpt,
    }));

const parseItems = (cookie, item, tryGet) =>
    tryGet(item.link, async () => {
        let response;
        try {
            response = await ofetch(item.link, {
                headers: {
                    cookie: `acw_sc__v2=${cookie};`,
                },
            });
            const content = load(response);

            item.description = content('article').html();
            item.category = content('.badge-tag')
                .toArray()
                .map((item) => content(item).text());
        } catch {
            // ignore
        }

        return item;
    });

export { host, acw_sc__v2, parseList, parseItems };
