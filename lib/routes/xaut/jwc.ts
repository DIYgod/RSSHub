import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/xaut/jwc/tzgg',
    parameters: { category: '通知类别，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['mocusez'],
    handler,
    description: `::: warning
  有些内容需使用校园网或 VPN 访问知行网获取
:::

| 通知公告 | 新闻动态 | 规章制度 | 竞赛结果公示 | 竞赛获奖通知 | 竞赛信息 | 公开公示 |
| :------: | :------: | :------: | :----------: | :----------: | :------: | :------: |
|   tzgg   |   xwdt   |   gzzd   |     jggs     |     jsjg     |   jsxx   |   gkgs   |`,
};

async function handler(ctx) {
    let category = ctx.req.param('category');
    const rootUrl = 'http://jwc.xaut.edu.cn/';
    const dic_html = { tzgg: 'tzgg.htm', xwdt: 'xwdt.htm', gzzd: 'gzzd.htm', jggs: 'xkjs/jggs.htm', jsjg: 'xkjs/jsjg.htm', jsxx: 'xkjs/jsxx.htm', gkgs: 'gkgs.htm' };
    const dic_title = { tzgg: '通知公告', xwdt: '新闻动态', gzzd: '规章制度', jggs: '竞赛结果公示', jsjg: '竞赛获奖通知', jsxx: '竞赛信息', gkgs: '公开公示' };

    // 设置默认值
    if (dic_title[category] === undefined) {
        category = 'tzgg';
    }

    const response = await got({
        method: 'get',
        url: rootUrl + dic_html[category],
    });
    const data = response.body;
    const $ = load(data);

    const list = $('.main_conRCb a')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const link = item
                .attr('href')
                .replace(/^\.\./, rootUrl)
                .replace(/^(info)/, rootUrl + 'info');
            return {
                title: item.find('em').text(),
                link,
                pubDate: parseDate(item.find('span').text()),
            };
        })
        .get();

    return {
        // 源标题
        title: '西安理工大学教务处-' + dic_title[category],
        // 源链接
        link: rootUrl,
        // 源说明
        description: `西安理工大学教务处-` + dic_title[category],
        // 遍历此前获取的数据
        item: await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (!item.link.match('zhixing.xaut.edu.cn') && !item.link.match('xinwen.xaut.edu.cn')) {
                        const res = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = load(res.body);
                        item.description = content('#vsb_content').html();
                    } else {
                        item.description = '请在校内或校园VPN内查看内容';
                    }
                    return item;
                })
            )
        ),
    };
}
