const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id || '31';

    const rootUrl = 'https://www.right.com.cn';
    const currentUrl = `${rootUrl}/forum/forum-${id}-1.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    $('a[title="隐藏置顶帖"]').each(function () {
        $(this).parents('tbody').remove();
    });

    const list = $('.s')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}/forum/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                detailResponse.data = iconv.decode(detailResponse.data, 'gbk');
                const postId = detailResponse.data.match(/<div id="post_(\d+)" >/)[1];
                const content = cheerio.load(detailResponse.data);

                item.author = content('.authi').eq(0).text();
                item.description = content('#postmessage_' + postId).html();
                item.pubDate = timezone(
                    new Date(
                        content('#authorposton' + postId)
                            .text()
                            .replace('发表于 ', '')
                    ),
                    +8
                );

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.xs2 a').text()} - 恩山无线论坛`,
        link: currentUrl,
        item: items,
    };
};
