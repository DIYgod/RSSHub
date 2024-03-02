import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
export default async (ctx) => {
    const category_dict = {
        ggtz: '公告通知',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async () => {
            const response = await got(`https://zcc.nju.edu.cn/sy/tzzhxx/index.html`);

            const data = response.data;
            const $ = load(data);
            let script = $('ul.clearfix').find('script');
            script = script['1'].children[0].data;

            const start = script.indexOf('[');
            const end = script.lastIndexOf(']');
            const t = JSON.parse(script.substring(start, end + 1));

            // only read first page
            return t[0].infolist.map((item) => ({
                title: item.title,
                description: item.summary,
                link: item.url,
                author: item.username,
                pubDate: parseDate(item.releasetime, 'x'),
            }));
        })
    );

    ctx.set('data', {
        title: '资产管理处-公告通知',
        link: 'https://zcc.nju.edu.cn/sy/tzzhxx/index.html',
        item: items[0],
    });
};
