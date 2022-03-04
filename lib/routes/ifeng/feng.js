const got = require('@/utils/got');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type = ctx.params.type;
    const userResponse = await got({
        method: 'get',
        url: `https://shankapi.ifeng.com/winter/ishare/getAccountInfo/${id}`,
        headers: {
            Referer: `https://feng.ifeng.com/author/${id}`,
        },
    });
    const contentResponse = await got({
        method: 'get',
        url: `https://shankapi.ifeng.com/winter/feng/author/getFengAuthorListData/${id}/${type}/1`,
        headers: {
            Referer: `https://feng.ifeng.com/author/${id}`,
        },
    });

    const userData = userResponse.data.data.data;
    const contentData = contentResponse.data.data;

    const mediaName = userData.weMediaName;
    const items = await Promise.all(
        (contentData || []).map(async (item) => {
            const link = `https:${item.url}`;
            const simple = {
                title: item.title,
                description: `<img src="${item.thumbnail}">${item.title}`,
                pubDate: new Date(Date.parse(item.newsTime.replace(/-/g, '/'))),
                author: mediaName,
                link,
            };

            const details = await ctx.cache.tryGet(`ifeng:feng:${link}`, async () => {
                const response = await got.get(link);
                const $ = cheerio.load(response.data);
                if (type === 'doc') {
                    const dom = new JSDOM(`<body><script>${$('[async] + script').html()}</script></body>`, {
                        runScripts: 'dangerously',
                    });
                    const data = dom.window.allData;
                    return {
                        description: utils.extractDoc(data),
                    };
                }
                if (type === 'video') {
                    return {
                        description: `<img src="${item.thumbnail}"><br><video src="${$('meta[name=og\\:img_video]').attr('content')}">`,
                    };
                }
                return {
                    description: $('meta[name=description]').attr('content'),
                };
            });
            return Promise.resolve(Object.assign({}, simple, details));
        })
    );

    ctx.state.data = {
        title: `大风号-${mediaName}-${type === 'doc' ? '文章' : '视频'}`,
        link: `https://feng.ifeng.com/author/${id}`,
        item: items,
    };
};
