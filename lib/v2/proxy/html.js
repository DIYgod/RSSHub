const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { url } = ctx.params;
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.params.routeParams);
    const $ = cheerio.load(response.data);
    const rsstitle = routeParams.get('title') ? routeParams.get('title') : $('title').text();
    const items = [];
    const item = routeParams.get('item') ? routeParams.get('item') : 'html';
    $(item)
        .toArray()
        .forEach((item) => {
            try {
                item = $(item);

                let title;
                const titleEle = routeParams.get('itemTitle') ? item.find(routeParams.get('itemTitle')) : item;
                if (routeParams.get('itemTitleAttr')) {
                    title = titleEle.attr(routeParams.get('itemTitleAttr'));
                } else {
                    title = titleEle.text();
                }

                let link;
                const linkEle = routeParams.get('itemLink') ? item.find(routeParams.get('itemLink')) : item;
                if (routeParams.get('itemLinkAttr')) {
                    link = linkEle.attr(routeParams.get('itemLinkAttr'));
                } else {
                    if (linkEle.is('a')) {
                        link = linkEle.attr('href');
                    } else {
                        link = linkEle.find('a').attr('href');
                    }
                }
                // 补全绝对链接
                if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
                    link = `${new URL(url).origin}${link}`;
                }

                let desc;
                const descEle = routeParams.get('itemDesc') ? item.find(routeParams.get('itemDesc')) : item;
                if (routeParams.get('itemDescAttr')) {
                    desc = descEle.attr(routeParams.get('itemDescAttr'));
                } else {
                    desc = descEle.html();
                }

                items.push({
                    title,
                    link,
                    description: desc,
                });
            } catch (e) {
                return;
            }
        });

    ctx.state.data = {
        title: rsstitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
};
