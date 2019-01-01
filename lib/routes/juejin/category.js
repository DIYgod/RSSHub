const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const idResponse = await axios({
        method: 'get',
        url: 'https://gold-tag-ms.juejin.im/v1/categories',
        headers: {
            Referer: `https://juejin.im/welcome/${category}`,
            'X-Juejin-Client': '',
            'X-Juejin-Src': 'web',
            'X-Juejin-Token': '',
            'X-Juejin-Uid': '',
        },
    });

    const cat = idResponse.data.d.categoryList.filter((item) => item.title === category)[0];
    const id = cat.id;

    const response = await axios({
        method: 'get',
        url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&limit=20&category=${id}`,
        headers: {
            Referer: `https://juejin.im/welcome/${category}`,
        },
    });

    // const data = response.data;
    let originalData = [];
    if (response.data.d && response.data.d.entrylist) {
        originalData = response.data.d && response.data.d.entrylist.slice(0, 5);
    }
    const resultItems = await Promise.all(
        originalData.map(async (item) => {
            const resultItem = {
                title: item.title,
                description: `${(item.content || item.summaryInfo || '无描述').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: item.originalUrl,
            };
            if (item.type === 'post') {
                const key = 'juejin' + resultItem.link;
                const value = await ctx.cache.get(key);

                if (value) {
                    resultItem.description = value;
                } else {
                    const detail = await axios({
                        method: 'get',
                        url: item.originalUrl,
                        headers: {
                            Referer: item.originalUrl,
                        },
                    });
                    const content = cheerio.load(detail.data);
                    resultItem.description = content('.article-content')
                        .html()
                        .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')
                        .replace(/(<img.*?)(data-src)(.*?>)/g, '$1src$3');
                    ctx.cache.set(key, resultItem.description, 24 * 60 * 60);
                }
            }
            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: `掘金${cat.name}`,
        link: `https://juejin.im/welcome/${category}`,
        description: `掘金${cat.name}`,
        item: resultItems,
    };
};
