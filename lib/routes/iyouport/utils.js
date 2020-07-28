const got = require('@/utils/got');
const cheerio = require('cheerio');

const ProcessFeed = async (link) => {
    const fullTextGet = await got.get(link);
    const $ = cheerio.load(fullTextGet.data);
    $('iframe').remove();
    $('.wpcnt').remove();
    $('.sharedaddy.sd-sharing-enabled').remove();
    $('.sharedaddy.sd-block.sd-like.jetpack-likes-widget-wrapper.jetpack-likes-widget-unloaded').remove();
    $('.jp-relatedposts').remove();
    // $('img').removeAttr('data-lazy-srcset');
    // $('img').removeAttr('srcset');
    const fullText = $('.entry-content').html();
    return fullText;
};

module.exports = {
    ProcessFeed,
};
