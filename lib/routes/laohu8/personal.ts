// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.laohu8.com';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const url = `${rootUrl}/personal/${id}`;

    const response = await got(url);
    const $ = load(response.data);
    const author = $('h2.personal-name').text();
    const data = JSON.parse($('#__APP_DATA__').text()).tweetList;

    const items = await Promise.all(
        data.map((item) =>
            cache.tryGet(item.link, () => ({
                title: item.title,
                description: String(item.htmlText).replaceAll('\n', '<br><br>'),
                link: `${rootUrl}/post/${item.id}`,
                pubDate: parseDate(item.gmtCreate),
            }))
        )
    );

    ctx.set('data', {
        title: `老虎社区 - ${author} 个人社区`,
        link: url,
        item: items,
    });
};
