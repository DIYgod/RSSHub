const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { body: response } = await got('https://huggingface.co/papers');
    const $ = cheerio.load(response);
    const papers_json = $('main > div[class="SVELTE_HYDRATER contents"]')[0].attribs['data-props'];
    const papers = JSON.parse(papers_json);

    const items = papers.dailyPapers.map((item) => ({
        title: item.title,
        link: `https://arxiv.org/abs/${item.paper.id}`,
        description: item.paper.summary.replace(/\n/g, ' '),
        pubDate: parseDate(item.publishedAt),
        author: item.paper.authors.map((author) => author.name).join(', '),
    }));

    ctx.state.data = {
        title: 'Huggingface Daily Papers',
        link: 'https://huggingface.co/papers',
        item: items,
    };
};
