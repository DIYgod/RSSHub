const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got.get('https://kirarafantasia.com/wp-json/wp/v2/posts');

    const posts = response.data || [];

    ctx.state.data = {
        title: 'NEWS｜きららファンタジア 公式サイト',
        link: 'https://kirarafantasia.com/news/',
        description: '「まんがタイムきらら」の人気キャラクターたちが、RPGの世界に大集合！あなたの毎日が「きらら」でいっぱいに！ #きらファン',
        item: posts.map((post) => {
            const image = `<img src=${post.thumbnail} />`;

            const html = image;

            const [y, m, d] = post.date.match(/\d+/g);
            const date = new Date(y, m - 1, d);

            return {
                title: post.title,
                link: post.url,
                pubDate: date.toUTCString(),
                published: date.toISOString(),
                description: html,
                content: { html },
            };
        }),
    };
};
