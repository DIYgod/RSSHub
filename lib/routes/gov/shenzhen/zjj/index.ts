// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const config = {
    tzgg: {
        link: 'tzgg/',
        title: '通知公告',
    },
};

export default async (ctx) => {
    const baseUrl = 'http://zjj.sz.gov.cn/xxgk/';
    const cfg = config[ctx.req.param('caty')];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const currentUrl = new URL(cfg.link, baseUrl).href;

    const { data: response } = await got(currentUrl);
    const $ = load(response);

    const items = $('div.listcontent_right ul li')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: a.attr('href'),
                pubDate: timezone(parseDate(item.find('span').first().text(), 'YY-MM-DD'), 0),
            };
        });

    ctx.set('data', {
        title: '深圳市住房和建设局 - ' + cfg.title,
        link: currentUrl,
        item: items,
    });
};
