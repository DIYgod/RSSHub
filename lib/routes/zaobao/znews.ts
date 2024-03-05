// @ts-nocheck
const { parseList } = require('./util');
const baseUrl = 'https://www.zaobao.com';

export default async (ctx) => {
    const section = ctx.req.param('section');

    let info;
    let sectionLink;

    switch (section) {
        case 'singapore':
            info = '新加坡';
            sectionLink = '/news/singapore';

            break;

        case 'world':
            info = '国际';
            sectionLink = '/news/world';

            break;

        case 'sea':
            info = '东南亚';
            sectionLink = '/news/sea';

            break;

        case 'sports':
            info = '体育';
            sectionLink = '/news/sports';

            break;

        case 'china':
        default:
            info = '中国';
            sectionLink = '/news/china';
    }

    const { resultList } = await parseList(ctx, sectionLink);

    ctx.set('data', {
        title: `《联合早报》-${info}-新闻`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    });
};
