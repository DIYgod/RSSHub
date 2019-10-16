const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://dengekionline.com';
const infos = {
    '': { category: '総合', patch: '' },
    dps: { category: 'PlayStation', patch: 'dps/' },
    nintendo: { category: 'Nintendo', patch: 'nintendo/' },
    app: { category: 'アプリ', patch: 'app/' },
    'dol-7': { category: 'アニメ', patch: 'tags/%E3%82%A2%E3%83%8B%E3%83%A1/' },
    'g-style': { category: 'ガルスタ', patch: 'g-style/' },
    arcade: { category: 'アーケード', patch: 'arcade/' },
    dpc: { category: 'PC', patch: 'dpc/' },
    wiki: { category: '攻略wiki', patch: 'wiki/' },
    'dol-13': { category: 'レビューまとめ', patch: 'tags/%E3%83%AC%E3%83%93%E3%83%A5%E3%83%BC/' },
    softs: { category: 'ゲーム発売予定', patch: 'softs/' },
    'dol-21': { category: '販売ランキング', patch: 'tags/%E3%82%BD%E3%83%95%E3%83%88%E8%B2%A9%E5%A3%B2%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0/' },
    present: { category: 'プレゼント', patch: 'present/' },
    information: { category: 'サイトマップ', patch: 'information/' },
};

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const patch = infos[type].patch;
    const category = infos[type].category;
    const link = `${host}/${patch}`;
    const title = `電撃オンライン - ${category}`;
    const description = 'ゲーム速報を中心に、アプリ、アニメの情報も発信する総合エンタメサイト。ニュース、レビュー、インタビュー、動画などを通じて、最新のゲーム情報を毎日発信。ライトノベル（ラノベ）情報のほか、無料漫画の試し読みも！';

    const response = await got({
        method: 'get',
        url: link,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('ul.gNews_list').find('a');

    const item = list
        .map((index, element) => {
            const liArr = $(element).find('li');
            const image = $(element).find('div.gNews_image');
            const img = image.find('img');
            img.attr('src', img.attr('data-src'));
            img.removeAttr('data-src');

            const title = $(element)
                .find('p.gNews_text')
                .text();
            const patch = $(element).attr('href');
            const description = image.attr('src', '').html();
            const category = liArr.map((index, li) => $(li).text()).get();
            // console.log(img.html());
            const guid = patch.replace('articles', '').replace(/\//g, '');
            const date = $(element)
                .find('time')
                .attr('datetime');

            const single = {
                title: title,
                link: host + patch,
                description: description,
                category: category,
                guid: guid,
                pubDate: new Date(date).toUTCString(),
            };
            return single;
        })
        .get();

    ctx.state.data = {
        title: title,
        description: description,
        link: link,
        language: 'ja-jp',
        item: item,
    };
};
