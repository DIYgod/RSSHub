// @ts-nocheck
import got from '@/utils/got';
const { generateData } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const {
        data: { data },
    } = await got({
        method: 'get',
        url: `https://api.zhihu.com/pins/${id}/moments?limit=10&offset=0`,
    });

    ctx.set('data', {
        title: `${data[0].target.author.name}的知乎想法`,
        link: `https://www.zhihu.com/people/${id}/pins`,
        item: generateData(data),
    });
};
