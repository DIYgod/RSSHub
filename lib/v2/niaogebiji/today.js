const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://www.niaogebiji.com/pc/bulletin/index',
        form: {
            page: 1,
            pub_time: '',
            isfromajax: 1,
        },
    });

    if (response.data.return_code !== '200') {
        throw Error(response.data.return_msg);
    }

    const data = response.data.return_data;

    ctx.state.data = {
        title: '鸟哥笔记-今日事',
        link: 'https://www.niaogebiji.com/bulletin',
        item: data.map((item) => ({
            title: item.title,
            description: item.content,
            link: item.url,
            pubDate: parseDate(item.pub_time, 'X'),
            updated: parseDate(item.updated_at, 'X'),
            category: item.seo_keywords.split(','),
            author: item.user_info.nickname,
        })),
    };
};
