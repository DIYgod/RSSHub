const { parseList } = require('./util');
const baseUrl = 'https://www.zaobao.com';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'realtime';
    const section = ctx.params.section ?? 'china';
    const sectionLink = `/${type}/${section}`;

    const { title, resultList } = await parseList(ctx, sectionLink);

    ctx.state.data = {
        title: `《联合早报》${title}`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    };
};
