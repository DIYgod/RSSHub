// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.chinaventure.com.cn';

const nodes = {
    78: '商业深度',
    80: '资本市场',
    83: '5G',
    111: '健康',
    110: '教育',
    112: '地产',
    113: '金融',
    114: '硬科技',
    116: '新消费',
};

export default async (ctx) => {
    const id = ctx.req.param('id');
    const currentUrl = rootUrl.concat(id ? `/news/${id}.html` : '/index.html');

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const list = $('a', '.common_newslist_pc')
        .filter(function () {
            return $(this).attr('href');
        })
        .map((_, item) => ({
            link: rootUrl + $(item).attr('href'),
        }))
        .get()
        .slice(0, ctx.req.query('limit') ? (Number.parseInt(ctx.req.query('limit')) > 20 ? 20 : Number.parseInt(ctx.req.query('limit'))) : 20);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                item.title = content('h1.maintitle_pc').text();
                item.description = content('div.article_slice_pc').html();
                item.author = content('div.source_author').text();
                item.pubDate = timezone(parseDate(content('div.releaseTime').text()), +8);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${nodes[id] ?? '推荐'}-投中网`,
        link: currentUrl,
        description: '投中网是国内领先的创新经济信息服务平台，拥有立体化媒体矩阵，十多年行业深耕，为创新经济领域核心人群提供深入、独到的智识和洞见，在私募股权投资行业和创新商业领域均拥有权威影响力。',
        language: 'zh-cn',
        item: items,
    });
};
