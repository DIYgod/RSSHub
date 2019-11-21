const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        // sudo apachectl start 本地服务器
        // web根目录在：/Library/WebServer/Documents
        // url: 'http://localhost/beta.html',
        // url: 'http://localhost/Released.html',
        url: 'https://www.sketch.com/beta/',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    // 获取版本
    const version = $('small.heading-caption')
        .text()
        .trim();

    // 判断是否已发布
    const releaseString = $('.wrapper')
        .first()
        .find('h1')
        .text()
        .substr(-8);

    let isrelease = 0;
    if (releaseString === 'released') {
        isrelease = 1;
    } else {
        isrelease = 0;
    }

    const list = $('.wrapper').first();
    // sketch update 提供的时间 年月反了.要重新调整
    const pubday = list
        .find('.heading-caption time')
        .attr('datetime')
        .substr(0, 2);
    const pubmonth = list
        .find('.heading-caption time')
        .attr('datetime')
        .substr(3, 2);
    const pubyear = list
        .find('.heading-caption time')
        .attr('datetime')
        .substr(-4);
    const pubdateString = pubmonth + `-` + pubday + `-` + pubyear;

    if (isrelease === 1) {
        ctx.state.data = {
            title: `Sketch Beta`,
            link: response.url,
            description: 'Sketch is a design toolkit built to help you create your best work — from your earliest ideas, through to final artwork.',
            image: 'https://cdn.sketchapp.com/assets/components/block-buy/logo.png',

            item:
                list &&
                list
                    .map((index, item) => {
                        item = $(item);
                        return {
                            title: `${item
                                .find('h1')
                                .first()
                                .text()}`,
                            description: `${item.html()}`,
                            link: `https://www.sketch.com/updates/`,
                            pubDate: new Date(pubdateString).toLocaleDateString(),
                            guid: version,
                        };
                    })
                    .get(),
        };
    } else {
        const content = $('.update-details').html();
        ctx.state.data = {
            title: `Sketch Beta`,
            link: response.url,
            description: 'Sketch is a design toolkit built to help you create your best work — from your earliest ideas, through to final artwork.',
            image: 'https://cdn.sketchapp.com/assets/components/block-buy/logo.png',

            item:
                list &&
                list
                    .map((index, item) => {
                        item = $(item);
                        return {
                            title: `${item
                                .find('h1')
                                .first()
                                .text()}
                                - ${item
                                    .find('small.heading-caption')
                                    .first()
                                    .text()
                                    .substr(16, 2)}`,
                            description: content,
                            link: `https://www.sketch.com/beta/`,
                            pubDate: new Date(pubdateString).toLocaleDateString(),
                            guid: version,
                        };
                    })
                    .get(),
        };
    }
};
