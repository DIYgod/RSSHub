const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { fixArticleContent } = require('@/utils/wechat-mp');

const invalidIdError = new RangeError('Invalid id');

const mpIdEncode = (name) => {
    const onePassed = Buffer.from(name).toString('base64'); // one-pass uses the standard base64 alphabet
    // two-passed base64 is always url-safe (`7f+/` never appear), you can prove it by yourself
    return Buffer.from(onePassed).toString('base64');
};

const mpIdDecode = (id) => {
    // verify that the decoded name can be a valid WeChat mp name: https://kf.qq.com/faq/120911VrYVrA141110r2MRJV.html
    // "公众号名称/昵称可设置4-30个字符（1个汉字算2字符）": 4 ASCII characters => 12, 15 Chinese characters => 80
    // and the id is a valid two-passed base64 string (`7f+/` never appear)
    if (id.length < 12 || id.length > 80 || id.length % 4 !== 0 || !/^[a-eg-zA-Z0-68-9]+={0,2}$/.test(id)) {
        throw invalidIdError;
    }
    const deSecondPassed = Buffer.from(id, 'base64').toString();
    // verify that it is a valid base64 string using standard base64 alphabet
    if (deSecondPassed.length % 4 !== 0 || !/^[a-zA-Z0-9+/]+={0,2}$/.test(deSecondPassed)) {
        throw invalidIdError;
    }
    const deFirstPassed = Buffer.from(deSecondPassed, 'base64').toString();
    // "空格不可在最前或者最后，且空格不可连续"
    if (deFirstPassed.length < 2 || deFirstPassed.startsWith(' ') || deFirstPassed.endsWith(' ') || deFirstPassed.includes('  ')) {
        throw invalidIdError;
    }
    return deFirstPassed;
};

const finishArticleItem = async (ctx, item, skipAuthor = false) => {
    // the website is slow and unstable, so we need to ignore errors to avoid breaking the whole route
    // we can't cache the item instead of the webpage because we need to retry when the last request failed
    const article = await ctx.cache.tryGet(
        item.link,
        async () =>
            await got(item.link)
                .then((_r) => _r.data)
                .catch(() => null) // it is safe do that in tryGet because a false value always lead to a cache miss
    );

    if (article) {
        const $ = cheerio.load(article);
        if (!skipAuthor) {
            item.author = item.author || $('[id=webbdgzh]+a').text();
        }
        item.title = item.title || $('div.desc > h1').text();
        item.pubDate = item.pubDate || parseDate($('div.desc span[data-timestamp]').attr('data-timestamp'));
        item.description = fixArticleContent($('div.rich_media_content'), true); // sometimes it is an empty string due to the website's fault
    }

    return item;
};

module.exports = {
    mpIdEncode,
    mpIdDecode,
    finishArticleItem,
};
