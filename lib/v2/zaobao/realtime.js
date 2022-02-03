const { parseList } = require('./util');
const baseUrl = 'https://www.zaobao.com';

module.exports = async (ctx) => {
    const section = ctx.params.section || 'china';

    let name = '中港台';
    let sectionLink = '/realtime/china';
    if (section === 'singapore') {
        name = '新加坡';
        sectionLink = '/realtime/singapore';
    } else if (section === 'world') {
        name = '国际';
        sectionLink = '/realtime/world';
    } else if (section === 'zfinance') {
        name = '财经';
        // this is for HK version; for SG version, it's redirected to
        // /realtime/finance
        sectionLink = '/finance/realtime';
    }

    const { resultList } = await parseList(ctx, sectionLink);

    ctx.state.data = {
        title: `《联合早报》-${name}-即时`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    };
};
