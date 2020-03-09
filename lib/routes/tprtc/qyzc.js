const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const pagelink = 'http://otc.tprtc.com/tjcqp/s/jyzx/qyzc';
    const host = 'http://otc.tprtc.com';

    const response = await got({
        method: 'get',
        url: 'http://otc.tprtc.com/tjcqp/s/jyzx/qyzc_li',
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
        $('.bd_detail_left .bd_detail_scroll').remove();
        $('.bd_detail_left .property_tab').remove();
        $('.bd_detail_left .bd_detail_follow').remove();
        $('.bd_detail_left [id^="clob_formweb_value_"]').remove();

        // 文章样式
        const style = `<link rel="stylesheet" href="http://otc.tprtc.com/res/prj/tjcq/css/notheme/notheme_all_min.css" type="text/css">
        <link rel="stylesheet" href="http://otc.tprtc.com/res/prj/tjcq/css/themes/default/common_all_min.css" type="text/css"/>`;

        // 提取内容
        const description = $('.bd_detail_left').html() + style;

        return description;
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.bdlist_title>a');
            const itemUrl = url.resolve(host, $title.attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const description = await ProcessFeed(itemUrl);

            const single = {
                title: $title.text(),
                link: itemUrl,
                description,
                author: $('.bdlist_time').text(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '企业资产转让-天津产权交易中心',
        link: pagelink,
        description: '天津产权交易中心-企业资产转让',
        item: items,
    };
};
