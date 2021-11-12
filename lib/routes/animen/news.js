const got = require('@/utils/got');

const news_api_origin = 'https://www.animen.com.tw/animen_web/api/getNews?page=1&perPage=10';
const link_origin = 'https://www.animen.com.tw/animen_web/web/news_index?';

const map = new Map([
    ['zx', { title: '最新', id: -1 }],
    ['jd', { title: '焦点', id: 0 }],
    ['dh', { title: '动画', id: 16 }],
    ['mh', { title: '漫画', id: 17 }],
    ['yx', { title: '游戏', id: 19 }],
    ['xs', { title: '小说', id: 18 }],
    ['zrb', { title: '真人版', id: 24 }],
    ['hd', { title: '活动', id: 20 }],
    ['yy', { title: '音乐', id: 27 }],
    ['ft', { title: '访谈', id: 25 }],
    ['qt', { title: '其他', id: 22 }],
    ['xwg', { title: '新闻稿', id: 26 }],
    ['lrb', { title: '懒人包', id: 23 }],
    ['gg', { title: '公告', id: 21 }],
]);
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const sub_title = map.get(type).title;

    let news_api;
    let link;
    if (type === 'zx') {
        news_api = news_api_origin + '&order_type=N';
        link = link_origin + '&order_type=N';
    } else if (type === 'jd') {
        news_api = news_api_origin + '&order_type=H';
        link = link_origin + '&order_type=H';
    } else {
        news_api = news_api_origin + '&news_category_id=' + map.get(type).id;
        link = link_origin + '&news_category_id=' + map.get(type).id;
    }

    const response = await got.get(news_api);
    const newsList = response.data.news.NewsList;

    const out = await Promise.all(
        newsList.map(async (news) => {
            const title = news.subject;
            const date = news.start_datetime;
            const news_id = news.news_id;
            const itemLink = `https://www.animen.com.tw/animen_web/web/news_inside?news_id=${news_id}`;

            const news_detail_api = `https://www.animen.com.tw/animen_web/api/getNewsDetail?news_id=${news_id}`;
            const response = await got.get(news_detail_api);
            const details = response.data.news_content.slice(1);

            const descriptions = details.map((detail) => {
                let description;
                if (detail.news_order_type === 'M') {
                    const id = detail.content.split('=')[1];
                    description = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                } else if (detail.news_order_type === 'A') {
                    description = detail.content;
                } else {
                    const image = detail.p_original_path;
                    description = `<br><img src="${image}"><br>`;
                }
                return description;
            });
            const description = descriptions.join('');

            const single = {
                title,
                link: itemLink,
                description,
                pubDate: new Date(date).toUTCString(),
            };

            return single;
        })
    );

    ctx.state.data = {
        title: `${sub_title}-Animen动漫平台`,
        link,
        item: out,
    };
};
