const got = require('@/utils/got');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const UA = require('@/utils/rand-user-agent')({ browser: 'mobile safari', os: 'ios', device: 'mobile' });

module.exports = async (category, ctx) => {
    const url = `https://news.cctv.com/2019/07/gaiban/cmsdatainterface/page/${category}_1.jsonp`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `http://news.cctv.com/${category}`,
            'User-Agent': UA,
        },
    });

    const data = JSON.parse(response.data.slice(category.length + 1, -1));
    const list = data.data.list;
    const resultItem = await Promise.all(
        list.map(({ title, url, focus_date, image }) =>
            ctx.cache.tryGet(`cctv-news: ${url}`, async () => {
                const item = {
                    title,
                    link: url,
                    pubDate: timezone(parseDate(focus_date), +8),
                };
                const id = path.parse(url).name;
                const unknownTip = '未知类型，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue';
                let description;
                let api;
                let type;
                let author;

                if (id.startsWith('ART')) {
                    // 普通新闻
                    api = `https://api.cntv.cn/Article/getXinwenNextArticleInfo?serviceId=sjnews&id=${id}&t=json`;
                    type = 'ART';
                } else if (id.startsWith('PHO')) {
                    // 图片
                    api = `https://api.cntv.cn/Article/contentinfo?id=${id}&serviceId=sjnews&t=json`;
                    type = 'PHO';
                } else if (id.startsWith('VIDE')) {
                    // 视频
                    const vid = path.parse(image).name.split('-')[0];
                    api = `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${vid}`;
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
                            'User-Agent': UA,
                        },
                    });

                    switch (type) {
                        case 'ART':
                            description = data.article_content;
                            author = data.article_source;
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
                            author = data.source;
                            break;

                        case 'VIDE':
                            description = `<video src="${data.hls_url}" controls="controls" poster="${image}" style="width: 100%"></video>`;
                            author = data.article_source;
                            break;

                        default:
                            description = unknownTip;
                    }
                }

                item.description = description;
                item.author = author;

                return item;
            })
        )
    );

    return {
        title: `央视新闻 ${category}`,
        link: `https://news.cctv.com/${category}`,
        description: `央视新闻 ${category}`,
        item: resultItem,
    };
};
