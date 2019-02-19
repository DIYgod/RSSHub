const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios('http://www.duozhi.com/');
    const $ = cheerio.load(response.data);
    const postList = $('.post-list .post').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item)
                .find('.post-title')
                .find('a')
                .text();
            const link = $(item)
                .find('.post-title')
                .find('a')
                .attr('href');
            const guid = $(item)
                .find('.post-title')
                .find('a')
                .attr('href');
            const temp = await axios(link);
            const description = $(temp.data)
                .find('.subject-content')
                .html()
                .replace(/alt="\\"/g, '');
            const pubDate = new Date(
                $(temp.data)
                    .find('.meta-date')
                    .text()
                    .substr(0, 18)
            ).toUTCString();
            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: description,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '多知网', link: 'http://www.duozhi.com/', description: '独立商业视角 新锐教育观察', item: result };
};
