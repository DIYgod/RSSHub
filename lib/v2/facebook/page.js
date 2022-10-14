const got = require('@/utils/got');
const cheerio = require('cheerio');
const randUserAgent = require('@/utils/rand-user-agent');

const mobileUserAgent = randUserAgent({ browser: 'mobile safari', os: 'ios', device: 'mobile' });

const fetchPageHtml = (site, linkPath, cacheKey, cache) => {
    const url = `https://${site}.facebook.com${linkPath}`;

    return cache.tryGet(`fb_${cacheKey}`, async () => {
        const { data: html } = await got.get(url, {
            headers: {
                'User-Agent': mobileUserAgent,
            },
        });
        return html;
    });
};

const parseStoryPage = async (linkPath, cache) => {
    const { searchParams: q } = new URL('https://mbasic.facebook.com' + linkPath);
    const storyFbId = q.get('story_fbid');
    const storyId = q.get('id');
    const cacheKey = `story/${storyFbId}/${storyId}`;

    const html = await fetchPageHtml('mbasic', linkPath, cacheKey, cache);
    const $ = cheerio.load(html);

    const url = `https://www.facebook.com/story.php?story_fbid=${storyFbId}&id=${storyId}`;
    const $story = $('#m_story_permalink_view').eq(0);
    const $header = $story.find('h3').eq(0);
    const $content = $story.find('div[data-ft=\'{"tn":"*s"}\']').eq(0);
    $content.find('a[href^="https://lm.facebook.com/l.php"]').each((_, ele) => {
        const link = $(ele);
        const originalLink = new URL(link.attr('href')).searchParams.get('u');
        if (originalLink) {
            link.attr('href', decodeURIComponent(originalLink));
        }
    });
    const $attach = $story.find('div[data-ft=\'{"tn":"H"}\']').eq(0);

    const attachLinkList = $attach
        .find('a')
        .toArray()
        .map((a) => $(a).attr('href'));
    const isAttachAreImageSet = attachLinkList.filter((link) => new RegExp('/photos/').test(link)).length === attachLinkList.length;
    const title = $header.text();

    const content = $content.html();

    let images = [];
    if (isAttachAreImageSet) {
        images = await Promise.all(attachLinkList.map((link) => parsePhotoPage(link, cache)));
    }

    return {
        url,
        title,
        content,
        images,
    };
};

const parsePhotoPage = async (linkPath, cache) => {
    const { pathname } = new URL('https://mbasic.facebook.com' + linkPath);
    const cacheKey = `photos${pathname}`;

    const html = await fetchPageHtml('mbasic', linkPath, cacheKey, cache);
    const $ = cheerio.load(html);

    const title = $('#MPhotoContent div.msg > a > strong').first().text();
    const url = `https://www.facebook.com${linkPath}`;
    const $content = $('#MPhotoContent div.msg > div');
    const content = $content.html();
    const image = $('#MPhotoContent div.desc.attachment > span > div > span > a[target=_blank].sec').attr('href');
    const imageThumbnail = $('#MPhotoContent').parent().children().eq(1).find('div > div > img').attr('src');

    return {
        title,
        url,
        content,
        image,
        imageThumbnail,
    };
};

const parsePostPage = async (linkPath, cache) => {
    const regex = /facebook\.com\/(.*)\/posts\/(.*)\?/;
    const match = regex.exec(linkPath);
    const page = match[1];
    const postId = match[2];
    const cacheKey = `story/${page}/${postId}`;

    const html = await fetchPageHtml('mbasic', `/${page}/posts/${postId}`, cacheKey, cache);
    const $ = cheerio.load(html);

    const url = `https://www.facebook.com/${page}/posts/${postId}`;
    const $story = $('#m_story_permalink_view').eq(0);
    const $header = $story.find('h3').eq(0);
    const $content = $story.find('div[data-ft=\'{"tn":"*s"}\']').eq(0);
    $content.find('a[href^="https://lm.facebook.com/l.php"]').each((_, ele) => {
        const link = $(ele);
        const originalLink = new URL(link.attr('href')).searchParams.get('u');
        if (originalLink) {
            link.attr('href', decodeURIComponent(originalLink));
        }
    });
    const $attach = $story.find('div[data-ft=\'{"tn":"H"}\']').eq(0);

    const attachLinkList = $attach
        .find('a')
        .toArray()
        .map((a) => $(a).attr('href'));
    const isAttachAreImageSet = attachLinkList.filter((link) => new RegExp('/photos|/photo.php').test(link)).length === attachLinkList.length;
    const title = $header.text();

    const content = $content.html();

    let images = [];
    if (isAttachAreImageSet) {
        images = await Promise.all(attachLinkList.map((link) => parsePhotoPage(link, cache)));
    }

    return {
        url,
        title,
        content,
        images,
    };
};

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const pageId = encodeURIComponent(id);

    // try fetch from mobile site
    const html = await fetchPageHtml('m', `/${pageId}`, pageId, ctx.cache);
    const $ = cheerio.load(html);

    const title = $('#msite-pages-header-contents div[data-nt="FB:TEXT4"]').eq(0).text();
    const description = $('#pages_msite_body_contents div[data-nt="FB:EXPANDABLE_TEXT"]').text();

    if (title !== '' && description !== '') {
        const htmlPosts = await fetchPageHtml('m', `/${pageId}/posts`, `${pageId}_posts`, ctx.cache);
        const $posts = cheerio.load(htmlPosts);

        const itemLinks = $posts('div.story_body_container > div[data-ft=\'{"tn":"*s"}\'] > a:last-child')
            .toArray()
            .map((a) => $(a).attr('href'));

        const items = await Promise.all(
            itemLinks.map(async (itemLink) => {
                if (new RegExp(`^/.+/photos/`).test(itemLink)) {
                    const data = await parsePhotoPage(itemLink, ctx.cache);
                    return {
                        title: data.title,
                        link: data.url,
                        description: `<img src="${data.image}"><br>${data.content}`,
                    };
                }
                if (new RegExp(`^/story.php`).test(itemLink)) {
                    const data = await parseStoryPage(itemLink, ctx.cache);
                    const isEmptyImageList = data.images.length === 0;

                    let desc = data.content;
                    if (!isEmptyImageList) {
                        desc += '<br>' + data.images.map((image) => `<img src="${image.image}"><br>${image.content}`).join('<br>');
                    }

                    return {
                        title: data.title,
                        link: data.url,
                        description: desc,
                    };
                }
            })
        );

        ctx.state.data = {
            title,
            link: `https://www.facebook.com/${pageId}`,
            description,
            item: items.filter((item) => !!item),
        };
    } else {
        // fetch with mobile site fail (facebook return webpage without any story), try fetch with desktop site
        const browser = await require('@/utils/puppeteer')();
        const page = await browser.newPage();
        await page.setViewport({ width: 390, height: 844 }); // iphone resolution
        await page.goto(`https://www.facebook.com/${pageId}`, {
            waitUntil: 'networkidle0',
        });
        // scroll down to load more story at once
        await page.evaluate(async () => {
            await window.scrollTo(0, window.document.body.scrollHeight);
        });
        await page.waitForNetworkIdle(); // wait story load
        const htmlDesktop = await page.evaluate(() => document.documentElement.innerHTML);
        await browser.close();

        const $desktop = cheerio.load(htmlDesktop);
        const itemLinks = $desktop('a')
            .toArray()
            .map((a) => $(a).attr('href'))
            .filter((url) => url !== undefined && url.includes(`${pageId}/posts/`));

        const items = await Promise.all(
            itemLinks.map(async (itemLink) => {
                const data = await parsePostPage(itemLink, ctx.cache);
                const isEmptyImageList = data.images.length === 0;

                let desc = data.content;
                if (!isEmptyImageList) {
                    desc +=
                        '<br>' +
                        data.images
                            .map((image) => {
                                if (image.image.includes(`/view_full_size/`)) {
                                    return `<a href="${image.url}"><img src="${image.imageThumbnail}"/></a><br>${image.content}`;
                                } else {
                                    return `<img src="${image.image}"><br>${image.content}`;
                                }
                            })
                            .join('<br>');
                }

                return {
                    title: data.title,
                    link: data.url,
                    description: desc,
                };
            })
        );

        ctx.state.data = {
            title,
            link: `https://www.facebook.com/${pageId}`,
            description,
            item: items.filter((item) => !!item),
        };
    }
};
