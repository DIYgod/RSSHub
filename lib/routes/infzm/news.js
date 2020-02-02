const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://www.infzm.com/contents';

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${baseUrl}?term_id${id}`;
    const response = await got({
        method: 'get',
        url: `http://www.infzm.com/contents?term_id=${id}&page=1&format=json`,
        headers: {
            Referer: link,
        },
    });
    const data = response.data.data;
    const resultItem = await Promise.all(
        data.contents.map(async ({ id, subject, author, publish_time }) => {
            const date = new Date(publish_time);
            const link = `http://www.infzm.com/contents/${id}`;
            let description = '';

            const key = `infzm: ${link}`;
            const value = await ctx.cache.get(key);

            if (value) {
                description = value;
            } else {
                const response = await got({
                    method: 'get',
                    url: `http://api.infzm.com/mobile/contents/${id}`,
                });

                if (response.data.code === 200) {
                    description = response.data.data.content.fulltext;
                } else {
                    // 有时候接口会返回未发布但实际已发布
                    const response = await got({
                        method: 'get',
                        url: `http://www.infzm.com/content/${id}`,
                        headers: {
                            Referer: link,
                            Cookie: `PHPSESSID=${Math.floor(Math.random() * 100)};`,
                        },
                    });
                    const $ = cheerio.load(response.data);
                    description = $('#content').html();
                }

                ctx.cache.set(key, description);
            }

            return {
                title: subject,
                description,
                pubDate: date.toUTCString(),
                link,
                author,
            };
        })
    );

    ctx.state.data = {
        title: `南方周末-${data.current_term.title}`,
        link,
        item: resultItem,
    };
};
