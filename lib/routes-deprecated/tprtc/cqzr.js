const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const pagelink = 'http://otc.tprtc.com/tjcqp/cgq/search/index';
    const host = 'http://otc.tprtc.com';

    const response = await got({
        method: 'get',
        url: 'http://otc.tprtc.com/tjcqp/cgq/search/search_li',
        headers: {
            Referer: pagelink,
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('li').get();

    const ProcessFeed = async (link) => {
        const response = await got({
            method: 'get',
            url: link,
            headers: {
                Referer: pagelink,
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
        });
        const $ = cheerio.load(response.data);

        // 删除没用的tab指示
        $('.bd_detail_main .bd_detail_tab').remove();

        // 文章样式
        const style = `<link rel="stylesheet" href="http://otc.tprtc.com/res/prj/tjcq/css/notheme/notheme_all_min.css" type="text/css">
        <link rel="stylesheet" href="http://otc.tprtc.com/res/prj/tjcq/css/themes/default/common_all_min.css" type="text/css"/>`;

        // 提取内容
        const description = $('.bd_detail_main').html() + style;

        return description;
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.property_list_title>a');
            const itemUrl = url.resolve(host, $title.attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const description = await ProcessFeed(itemUrl);

            const single = {
                title: $('.property_list_title>span').text() + ' ' + $title.text(),
                link: itemUrl,
                description,
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: '产权转让-天津产权交易中心',
        link: pagelink,
        description: '天津产权交易中心-产权转让',
        item: items,
    };
};
