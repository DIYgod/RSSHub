const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (url) => {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const $ct = $($('#m_story_permalink_view').get(0)).find('div>div>div>div>p');
    $ct.find('br').replaceWith('\n');
    const content = $ct
        .map((i, p) => $(p).text())
        .toArray()
        .join('\n');
    const imgs = $ct
        .parent()
        .next()
        .find('img')
        .toArray()
        .map((img) => $(img).attr('src'));
    const { searchParams: q } = new URL(url);
    return { url: `https://www.facebook.com/story.php?story_fbid=${q.get('story_fbid')}&id=${q.get('id')}`, html, title: $($('h3 strong a').get(0)).text(), content, imgs };
};
