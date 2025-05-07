const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const nitterInstance = 'https://nitter.poast.org'; 

    const url = `${nitterInstance}/${id}`;

    const response = await got(url);
    const html = response.data;

    const matches = [...html.matchAll(/<div class="timeline-item">([\s\S]*?)<a href="([^"]+)" class="tweet-link"[^>]*?>([^<]*)<\/a>/g)];
    const items = matches.map((m) => ({
        title: m[3].trim(),
        description: m[1].trim(),
        link: `${nitterInstance}${m[2]}`,
        pubDate: parseDate(m[3]),
    }));

    ctx.state.data = {
        title: `Nitter / ${id}`,
        link: url,
        item: items,
    };
};
