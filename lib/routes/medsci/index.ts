import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:sid?/:tid?',
    categories: ['traditional-media'],
    example: '/medsci',
    parameters: { sid: '科室，见下表，默认为推荐', tid: '亚专业，可在对应科室页 URL 中找到，默认为该科室的全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    let sid = ctx.req.param('sid') ?? '';
    const tid = ctx.req.param('tid') ?? '';

    sid = sid === 'recommend' ? '' : sid;

    const rootUrl = 'https://www.medsci.cn';
    const currentUrl = `${rootUrl}${sid ? `/department/details?s_id=${sid}&module=article${tid ? `&t_id=${tid}` : ''}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#articleList')
        .find('.ms-link')
        .toArray()
        .map((item) => {
            item = $(item);

            const pubDate = item.parent().parent().find('.item-meta-item').first().text();

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href').replace(/;jsessionid=[\dA-Z]+/, '')}`,
                pubDate: pubDate.indexOf('-') > 0 ? parseDate(pubDate) : parseRelativeDate(pubDate),
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

                const pubDateMatches = detailResponse.data.match(/"publishedTime":"(.*)","publishedTimeString"/);

                item.author = content('.name').text();
                item.description = content('#content').html();
                item.pubDate = pubDateMatches ? parseDate(pubDateMatches[1]) : item.pubDate;
                item.category =
                    content('meta[name="keywords"]')
                        .attr('content')
                        ?.split(/,|，/)
                        .filter((c) => c !== '' && c !== 'undefined') ?? [];

                return item;
            })
        )
    );

    return {
        title: `${sid ? $('.department-header-active').text() : '推荐'} -${tid ? ` ${$('.department-keywords-ul .active').text()} -` : ''} MedSci.cn`,
        link: currentUrl,
        item: items,
    };
}
