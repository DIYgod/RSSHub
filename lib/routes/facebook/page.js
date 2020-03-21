const got = require('@/utils/got');
const cheerio = require('cheerio');

const fetchPageHtml = async (linkPath) => {
    const url = `https://mbasic.facebook.com${linkPath}`;
    const { data: html } = await got.get(url);

    return html;
};

const parseStoryPage = async (linkPath) => {
    const html = await fetchPageHtml(linkPath);
    const $ = cheerio.load(html);
    const { searchParams: q } = new URL('https://mbasic.facebook.com' + linkPath);
    const title = $('h3 strong a')
        .first()
        .text();
    const url = `https://www.facebook.com/story.php?story_fbid=${q.get('story_fbid')}&id=${q.get('id')}`;
    const $story = $('#m_story_permalink_view').first();
    const $contents = $story.find('div > div > div > div > p');
    $contents.find('br').replaceWith('\n');
    const content = $contents
        .toArray()
        .map((p) => $(p).text())
        .join('\n');
    const imageLinks = $story
        .find('div > div > div > div > div > a')
        .toArray()
        .map((a) => $(a).attr('href'));
    const images = await Promise.all(imageLinks.map((imageLink) => parsePhotoPage(imageLink)));

    return {
        url,
        title,
        content,
        images,
    };
};

const parsePhotoPage = async (linkPath) => {
    const html = await fetchPageHtml(linkPath);
    const $ = cheerio.load(html);
    const { pathname } = new URL('https://mbasic.facebook.com' + linkPath);
    const title = $('#MPhotoContent div.msg > a > strong')
        .first()
        .text();
    const url = `https://www.facebook.com${pathname}`;
    const $content = $('#MPhotoContent div.msg > div');
    $content.find('br').replaceWith('\n');
    const content = $content.text();
    const image = $('#MPhotoContent div.desc.attachment > span > div > span > a[target=_blank].sec').attr('href');

    return {
        title,
        url,
        content,
        image,
    };
};

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const html = await fetchPageHtml(`/${encodeURIComponent(id)}`);
    const $ = cheerio.load(html);
    const itemLinks = $('div[role=article]>div:nth-child(2)>div:nth-child(2)>span+a')
        .toArray()
        .map((x) => $(x).attr('href'));

    ctx.state.data = {
        title: $('#m-timeline-cover-section h1 span').text(),
        link: `https://www.facebook.com/${encodeURIComponent(id)}`,
        description: $('#sub_profile_pic_content>div>div:nth-child(3) div>span')
            .find('br')
            .replaceWith('\n')
            .text(),
        item: await Promise.all(
            itemLinks.map(async (itemLink) => {
                if (new RegExp(`^/${id}/photos/`).test(itemLink)) {
                    const data = await parsePhotoPage(itemLink);
                    return {
                        title: data.title,
                        link: data.url,
                        description: `<img src="${data.image}"><br>${data.content.replace(/\n/g, '<br>')}`,
                    };
                }
                if (new RegExp(`^/story.php`).test(itemLink)) {
                    const data = await parseStoryPage(itemLink);
                    const isSingleImageStory = data.images.length === 1;

                    let desc = '';
                    desc += data.images.map((image) => `<img src="${image.image}"><br>${data.content.replace(/\n/g, '<br>')}`).join('<br>');
                    if (!isSingleImageStory) {
                        desc += '<br>';
                        desc += data.content.replace(/\n/g, '<br>');
                    }

                    return {
                        title: data.title,
                        link: data.url,
                        description: desc,
                    };
                }
            })
        ),
    };
    return $;
};
