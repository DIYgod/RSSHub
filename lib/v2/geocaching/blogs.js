const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const response = await got('https://www.geocaching.com/blog/');
    const data = response.data; // get html from the page

    const $ = cheerio.load(data);
    const list = $('div#primary main > article')
        .map((_, item) => {
            item = $(item);
			const url = item.find('h1 a').attr('href');
			const title = item.find('h1 a').text();
			const author = item.find('div.entry-header-meta span.author a').text();
			const publish_time = parseDate(item.find('div.entry-header-meta span.posted-on time').attr('datetime'));
			const description = item.find('div.entry-content p').map((_, element) => $(element)).get().join(" ");
			const image = item.find('div.post-thumbnail img').attr('src')
            return {
                title: title,
                link: url,
                author: author,
				pubtime: publish_time,
				description: art(path.join(__dirname, 'templates/blogs.art'), {
            		description,
					image,
        		}),
            };
        })
        .get();

	ctx.state.data = {
		title: 'Geocaching Blog',
		url: 'https://www.geocaching.com/blog/',
		description: 'Geocaching 博客更新',
		item: list.map((item) => ({
                title: item.title,
                description: item.description,
                pubDate: item.pubtime,
                link: item.link,
                author: item.author,
            })),
	};
};
