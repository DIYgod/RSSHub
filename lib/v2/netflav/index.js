const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const { join } = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://netflav.com';
    const { data } = await got(baseUrl);

    const $ = cheerio.load(data);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const {
        head,
        props: { initialState },
    } = nextData;

    const items = [...initialState.censored.docs, ...initialState.uncensored.docs, ...initialState.chinese.docs, ...initialState.trending.docs].map((item) => ({
        title: item.title,
        description: art(join(__dirname, 'templates/description.art'), {
            description: item.description,
            images: [...new Set([item.preview_hp, item.preview, item.previewImagesUrl, ...(item.previewImages || [])])].filter(Boolean),
        }),
        link: `https://netflav.com/video?id=${item.videoId}`,
        pubDate: parseDate(item.sourceDate),
        author: [...new Set(item.actors.map((a) => a.replace(/^(\w{2}:)/, '')))].join(', '),
        category: [...new Set(item.tags?.map((t) => t.replace(/^(\w{2}:)/, '')))],
    }));

    ctx.state.data = {
        title: head.find((h) => h[0] === 'title')[1].children,
        description: head.find((h) => h[0] === 'meta' && h[1].name === 'description')[1].content,
        logo: `${baseUrl}${head.find((h) => h[0] === 'meta' && h[1].property === 'og:image')[1].content}`,
        image: `${baseUrl}${head.find((h) => h[0] === 'meta' && h[1].property === 'og:image')[1].content}`,
        link: baseUrl,
        item: items,
        allowEmpty: true,
    };
};
