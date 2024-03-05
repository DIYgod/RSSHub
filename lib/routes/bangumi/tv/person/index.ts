// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    // bangumi.tv未提供获取“人物信息”的API，因此仍需要通过抓取网页来获取
    const personID = ctx.req.param('id');
    const link = `https://bgm.tv/person/${personID}/works?sort=date`;
    const { data: html } = await got(link);
    const $ = load(html);
    const personName = $('.nameSingle a').text();
    const works = $('.item')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $workEl = $el.find('.l');
            return {
                work: $workEl.text(),
                workURL: `https://bgm.tv${$workEl.attr('href')}`,
                workInfo: $el.find('p.info').text(),
                job: $el.find('.badge_job').text(),
            };
        });

    ctx.set('data', {
        title: `${personName}参与的作品`,
        link,
        item: works.map((c) => {
            const match = c.workInfo.match(/(\d{4}[年-]\d{1,2}[月-]\d{1,2})/);
            return {
                title: `${personName}以${c.job}的身份参与了作品《${c.work}》`,
                description: c.workInfo,
                link: c.workURL,
                pubDate: match ? parseDate(match[1], ['YYYY-MM-DD', 'YYYY-M-D']) : null,
            };
        }),
    });
};
