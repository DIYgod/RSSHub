import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:category?',
    categories: ['anime'],
    example: '/dmzj/news/donghuaqingbao',
    parameters: { category: '类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.dmzj.com/'],
            target: '/news',
        },
    ],
    name: '新闻站',
    maintainers: ['vzz64'],
    handler,
    url: 'news.dmzj.com/',
    description: `| 漫画情报      | 轻小说情报          | 动漫周边       | 声优情报        | 音乐资讯    | 游戏资讯   | 美图欣赏      | 漫展情报       | 大杂烩  |
| ------------- | ------------------- | -------------- | --------------- | ----------- | ---------- | ------------- | -------------- | ------- |
| manhuaqingbao | qingxiaoshuoqingbao | manhuazhoubian | shengyouqingbao | yinyuezixun | youxizixun | meituxinshang | manzhanqingbao | dazahui |`,
};

async function handler(ctx) {
    const url = `https://news.dmzj.com/${ctx.req.param('category') || ''}`;
    const $ = load((await got(url)).data);
    return {
        title: $('title').text(),
        link: url,
        item: $('.briefnews_con_li .li_img_de')
            .toArray()
            .map((item) => ({
                title: $(item).find('h3 a').text(),
                link: $(item).find('h3 a').attr('href'),
                author: $(item).find('.head_con_p_o span:nth-child(3)').text().split('：')[1],
                pubDate: timezone(parseDate($(item).find('.head_con_p_o span').first().text(), 'YYYY-MM-DD HH:mm'), +8),
                description: $(item).find('p.com_about').text(),
                category: $(item)
                    .find('.u_comfoot a .bqwarp')
                    .toArray()
                    .map((item) => $(item).text()),
            })),
    };
}
