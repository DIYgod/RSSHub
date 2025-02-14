import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/index/:id?/:type?/:keyword?',
    name: '首页',
    maintainers: ['nczitzk', 'cscnk52'],
    handler,
    example: '/6park/index',
    parameters: { id: '分站，见下表，默认为史海钩沉', type: '类型，可选值为 gold、type，默认为空', keyword: '关键词，可选，默认为空' },
    radar: [
        {
            source: ['club.6parkbbs.com/:id/index.php', 'club.6parkbbs.com/'],
            target: '/:id?',
        },
    ],
    description: `| 婚姻家庭 | 魅力时尚 | 女性频道 | 生活百态 | 美食厨房 | 非常影音 | 车迷沙龙 | 游戏天地 | 卡通漫画 | 体坛纵横 | 运动健身 | 电脑前线 | 数码家电 | 旅游风向 | 摄影部落 | 奇珍异宝 | 笑口常开 | 娱乐八卦 | 吃喝玩乐 | 文化长廊 | 军事纵横 | 百家论坛 | 科技频道 | 爱子情怀 | 健康人生 | 博论天下 | 史海钩沉 | 网际谈兵 | 经济观察 | 谈股论金 | 杂论闲侃 | 唯美乐园 | 学习园地 | 命理玄机 | 宠物情缘 | 网络歌坛 | 音乐殿堂 | 情感世界 |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| life9    | life1    | chan10   | life2    | life6    | fr       | enter7   | enter3   | enter6   | enter5   | sport    | know1    | chan6    | life7    | chan8    | page     | enter1   | enter8   | netstar  | life10   | nz       | other    | chan2    | chan5    | life5    | bolun    | chan1    | military | finance  | chan4    | pk       | gz1      | gz2      | gz3      | life8    | chan7    | enter4   | life3    |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'chan1';
    const type = ctx.req.param('type') ?? '';
    const keyword = ctx.req.param('keyword') ?? '';

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://club.6parkbbs.com';
    const indexUrl = `${rootUrl}/${id}/index.php`;
    const currentUrl = `${indexUrl}${type === '' || keyword === '' ? '' : type === 'gold' ? '?app=forum&act=gold' : `?action=search&act=threadsearch&app=forum&${type}=${keyword}&submit=${type === 'type' ? '查询' : '栏目搜索'}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#d_list ul li, #thread_list li, .t_l .t_subject')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                link: `${rootUrl}/${id}/${a.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.title = content('title').text().replace(' -6park.com', '');
                item.author = detailResponse.data.match(/送交者: .*>(.*)<.*\[/)[1];
                item.pubDate = timezone(parseDate(detailResponse.data.match(/于 (.*) 已读/)[1], 'YYYY-MM-DD h:m'), +8);
                item.description = content('pre')
                    .html()
                    .replaceAll('<p></p>', '')
                    .replaceAll(/<font color="#E6E6DD">6park.com<\/font>/g, '');

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
