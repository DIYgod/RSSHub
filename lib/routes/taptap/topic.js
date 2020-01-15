const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const label = ctx.params.label;

    let url = `https://www.taptap.com/app/${id}/topic`;

    if (label === 'elite' || label === 'official' || label === 'all') {
        url += `?type=${label}`;
    } else if (/^\d+$/.test(label)) {
        url += `?group_label_id=${label}`;
    }

    const topics_list_response = await got.get(url);
    const topics_list_data = topics_list_response.data;
    const $ = cheerio.load(topics_list_data);

    const app_img = $('.group-info > a > img').attr('src');
    const app_name = $('.breadcrumb > li.active').text();
    const label_name = $('.tab-label a.active span').text();
    const topics_list = $('.item-content').toArray();

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        const author = $('.user-name-identity');
        const content = $('.topic-content > .bbcode-body');
        const time = $('.topic-update-time').length === 0 ? $('.topic-info [data-dynamic-time]') : $('.topic-update-time [data-dynamic-time]');
        const pub_date = time.length === 0 ? new Date() : new Date(time.text().trim());

        const images = $('img');
        for (let k = 0; k < images.length; k++) {
            $(images[k]).replaceWith(`<img src="${$(images[k]).attr('data-origin-url')}" />`);
        }

        return {
            author: author.text().trim(),
            description: content.html(),
            pubDate: pub_date,
        };
    };

    const out = await Promise.all(
        topics_list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.item-title > a');
            const link = title.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const topic = {
                title: title.text().trim(),
                link: link,
            };

            try {
                const topic_response = await got.get(link);
                const result = parseContent(topic_response.data);
                if (!result.description) {
                    return Promise.resolve('');
                }

                topic.author = result.author;
                topic.description = result.description;
                topic.pubDate = result.pubDate;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(topic));
            return Promise.resolve(topic);
        })
    );

    ctx.state.data = {
        title: `TapTap论坛 ${app_name} - ${label_name}`,
        link: url,
        image: app_img,
        item: out.filter((item) => item !== ''),
    };
};
