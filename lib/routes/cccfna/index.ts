import { Route, DataItem } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:category/:type?',
    categories: ['government'],
    example: '/cccfna/meirigengxin',
    parameters: {
        category: '文章种类，即一级分类，详情见下表',
        type: '文章类型，即二级分类，详情见下表',
    },
    radar: [
        {
            source: ['www.cccfna.org.cn/:category/:type?'],
        },
    ],
    description: `
::: tip
存在**二级分类**的**一级分类**不能单独当作参数，如：\`/cccfna/hangyezixun\`
:::

文章的目录分级如下:

- shanghuidongtai（商会通知）
- meirigengxin（每日更新）
- tongzhigonggao（通知公告）
- hangyezixun（行业资讯）
  - zhengcedaohang（政策导航）
  - yujinxinxi（预警信息）
  - shichangdongtai（市场动态）
  - gongxuxinxi（供需信息）
- maoyitongji（贸易统计）
  - tongjikuaibao（统计快报）
  - hangyetongji（行业统计）
  - guobiemaoyi（国别贸易）
  - maoyizhinan（贸易指南）
- nongchanpinbaogao（农产品报告）
  - nongchanpinyuebao（农产品月报）
  - zhongdianchanpinyuebao（重点产品月报）
  - zhongdianchanpinzoushi（重点产品走势）`,
    name: '资讯信息',
    maintainers: ['hualiong'],
    handler: async (ctx) => {
        const { category, type } = ctx.req.param();
        const baseURL = `https://www.cccfna.org.cn/${category}${type ? '/' + type : ''}`;

        const response = await ofetch(baseURL);
        const $ = load(response);

        const list: DataItem[] = $('body > script')
            .last()
            .text()
            .match(new RegExp(`https://www.cccfna.org.cn/${category}/.+?.html`, 'g'))!
            .slice(0, 15)
            .map((link) => ({ title: '', link }));

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const $ = load(await ofetch(item.link!));
                    const content = $('.list_cont');

                    item.title = content.find('.title').text();
                    item.pubDate = timezone(parseDate(content.find('.tip > .time').text(), '发布时间：YYYY-MM-DD'), +8);
                    item.description = content.find('#article-content').html()!;

                    return item;
                })
            )
        );

        return {
            title: $('head > title').text(),
            link: baseURL,
            item: items as DataItem[],
        };
    },
};
