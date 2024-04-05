import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const rsksUrl = 'https://rlsbj.cq.gov.cn/ywzl/rsks/tzgg_109374/';
export const route: Route = {
    path: '/chongqing/rsks',
    categories: ['government'],
    example: '/gov/chongqing/rsks',
    radar: [
        {
            source: ['rlsbj.cq.gov.cn/'],
        },
    ],
    name: '重庆市人民政府 人力社保局 - 人事考试通知',
    maintainers: ['Mai19930513'],
    handler,
    url: 'rlsbj.cq.gov.cn/',
};

async function handler() {
    const { data: response } = await got(rsksUrl);
    const $ = load(response);
    // 获取考试信息标题
    const list = $('div.page-list .tab-item > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').first();
            return {
                title: title.text(),
                link: `${rsksUrl}${title.attr('href')}`,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    // 获取考试信息正文
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.pubDate = parseDate($('meta[name="PubDate"]').attr('content')) ?? item.pubDate;
                item.description = $('.view.TRS_UEDITOR.trs_paper_default.trs_word').first().html();
                return item;
            })
        )
    );
    return {
        title: '重庆人事考试通知公告',
        link: rsksUrl,
        item: items,
    };
}
