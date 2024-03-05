// @ts-nocheck
const { parseList } = require('./util');
const baseUrl = 'https://www.zaobao.com';

export default async (ctx) => {
    const section = ctx.req.param('section') ?? 'china';

    let name;
    let sectionLink;
    switch (section) {
        case 'singapore':
            name = '新加坡';
            sectionLink = '/realtime/singapore';

            break;

        case 'world':
            name = '国际';
            sectionLink = '/realtime/world';

            break;

        case 'zfinance':
            name = '财经';
            // this is for HK version; for SG version, it's redirected to
            // /realtime/finance
            sectionLink = '/finance/realtime';

            break;

        case 'china':
        default:
            name = '中港台';
            sectionLink = '/realtime/china';
            break;
    }

    const { resultList } = await parseList(ctx, sectionLink);

    ctx.set('data', {
        title: `《联合早报》-${name}-即时`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    });
};
