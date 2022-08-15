const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://oreno3d.com';

async function sync_detail(link) {
    // 主选择器
    const sec_page_selector = 'article.g-main-video-article';
    // 分条选择器
    const raw_pic_selector = 'header > figure.video-figure > a ';
    const video_name_selector = 'header > h1.video-h1 ';
    const author_selector = 'section:nth-child(4) > a > div.video-center';
    const origins_selector = 'section:nth-child(5) > a > div.video-center';
    const characters_selector = 'section:nth-child(6) > a > div.video-center';
    const tags_selector = 'section:nth-child(7) > ul > li > a div.tag-text'; // 未修复
    const desc_selector = 'section blockquote.video-information-comment';
    const iwara_link_selector = 'header > figure.video-figure > a';
    // 下载
    const response = await got(link);
    const $ = cheerio.load(response.data);
    // 创建列表
    const tags = [];
    const authors = [];
    const origins = [];
    const characters = [];
    // 筛选
    const raw_pic_link = rootUrl + $(raw_pic_selector).find('img').attr('src');
    const video_name = $(video_name_selector).text();
    // 存为列表
    $(sec_page_selector)
        .find(author_selector)
        .each(function (i) {
            authors[i] = $(this).text();
            authors[i].replace(' ', ''); // 去空格
            authors[i].trim(); // 去首尾空格
        });
    $(sec_page_selector)
        .find(origins_selector)
        .each(function (i) {
            origins[i] = $(this).text();
            origins[i].replace(' ', '');
            origins[i].trim();
        });
    $(sec_page_selector)
        .find(characters_selector)
        .each(function (i) {
            characters[i] = $(this).text();
            characters[i].replace(' ', '');
            characters[i].trim();
        });
    $(sec_page_selector)
        .find(tags_selector)
        .each(function (i) {
            tags[i] = $(this).text();
            tags[i].replace(' ', '');
            tags[i].trim();
        });
    // 筛选
    const desc = $(sec_page_selector).find(desc_selector).text();
    const iwara_link = $(iwara_link_selector).attr('href');
    // 打包
    return {
        raw_pic_link,
        video_name,
        authors: authors.join(' '),
        origins: origins.join(' '),
        characters: characters.join(' '),
        tags: tags.join(' '),
        desc,
        iwara_link,
        oreno3d_link: link,
    };
}

module.exports = sync_detail;
