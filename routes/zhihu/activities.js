const axios = require('axios');
const template = require('../../utils/template');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.zhihu.com/people/${id}/activities`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://www.zhihu.com/people/${id}/activities`,
            'authorization': 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20',
            'X-API-VERSION': '3.0.40'
        }
    });

    const $ = cheerio.load(response.data);
    const data = $('#data').data('state').entities;

    const name = data.users[id].name;
    const list = Object.values(data.activities).sort((a, b) => b.createdTime - a.createdTime);

    ctx.body = template({
        title: `${name}的知乎动态`,
        link: `https://www.zhihu.com/people/${id}/activities`,
        description: data.users[id].headline || data.users[id].description,
        item: list && list.map((item) => {
            const type = item.target.schema;
            const detail = data[`${type}s`][item.target.id];
            let title;
            let description;
            let url;

            switch (type) {
            case 'answer':
                title = detail.question.title;
                description = detail.content;
                url = `https://www.zhihu.com/question/${detail.question.id}/answer/${detail.id}`;
                break;
            case 'article':
                title = detail.title;
                description = detail.content;
                url = `https://zhuanlan.zhihu.com/p/${detail.id}`;
                break;
            case 'pin':
                title = detail.excerptTitle.length > 17 ? detail.excerptTitle.slice(0, 17) + '...' : detail.excerptTitle;
                const images = [];
                let text = "";
                detail.content.forEach(contentItem => {
                    if (contentItem.type === "text") {
                        text = contentItem.ownText;
                    } else if (contentItem.type === "image") {
                        images.push(`<p><img referrerpolicy="no-referrer" src="${contentItem.url.replace('xl', 'r')}"/></p>`);
                    }
                })
                description = `<p>${text}</p>${images.join('')}`;
                url = `https://www.zhihu.com/pin/${detail.id}`;
                break;
            case 'question':
                title = detail.title;
                description = detail.excerpt;
                url = `https://www.zhihu.com/question/${detail.id}`;
                break;
            case 'column':
                title = detail.title;
                description = `<p>${detail.intro}</p><p><img referrerpolicy="no-referrer" src="${detail.imageUrl}"/></p>`;
                url = `${detail.url}`;
                break;
            }

            return {
                title: `${item.actionText}: ${title}`,
                description: description,
                pubDate: new Date(item.createdTime * 1000).toUTCString(),
                link: url
            };
        }),
    });
};
