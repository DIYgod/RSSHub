const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const { url } = ctx.params;
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.params.routeParams);
    const $ = cheerio.load(response.data);
    const rssTitle = routeParams.get('title') ? routeParams.get('title') : $('title').text();
    const item = routeParams.get('item') ? routeParams.get('item') : 'html';
    const items = $(item)
        .toArray()
        .map((item) => {
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
                link = link.trim();
                if (link && !link.startsWith('http')) {
                    link = `${new URL(url).origin}${link}`;
                }

                let desc;
                const descEle = routeParams.get('itemDesc') ? item.find(routeParams.get('itemDesc')) : item;
                if (routeParams.get('itemDescAttr')) {
                    desc = descEle.attr(routeParams.get('itemDescAttr'));
                } else {
                    desc = descEle.html();
                }

                let pubDate;
                const pubDateEle = routeParams.get('itemPubDate') ? item.find(routeParams.get('itemPubDate')) : item;
                if (routeParams.get('itemPubDateAttr')) {
                    pubDate = pubDateEle.attr(routeParams.get('itemPubDateAttr'));
                } else {
                    pubDate = pubDateEle.html();
                }

                return {
                    title,
                    link,
                    description: desc,
                    pubDate,
                };
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);

    ctx.state.data = {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
};
