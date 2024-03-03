// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

const rootUrl = 'https://jobs.douban.com';

const titleMap = {
    social: '社会招聘',
    campus: '校园招聘',
    intern: '实习生招聘',
};

export default async (ctx) => {
    const type = ctx.req.param('type');
    const url = `${rootUrl}/jobs/${type}`;

    const response = await got.get(url);
    const $ = load(response.data);
    const list = $('div.mod.position');

    const items = list
        .map((_, item) => ({
            title: $(item).find('h3').text(),
            link: `${url}#${$(item).find('h3').attr('id')}`,
            description: $(item).find('div.bd').html(),
        }))
        .get();

    ctx.set('data', {
        title: `豆瓣${titleMap[type]}`,
        link: url,
        item: items,
    });
};
