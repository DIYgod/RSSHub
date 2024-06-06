import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ai/:category?',
    categories: ['university'],
    example: '/ruc/ai',
    parameters: { category: '分类，见下方说明，默认为首页公告' },
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
            source: ['ai.ruc.edu.cn/'],
        },
    ],
    name: '高瓴人工智能学院',
    maintainers: ['yinhanyan'],
    handler: async (ctx) => {
        const category = ctx.req.param('category')?.replace(/-/g, '/') ?? 'newslist/notice';
        const baseURL = `http://ai.ruc.edu.cn/${category}/`;
        const index_url = baseURL + 'index.htm';
        const response = await ofetch(index_url);
        const $ = load(response);
        const page_title = $('title').text();
        const list = $('div.fr li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const link = baseURL + a.attr('href');
                return {
                    link,
                };
            });

        const items = await Promise.all(
            list.map(async (item) => {
                try {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    const title = $('title').text();
                    item.title = title;
                    const title_div = $('div.tit');
                    const date = title_div.find('span').first().text();
                    item.pubDate = timezone(parseDate(/\d+-\d+-\d+/.exec(date)[0]), +8);
                    const frame = $('div.fr');
                    item.description = frame
                        .children()
                        .slice(3)
                        .map((i, el) => $.html(el))
                        .get()
                        .join(',');
                } catch {
                    item.description = '';
                }

                return item;
            })
        );

        return {
            title: page_title,
            link: index_url,
            icon: `https://www.ruc.edu.cn/favicon.ico`,
            logo: `http://ai.ruc.edu.cn/images/cn_ruc_logo.png`,
            item: items,
        };
    },
    url: 'ai.ruc.edu.cn/',
    description: `:::tip
  分类字段处填写的是对应中国人民大学高瓴人工智能学院分类页网址中介于 **\`http://ai.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段，并将其中的 \`/\` 修改为 \`-\`。

  如 [中国人民大学高瓴人工智能学院 - 新闻公告 - 学院新闻](http://ai.ruc.edu.cn/newslist/newsdetail/index.htm) 的网址为 \`http://ai.ruc.edu.cn/newslist/newsdetail/index.htm\` 其中介于 **\`http://ai.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段为 \`newslist/newsdetail\`。随后，并将其中的 \`/\` 修改为 \`-\`，可以得到 \`newslist-newsdetail\`。所以最终我们的路由为 [\`/ruc/ai/newslist-newsdetail\`](https://rsshub.app/ruc/ai/newslist-newsdetail)
    :::`,
};
