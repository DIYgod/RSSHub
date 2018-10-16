// Warning: The author knows nothing about javascript!

const axios = require('../../utils/axios'); // get web content
const cheerio = require('cheerio'); // html parser

const base_url = 'https://www.aozora.gr.jp/index_pages/';
module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: base_url + 'whatsnew1.html',
    });

    const data = response.data; // content is html format

    const $ = cheerio.load(data);
    const list = $('table.list tr');

    let count = parseInt(ctx.params.count); // get how many new-books. amount in this page is 50
    if (Number.isNaN(count) || count < 1) {
        count = 10; // default count of new-book list
    } else if (count > 50) {
        count = 50;
    }

    const book_list = [];
    for (let i = 1; i < count + 1; ++i) {
        // first tr is table title
        const date_raw = $(list[i])
            .find('td:nth-child(1)')
            .text();
        const pubDate = new Date(date_raw).toUTCString();
        const title = $(list[i])
            .find('td:nth-child(2)')
            .text();
        const link =
            base_url +
            $(list[i])
                .find('a')
                .attr('href');
        const author = $(list[i])
            .find('td:nth-child(3)')
            .eq(0)
            .html()
            .replace('<br>', '、');

        // get book info page for description
        const response = axios({
            method: 'get',
            url: link,
        });
        const data_info = response.data;
        const info = cheerio.load(data_info);
        const cur_dir = info('meta[property="og:url"]')
            .attr('content')
            .replace(/\/[^/]*$/g, '/'); // seems no lazy mode?
        const description = info('table[summary="作品データ"]')
            .html()
            .replace(/href="/g, 'href="' + cur_dir);

        const item = {
            title: title.trim(), // trim before put into object
            pubDate: pubDate.trim(),
            link: link.trim(),
            description: description.trim(),
            author: author.trim(),
        };
        book_list.push(item);
    }

    ctx.state.data = {
        title: '青空文庫新着リスト',
        link: base_url + 'whatsnew1.html',
        item: book_list,
    };
};
