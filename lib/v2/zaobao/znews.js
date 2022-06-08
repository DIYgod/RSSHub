const { parseList } = require('./util');
const baseUrl = 'https://www.zaobao.com';

module.exports = async (ctx) => {
    const section = ctx.params.section;

    let info = '中国';
    let sectionLink = '/news/china';

    if (section === 'singapore') {
        info = '新加坡';
        sectionLink = '/news/singapore';
    } else if (section === 'world') {
        info = '国际';
        sectionLink = '/news/world';
    } else if (section === 'sea') {
        info = '东南亚';
        sectionLink = '/news/sea';
    } else if (section === 'sports') {
        info = '体育';
        sectionLink = '/news/sports';
    }

    const { resultList } = await parseList(ctx, sectionLink);

    ctx.state.data = {
        title: `《联合早报》-${info}-新闻`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    };
};
