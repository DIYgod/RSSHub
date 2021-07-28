const got = require('@/utils/got');
const path = require('path');

module.exports = async (category, ctx) => {
    const url = `http://news.cctv.com/2019/07/gaiban/cmsdatainterface/page/${category}_1.jsonp`;

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: `http://news.cctv.com/${category}`,
        },
    });

    const data = JSON.parse(response.data.slice(category.length + 1, -1));
    const list = data.data.list;
    const resultItem = await Promise.all(
        list.map(async ({ title, url, focus_date, image }) => {
            const item = {
                title,
                link: url,
                pubDate: new Date(focus_date).toUTCString(),
            };
            const key = `cctv-news: ${url}`;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const id = path.parse(url).name;
                const unknownTip = '未知类型，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue';
                let description;
                let api;
                let type;

                if (id.startsWith('ART')) {
                    // 普通新闻
                    api = `http://api.cntv.cn/Article/getXinwenNextArticleInfo?serviceId=sjnews&id=${id}&t=json`;
                    type = 'ART';
                } else if (id.startsWith('PHO')) {
                    // 图片
                    api = `http://api.cntv.cn/Article/contentinfo?id=${id}&serviceId=sjnews&t=json`;
                    type = 'PHO';
                } else if (id.startsWith('VIDE')) {
                    // 视频
                    const vid = path.parse(image).name.split('-')[0];
                    api = `http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${vid}`;
                    type = 'VIDE';
                } else {
                    // 未识别
                    description = unknownTip;
                }

                if (api) {
                    const { data } = await got({
                        method: 'get',
                        url: api,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                        },
                    });

                    switch (type) {
                        case 'ART':
                            description = data.article_content;
                            break;

                        case 'PHO':
                            description = data.photo_album_list.reduce((description, { photo_url, photo_name, photo_brief }) => {
                                description += `
                                    <img src=${photo_url} /><br>
                                    <strong>${photo_name}</strong><br>
                                    ${photo_brief}<br>
                                `;
                                return description;
                            }, '');
                            break;

                        case 'VIDE':
                            description = `<video src="${data.hls_url}" controls="controls" poster="${image}" style="width: 100%"></video>`;
                            break;

                        default:
                            description = unknownTip;
                    }
                }

                item.description = description;
                ctx.cache.set(key, item.description);
            }

            return item;
        })
    );

    return {
        title: `央视新闻 ${category}`,
        link: `http://news.cctv.com/${category}`,
        description: `央视新闻 ${category}`,
        item: resultItem,
    };
};
