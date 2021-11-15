import got from '~/utils/got.js';
import iconv from 'iconv-lite'
import cheerio from 'cheerio';
import { parseDate } from '~/utils/parse-date.js'
import timezone from '~/utils/timezone.js';

const baseUrl = 'http://jwc1.dlu.edu.cn/';

export default async (ctx) => {
    let resp = await got({ url: baseUrl, responseType: 'buffer' });
    const index = cheerio.load(iconv.decode(resp.data, 'utf-8'));

    const items = index('td[valign="top"]>table[cellspacing="3"][width="100%"] tr')
        .toArray()
        .map((elem) => {
            const link = new URL(index('a', elem).attr('href'), baseUrl).href;
            return ctx.cache.tryGet(link, async () => {
                resp = await got({ url: link, responseType: 'buffer' });
                const article = cheerio.load(iconv.decode(resp.data, 'utf-8'), { decodeEntities: false });
                return {
                    link: link.toString(),
                    title: index('a', elem).attr('title'),
                    pubDate: timezone(parseDate(article('td[height="28"]').text(), 'YYYY年MM月DD日 HH:mm'), +8).toUTCString(),
                    description: article('form[name="_newscontent_fromname"] > div > *:not(table)')
                        .toArray()
                        .map((it) => article(it).html())
                        .join('\n'),
                };
            });
        });

    ctx.state.data = {
        link: baseUrl,
        title: '大连大学教务处',
        item: await Promise.all(items),
    };
};
