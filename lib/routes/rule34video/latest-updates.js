const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.rule34video.com/latest-updates',
        headers: {
            Referer: 'https://www.rule34video.com',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    
    const items = [];
    $('a.th.js-open-popup').each((index, element) => {
        const $el = $(element);
        
        // 提取基本信息
        const title = $el.attr('title');
        const href = $el.attr('href');
        const preview = $el.find('img.thumb.lazy-load').attr('data-original');
        
        // 提取详细信息
        const duration = $el.find('.time').text().trim();
        const added = $el.find('.added').text().replace(/\s+/g, ' ').trim();
        const rating = $el.find('.rating').text().trim();
        const views = $el.find('.views').text().trim();
        const description = $el.find('img.thumb.lazy-load').attr('alt') || title;
        
        // 检查是否有声音和HD标志
        const hasSound = $el.find('.sound').length > 0;
        const isHD = $el.find('.quality').length > 0;
        
        // 提取视频ID
        const videoId = href.match(/\/video\/(\d+)\//)?.[1];
        
        items.push({
            title: title,
            link: href,
            preview: preview,
            duration: duration,
            added: added,
            rating: rating,
            views: views,
            description: description,
            hasSound: hasSound,
            isHD: isHD,
            videoId: videoId,
        });
    });

    const result = await util.ProcessFeed(items, ctx.cache);

    ctx.state.data = {
        title: 'Rule34 Video Latest Updates',
        link: 'https://www.rule34video.com/latest-updates',
        description: 'Latest updates from Rule34 Video',
        item: result,
    };
};
