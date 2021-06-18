const got = require('@/utils/got');
const cheerio = require('cheerio');

const titles = {
    '': 'GNN 新聞',
    1: 'PC',
    3: 'TV 掌機',
    4: '手機遊戲',
    5: '動漫畫',
    9: '主題報導',
    11: '活動展覽',
    13: '電競',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const isNumber = !isNaN(category);

    const rootUrl = `https://${isNumber ? 'gnn' : 'acg'}.gamer.com.tw`;
    const currentUrl = `${rootUrl}/${isNumber ? `?k=${category}` : `news.php?p=${category}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.platform-tag_list')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item).next();

            return {
                title: item.text(),
                link: `https:${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    let detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const redirect = detailResponse.data.match(/window\.location\.replace\('(.*)'/);

                    if (redirect !== null) {
                        detailResponse = await got({
                            method: 'get',
                            url: (item.link = redirect[1]),
                        });
                    }

                    const content = cheerio.load(detailResponse.data);

                    content('.platform-tag, .article_gamercard, #wallFanspageCardTemplate').remove();

                    content('img')
                        .not('.gallery-image')
                        .each(function () {
                            content(this).attr('src', content(this).attr('data-src'));
                            content(this).removeAttr('data-src');
                            content(this).removeAttr('data-srcset');
                        });

                    item.description = content('.GN-lbox3B, .MSG-list8C, #article_content').html();

                    const authorMatch = detailResponse.data.match(/"author":{"@type":".*","name":"(.*)"},"image":/);
                    item.author = authorMatch ? authorMatch[1] : content('.article-intro .caption-text').eq(0).text() || content('.ST1').eq(0).text().split('│')[0].replace('作者：', '');

                    const pubDateMatch = detailResponse.data.match(/"datePublished":"(.*)","dateModified":/);
                    item.pubDate = Date.parse(pubDateMatch ? pubDateMatch[1] : content('.article-intro .caption-text').eq(2).text() || content('.ST1').eq(0).text().split('│')[1]);

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: isNumber ? `${titles[category]} - 巴哈姆特` : $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[name="description"]').attr('content'),
    };
};
