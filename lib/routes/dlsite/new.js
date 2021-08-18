const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.dlsite.com';
const infos = {
    // 全年齢向け
    home: {
        type: 'home',
        name: '「DLsite 同人」',
        url: '/home/new',
    },
    comic: {
        type: 'comic',
        name: '「DLsite コミック」',
        url: '/comic/new',
    },
    soft: {
        type: 'soft',
        name: '「DLsite PCソフト」',
        url: '/soft/new',
    },
    // 成人向け( R18 )
    maniax: {
        type: 'maniax',
        name: '「DLsite 同人 - R18」',
        url: '/maniax/new',
    },
    books: {
        type: 'books',
        name: '「DLsite 成年コミック - R18」',
        url: '/books/new',
    },
    pro: {
        type: 'pro',
        name: '「DLsite 美少女ゲーム」',
        url: '/pro/new',
    },
    // 女性向け
    girls: {
        type: 'girls',
        name: '「DLsite 乙女」',
        url: '/girls/new',
    },
    bl: {
        type: 'bl',
        name: '「DLsite BL」',
        url: '/bl/new',
    },
};

module.exports = async (ctx) => {
    const info = infos[ctx.params.type];
    // 判断参数是否合理
    if (info === undefined) {
        throw Error('不支持指定类型！');
    }

    const link = info.url.slice(1);

    const response = await got(link, {
        method: 'GET',
        prefixUrl: host,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const list = $('.n_worklist_item');
    const dateText = $('.work_update')
        .text()
        .replace(/(年 |月)/g, '-')
        .substring(0, 10);
    const pubDate = new Date(`${dateText} GMT+0900`).toUTCString();
    const item = list
        .map((index, element) => {
            const title = $('.work_name', element).text();
            const link = $('.work_name > a', element).attr('href');
            // 使链接
            $('a', element).each((index, element) => {
                $(element).attr('target', '_blank');
            });
            const description = $(element).html();
            const arr = $('.search_tag', element);
            const category = $('a', arr)
                .map((index, a) => $(a).text())
                .get();
            const author = $('.maker_name', element).text();

            const signle = {
                title,
                link,
                description,
                category,
                author,
                pubDate,
            };
            return signle;
        })
        .get();

    ctx.state.data = {
        title,
        link,
        description,
        language: 'ja-jp',
        item,
    };
};
