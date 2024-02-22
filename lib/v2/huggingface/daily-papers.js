const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { body: response } = await got('https://huggingface.co/papers');
    const $ = cheerio.load(response);
    const papers = $('main > div[data-target="DailyPapers"]').data('props');

    const items = papers.dailyPapers
        .map((item) => ({
            title: item.title,
            link: `https://arxiv.org/abs/${item.paper.id}`,
            description: item.paper.summary.replaceAll('\n', ' '),
            pubDate: parseDate(item.publishedAt),
            author: item.paper.authors.map((author) => author.name).join(', '),
            upvotes: item.paper.upvotes,
        }))
        .sort((a, b) => b.upvotes - a.upvotes);

    ctx.state.data = {
        title: 'Huggingface Daily Papers',
        link: 'https://huggingface.co/papers',
        item: items,
    };
};
