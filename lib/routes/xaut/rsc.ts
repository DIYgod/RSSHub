import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/rsc/:category?',
    categories: ['university'],
    example: '/xaut/rsc/tzgg',
    parameters: { category: '通知类别，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '人事处',
    maintainers: ['mocusez', 'light0926'],
    handler,
    description: `::: warning
  有些内容指向外部链接，目前只提供这些链接，不提供具体内容，去除 jwc 和 index 的修改
:::

| 通知公告 | 工作动态 |
| :------: | :------: |
|   tzgg   |   gzdt   |`,
};

async function handler(ctx) {
    let category = ctx.req.param('category');
    // 这里的category是个形参
    const dic_html = { tzgg: 'tzgg.htm', gzdt: 'gzdt.htm' };
    const dic_title = { tzgg: '通知公告', gzdt: '工作动态' };

    // 设置默认值
    if (dic_title[category] === undefined) {
        category = 'tzgg';
    }

    const response = await got({
        method: 'get',
        url: 'http://renshichu.xaut.edu.cn/' + dic_html[category],
    });
    const data = response.body;
    const $ = load(data);

    // 这个列表指通知公告详情列表
    const list = $('.vsb-space.n_right .list .cleafix')
        .map((_, item) => {
            item = $(item);
            // 工作动态栏目里有一些是外链，这里做个判断
            const a = item.find('.list_wen a').eq(0).attr('href');
            const link = a.slice(0, 4) === 'http' ? a : 'http://renshichu.xaut.edu.cn/' + a;
            // 这里jquery比较长，引几个中间变量倒是方便阅读，但是我还是觉得不需要
            const title = item.find('.list_wen a.tit').text();
            return {
                title,
                link,
            };
        })
        .get();
    return {
        // 源标题
        title: '西安理工大学人事处-' + dic_title[category],
        // 源链接
        link: 'http://renshichu.xaut.edu.cn',
        // 源说明
        description: `西安理工大学人事处-` + dic_title[category],
        // 遍历此前获取的数据
        item: await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    //  下面的if判断是否属于外链，使用切片的方式来判断，并不优雅，先用着吧
                    if (item.link.slice(0, 16) === 'http://renshichu') {
                        // 不属于外链
                        const res = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = load(res.body);
                        item.description = content('.vsb-space form[name]').html();
                        item.pubDate = parseDate(content('.vsb-space form[name] h3 span:contains(时间)').text().slice(3));
                    } else {
                        item.description = '这是一个外链("▔□▔)/("▔□▔)/所以你没法直接看到内容' + item.link;
                    }
                    return item;
                })
            )
        ),
    };
}
