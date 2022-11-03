const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const sort = ctx.params.sort ?? '2';

    const rootUrl = 'https://yuba.douyu.com';
    const detailUrl = `${rootUrl}/wbapi/web/group/head?group_id=${id}`;
    const apiUrl = `${rootUrl}/wbapi/web/group/postlist?group_id=${id}&page=1&sort=${sort}`;
    const currentUrl = `${rootUrl}/group/${sort === '1' ? 'newall' : 'newself'}/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const detailResponse = await got({
        method: 'get',
        url: detailUrl,
    });

    const items = response.data.data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/p/${item.post_id}`,
        pubDate: timezone(parseDate(item.created_at_std), +8),
        description: art(path.join(__dirname, 'templates/description.art'), {
            content: item.describe,
            images: item.imglist.map((i) => ({
                size: i.size,
                url: i.url,
            })),
        }),
    }));

    ctx.state.data = {
        title: `斗鱼鱼吧 - ${detailResponse.data.data.group_name}`,
        link: currentUrl,
        item: items,
        description: detailResponse.data.data.describe,
    };
};
