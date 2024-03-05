// @ts-nocheck
import got from '@/utils/got';
// import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { data } = await got('https://www.sec-wiki.com/weekly/index');
    const items = [...data.matchAll(/\/weekly\/(\d+)">(.+?)<\/a><\/h5>\s*<p>(.+?)<\/p>/g)].map((item) => ({
        title: item[2],
        link: `https://www.sec-wiki.com/weekly/${item[1]}`,
        description: item[3],
    }));
    ctx.set('data', {
        title: 'SecWiki-安全维基',
        link: 'https://www.sec-wiki.com/',
        item: items,
    });
};
