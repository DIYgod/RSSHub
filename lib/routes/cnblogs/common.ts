import { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: ['/aggsite/topdiggs', '/aggsite/topviews', '/aggsite/headline', '/cate/:type', '/pick'],
    categories: ['blog'],
    example: '/cnblogs/aggsite/topdiggs',
    parameters: {},
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
            source: ['www.cnblogs.com/aggsite/topdiggs'],
        },
    ],
    name: '10 天推荐排行榜',
    maintainers: ['hujingnb'],
    handler,
    url: 'www.cnblogs.com/pick',
    description: `在博客园主页的分类出可查看所有类型。例如，go 的分类地址为: \`https://www.cnblogs.com/cate/go/\`, 则: [\`/cnblogs/cate/go\`](https://rsshub.app/cnblogs/cate/go)`,
    url: 'www.cnblogs.com/aggsite/headline',
};

async function handler(ctx) {
    const link = `https://www.cnblogs.com${getSubPath(ctx)}`;
    const response = await got(link);
    const data = response.data;

    const $ = load(data);
    const list = $('#post_list article')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.post-item-title').text(),
                link: item.find('.post-item-title').attr('href'),
                pubDate: timezone(parseDate(item.find('.post-item-foot .post-meta-item span').text() || item.find('.editorpick-item-meta').text(), ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD']), +8),
                description: item.find('.post-item-summary').text(),
                author: item.find('.post-item-author span').text(),
            };
        });

    return {
        title: $('title').text(),
        link,
        item: list,
    };
}
