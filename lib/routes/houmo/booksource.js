const got = require('@/utils/got');

const url = 'http://qingmo.zohar.space/git/repository.json';
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: url,
    });

    const code = ctx.params.code;

    const list = response.data.list;

    if (!code) {
        ctx.state.data = {
            title: `BookSource`,
            link: url,
            description: `厚墨书源索引`,
            item: list.map((item) => {
                const author = item.name.match(/(.*?)-/g)[0].replace('-', '');
                return {
                    title: item.name + ` v` + item.version,
                    description: `<p class="author">作者: ${author}</p><p class="code">暗码: ${item.code}</p><p>tg群: @deepinkapp</p><p>论坛地址: https://andyt.cn/</p>`,
                    link: item.url.replace('real site => ', ''),
                    author: author,
                };
            }),
        };
    } else {
        const items = [];
        list.map((item) => {
            const author = item.name.match(/(.*?)-/g)[0].replace('-', '');
            if (item.code === code) {
                items.push({
                    title: item.name + ` v` + item.version,
                    description: `<p class="author">作者: ${author}<p>tg群: @deepinkapp</p><p>论坛地址: https://andyt.cn/</p>`,
                    link: item.url.replace('real site => ', ''),
                    author: author,
                });
            }
            return 0;
        });

        ctx.state.data = {
            title: `${code} - BookSource`,
            link: url,
            description: `暗码: ${code} - 厚墨书源索引`,
            item: items,
        };
    }
};
