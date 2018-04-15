const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx, next) => {
    const category = ctx.params.category;

    const idResponse = await axios({
        method: 'get',
        url: 'https://gold-tag-ms.juejin.im/v1/categories',
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://juejin.im/welcome/${category}`,
            'X-Juejin-Client': '',
            'X-Juejin-Src': 'web',
            'X-Juejin-Token': '',
            'X-Juejin-Uid': ''
        }
    });

    const cat = idResponse.data.d.categoryList.filter((item) => item.title === category)[0];
    const id = cat.id;

    const response = await axios({
        method: 'get',
        url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&limit=20&category=${id}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://juejin.im/welcome/${category}`,
        }
    });

    const data = response.data;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `掘金${cat.name}`,
        link: `https://juejin.im/welcome/${category}`,
        description: `掘金${cat.name}`,
        lastBuildDate: new Date().toUTCString(),
        item: data.d && data.d.entrylist && data.d.entrylist.map((item) => ({
            title: item.title,
            description: `${(item.content || item.summaryInfo || '无描述').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')}`,
            pubDate: new Date(item.createdAt).toUTCString(),
            link: item.originalUrl
        })),
    });

    next();
};