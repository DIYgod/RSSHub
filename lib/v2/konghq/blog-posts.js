// Get the lastest blog posts of https://konghq.com/
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const BASE_URL = 'https://konghq.com';
const BLOG_POSTS_URL = `${BASE_URL}/blog`;

module.exports = async (ctx) => {
    // Always get the posts on the first page.
    const url = `${BLOG_POSTS_URL}/page/1`;

    const { data: response } = await got(url);
    const $ = cheerio.load(response);
    // Request and parse the index page to get the posts
    const posts = $('div[class^="card-styles_inner"]')
        .toArray()
        .map((_item) => {
            const item = $(_item);

            const titleElem = item.find('a:has(h1)').first();
            const title = titleElem.find('h1').text();
            const author = item.find('div[class^="Author_name"]').text();
            const category = item.find('div[class^="Eyebrow_eyebrow"]>a').text();

            let link = titleElem.attr('href');
            // The link value is a related path, concat it with the base url
            link = `${BASE_URL}${link}`;

            const pubDateText = item.find('div[class^="Eyebrow_eyebrow"]>div').text();
            const pubDate = parseDate(pubDateText);
            return {
                title,
                link,
                pubDate,
                author,
                category,
            };
        });

    // Request each post to get the details content as "description"
    const items = await Promise.all(
        posts.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                // Update the description to post's main content
                let content = $('div[class*="RichTextBlock_content"]').first().html();
                if (!content) {
                    content = $('section[class^="blog_sections"]').first().html();
                }
                item.description = content;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Kong Inc(konghq.com) blog posts`,
        link: BLOG_POSTS_URL,
        item: items,
    };
};
