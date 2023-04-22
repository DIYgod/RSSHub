const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const parseArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const detailResponse = await got({
            method: 'get',
            url: item.link,
        });

        const content = cheerio.load(detailResponse.data);

        // nfapp page:
        if (content('.post-cont') && content('.post-cont').html()) {
            content('img').removeAttr('data-width').removeAttr('data-height').removeAttr('class').removeAttr('title').removeAttr('referrerpolicy');
            content('.taglist, .J_ndlogo, .zan-shang, .sourcelist-box, #shareContain, .buyCopyright, .article-info, .icon, .special').remove();
            item.description +=
                content('.post-cont')
                    .html()
                    .replace(/data:image\S*=="\s*\n*\s*original="/g, '') ?? '';
            if (!item.pubDate) {
                item.pubDate = timezone(parseDate(content('.introduce').text().split()), +8);
            }
        }
        // oeeee news page:
        else if (content('.content') && content('.content').html()) {
            item.description += content('.content').html() ?? '';
        }
        // oeeee news page #2:
        else if (content('.article-conten') && content('.article-conten').html()) {
            item.description += content('.article-conten').html() ?? '';
        }

        return item;
    });

module.exports = {
    parseArticle,
};
