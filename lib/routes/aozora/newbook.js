// Warning: The author knows nothing about javascript!

// params:
// count? : count of new-books

const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser
const entities = require('entities');

const base_url = 'https://www.aozora.gr.jp/index_pages/';
module.exports = async (ctx) => {
    // get the update list
    const response = await got({
        method: 'get',
        url: base_url + 'whatsnew1.html',
    });
    const data = response.data; // content is html format

    const $ = cheerio.load(data);
    const list = $('table.list tr');

    // get how many new-books. amount in this page is 50
    let count = parseInt(ctx.params.count);
    if (Number.isNaN(count) || count < 1) {
        count = 10; // default count of new-book list
    } else if (count > 50) {
        count = 50;
    }

    // parse book urls
    const detail_urls = [];
    for (let i = 1; i < count + 1; ++i) {
        // i = 1: first tr is table title, ignore
        const link = base_url + $(list[i]).find('a').attr('href');
        detail_urls.push(link);
    }

    // get book-cards
    const responses = await Promise.all(detail_urls.map((url) => got(url)));
    const cards = responses.map(({ data }) => data);

    // get real data to feed
    const book_list = [];
    for (let i = 0; i < count; ++i) {
        const $ = cheerio.load(cards[i]);
        const link = $('meta[property="og:url"]').attr('content');
        const link_dir = link.replace(/\/[^/]*$/g, '/');
        const title_info = $('table[summary="タイトルデータ"] > tbody > tr');
        let author = '';
        let title = '';
        let title_sub = '';
        for (let j = 0; j < title_info.length; ++j) {
            const tmp = entities.decodeXML($(title_info[j]).html()); // should convert from escaped to unicode
            if (tmp.includes('作品名：')) {
                title = $(title_info[j]).find('td:nth-child(2)').text();
            }
            if (tmp.includes('副題：')) {
                title_sub = $(title_info[j]).find('td:nth-child(2)').text();
            }
            if (tmp.includes('著者名：')) {
                author = $(title_info[j]).find('td:nth-child(2)').text();
            }
        }
        if (title_sub !== '') {
            title += '　——　' + title_sub;
        }
        const pub_date_raw = $('table[summary="底本データ"] > tbody > tr:nth-child(3) > td:nth-child(2)').text();
        const pub_date_num = pub_date_raw.replace(/（.*）|日/g, '').replace(/[年月]/g, '-');
        const pub_date = new Date(pub_date_num).toUTCString();
        const full_text_relative_link = $('table.download > tbody > tr:nth-child(3) > td:nth-child(3) > a').attr('href');
        const full_text_link = link_dir + full_text_relative_link;
        const full_text_link_html = '<a href="' + full_text_link + '">いますぐXHTML版で読む</a><br>';
        const summury = $('table[summary="作品データ"]')
            .html()
            .replace(/href="/g, 'href="' + link_dir);

        const item = {
            title: title,
            author: author,
            pubDate: pub_date,
            link: link,
            description: full_text_link_html + summury,
        };
        book_list.push(item);
    }

    // feed the data
    ctx.state.data = {
        title: '青空文庫新着リスト',
        link: base_url + 'whatsnew1.html',
        item: book_list,
    };
};
