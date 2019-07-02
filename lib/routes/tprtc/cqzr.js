const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://item.tprtc.com/tjcqp/cgq/search/search_li?xxplfs=&zrdj=0&nzrbl=0&hy=&szdq=&sortTag=0&pageNo=1&pageSize=20&keyWord=',
        headers: {
            Referer: 'http://item.tprtc.com/tjcqp/cgq/search/index?plfs=2',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3793.0 Safari/537.36',
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
                Referer: 'http://item.tprtc.com/tjcqp/cgq/search/index?plfs=2',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3793.0 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
        });
        const $ = cheerio.load(response.data);

        // 删除没用的tab指示
        $('.bd_detail_main .bd_detail_tab').remove();

        // 文章样式
        const style = `<link rel="stylesheet" href="http://item.tprtc.com/res/prj/tjcq/css/notheme/notheme_all_min.css" type="text/css">
        <link rel="stylesheet" href="http://item.tprtc.com/res/prj/tjcq/css/themes/default/common_all_min.css" type="text/css"/>`;

        // 提取内容
        const description = $('.bd_detail_main').html() + style;

        return description;
    };

    const host = 'http://item.tprtc.com';
    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.property_list_title>a');
            const itemUrl = url.resolve(host, $title.attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const description = await ProcessFeed(itemUrl);

            const single = {
                title: $('.property_list_title>span').text() + ' ' + $title.text(),
                link: itemUrl,
                description,
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '产权转让-天津产权交易中心',
        link: 'http://item.tprtc.com/tjcqp/cgq/search/index?plfs=2',
        description: '天津产权交易中心-产权转让',
        item: items,
    };
};
