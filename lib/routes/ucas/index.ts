// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://zhaopin.ucas.ac.cn';

const idMap = {
    jxkyrc: 3,
    glzcrc: 4,
    ktxmpy: 5,
    bsh: 6,
};

const titleMap = {
    jxkyrc: '教学科研人才',
    glzcrc: '管理支撑人才',
    ktxmpy: '课题项目聘用',
    bsh: '博士后',
};

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'bsh';
    const url = `${rootUrl}/gjob/login.do?method=contentList&t=zhaopin&c=${idMap[type]}`;
    const response = await got.get(url);

    const $ = load(response.data);
    const list = $('#col1_content > div.list > ul > li').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const title = $(item).find('a').attr('title');
            const link = rootUrl + $(item).find('a').attr('href');
            const pubDate = parseDate($(item).find('span').text());

            const desc = await cache.tryGet(link, async () => {
                const response = await got.get(link);
                const pageContent = load(response.data);

                const descDeadline = pageContent('#col1_content > div.content_head > div.top').html();
                const descContent = pageContent('#col1_content > div.entry').html();
                const desc = descDeadline + descContent;
                return desc;
            });

            return {
                title,
                link,
                pubDate,
                description: desc,
            };
        })
    );

    ctx.set('data', {
        title: `中国科学院大学招聘 - ${titleMap[type]}`,
        link: url,
        item: items,
    });
};
