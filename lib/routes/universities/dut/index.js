import got from '~/utils/got.js';
import cheerio from 'cheerio';
import {parseDate} from '~/utils/parse-date';
import timezone from '~/utils/timezone';
import subsiteDic from './subsite.js';
export default async (ctx) => {
    const subsiteMap = subsiteDic[ctx.params.subsite];
    const typeMap = subsiteMap.typeMap[ctx.params.type];
    const frontUrl = typeMap.url;
    const {
        basePath
    } = typeMap;

    const {
        data
    } = await got({
        method: 'get',
        url: frontUrl,
    });
    const $ = cheerio.load(data);
    const list = $(subsiteMap.listSelector)
        .map((index, item) => {
            item = $(item);
            return {
                title: subsiteMap.titleMethod(item),
                // description,
                link: subsiteMap.linkMethod(item),
                pubDate: timezone(parseDate(subsiteMap.pubDateMethod(item), 'YYYY/MM/DD'), +8),
            };
        })
        .get();

    const entries = await Promise.all(
        list.map(async (item) => {
            const { title, link, pubDate } = item;
            const entryUrl = basePath + link;

            const cache = await ctx.cache.tryGet(entryUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: entryUrl,
                });

                const $ = cheerio.load(response.data);
                const description = subsiteMap.descriptionMethod($);
                const entry = {
                    title,
                    link,
                    pubDate,
                    description,
                };
                return JSON.stringify(entry);
            });
            return JSON.parse(cache);
        })
    );

    ctx.state.data = {
        title: typeMap.title,
        link: frontUrl,
        item: entries,
    };
};
