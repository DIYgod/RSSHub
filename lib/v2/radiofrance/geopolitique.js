const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async(ctx) => {
	const feed = await parser.parseURL('https://radiofrance-podcast.net/podcast09/rss_10009.xml');

	const items = await Promise.all(
		// only retrieve the full text for the first 3 items
        feed.items.slice(0, 3)
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                	const path = item.link.slice(item.link.indexOf('/franceinter'))
                	const apiurl = 'https://www.radiofrance.fr/api/v2.1/path?value=' + encodeURIComponent(path)
                    const { data } = await got(apiurl);
                   
                   	delete item.content;
                   	delete item.contentSnippet;

                    item.description = '<p>' + data.content.standFirst + '</p>' 
                    	+ data.content.bodyJson.map((t) => 
                    		'<p>' + t.children[0].value + '</p>'
                    	).join('');

                    return item
                })))

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: feed.language,
    };
}