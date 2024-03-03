// @ts-nocheck
const { parseList } = require('./util');
const baseUrl = 'https://www.zaobao.com';

export default async (ctx) => {
    const sectionLink = `/interactive-graphics`;

    const { resultList } = await parseList(ctx, sectionLink);

    ctx.set('data', {
        title: `《联合早报》互动新闻`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    });
};
