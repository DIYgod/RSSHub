const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://www.caac.gov.cn';
    const apiUrl = new URL(`caacgov/jsonp/messageBoard/visit/get${category ? 'CJWT' : ''}List`, rootUrl).href;
    const currentUrl = new URL('HDJL/', rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            callbackparam: 'jsonp_messageBoard_getList',
            infoMess: category,
            pageIndex: 1,
        },
    });

    const items = JSON.parse(response.match(/jsonp_messageBoard_getList\((.*?)\)$/)[1])
        .returnData.root.slice(0, limit)
        .map((item) => ({
            title: item.infoMess.replace(/<\/?em>/g, ''),
            link: new URL(`index_180.html?info=${item.id}&type=id`, rootUrl).href,
            description: art(path.join(__dirname, 'templates/description.art'), {
                item,
            }),
            author: `${item.gname}/${item.feedbackName}`,
            category: [item.messageType],
            guid: `caac-cjwt#${item.id}`,
            pubDate: timezone(parseDate(item.createDate), +8),
            updated: timezone(parseDate(item.feedbackDate), +8),
        }));

    const author = '中国民用航空局';
    const image = new URL('images/Logo2.png', rootUrl).href;
    const icon = new URL('images/weixinLogo.jpg', rootUrl).href;
    const subtitle = '公众留言';

    ctx.state.data = {
        item: items,
        title: [author, subtitle, category].filter((i) => i).join(' - '),
        link: currentUrl,
        description: '向公众提供服务和开展互动交流',
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
};
