const got = require('@/utils/got');
const cheerio = require('cheerio');

async function getArticle(ctx, list) {
    // for 每次可爲 rss 値推入 20 篇文章內容
    const res = [];
    for (let start = 0; start < list.length; start += 20) {
        // 建立一個切片 (20 個文章 URL) 異步獲取文章內容的任務
        const now = list.slice(start, start + 20).map(async(line) => await ctx.cache.tryGet(line, async() => {
                const a_r = await got.get(`https://app3.rthk.hk/mediadigest/${line}`);
                const $ = cheerio.load(a_r.data);
                // title
                const h1 = $('h1.story-title').text();
                // author
                const author_list = $('div.story-author');
                const authors = author_list.map((_index, author) => $(author).text());
                const author = authors.map((_index, author) => `<b>${author}</b><br>`);
                const s_author = author.toArray().join('');
                const author_block = `<blockquote><p>${s_author}</p></blockquote>`;
                // date
                const date = $('div.story-calendar').text();
                // desc
                const desc = `${$(author_block)}${$('div.story-content').html()}`;

                return {
                    title: h1,
                    description: desc,
                    pubDate: new Date(`${date}T09:00:00+0800`).toUTCString(),
                    link: line,
                };
            }));
        // 執行一個切片 (20 個文章 URL) 的任務並將結果資料推至 rss 値
        res.push(...await Promise.all(now));
    }
    return res;
}

module.exports = async(ctx) => {
    const range = ctx.params.range || 'latest';
    const category = ctx.params.category || 'all';

    // for range validation
    const num = /^[1-9][0-9]{3}$/;
    const current_year = new Date().getFullYear();
    // placeholder for rss
    let rss = [{
        description: '<p>Invalid <code>:category?</code> input.</p><p>所輸入<code>:category?</code>參數有誤。</p><p>所输入<code>:category?</code>参数有误。</p>'
    }];
    // cid
    const cids = [1, 2];
    for (let i = 4; i < 28; ++i) {
        cids.push(i);
    }

    // latest (50 articles):
    // if 'all' (latest 50 articles of the site);
    // else if 'cid' (all articles of a specific category);
    // else 'error'.
    if (range === 'latest') {
        if (category === 'all') {
            // 獲取全站文章 URL
            const urls = cids.map((cid) => `https://app3.rthk.hk/mediadigest/category.php?cid=${cid}`);
            const list_allt = await Promise.all(
                urls.map(async(url) => {
                    const response = await got.get(url);
                    const $ = cheerio.load(response.data);
                    const list = $('div.category-line').map((_index, line) => $(line).find('a').first().attr('href'));
                    return Promise.resolve(list.toArray());
                })
            );
            const list_all = [...new Set(list_allt.flat())]; // removed duplicates and flatten
            // 時序排列並抽取最新 50 項
            const list = list_all
                .sort((a, b) => {
                    const aid_a = a.match(/aid=(\d+)/)[1];
                    const aid_b = b.match(/aid=(\d+)/)[1];
                    // reverse
                    return aid_b - aid_a;
                })
                .slice(0, 50);
            // getArticle(ctx, list);
            rss = await getArticle(ctx, list);
        } else if (cids.includes(parseInt(category))) {
            // 獲取特定 category 文章目錄
            const response = await got.get(`https://app3.rthk.hk/mediadigest/category.php?cid=${category}`);
            const $ = cheerio.load(response.data);

            const list = $('div.category-line').map((_index, line) => $(line).find('a').first().attr('href')).toArray();
            rss = await getArticle(ctx, list.slice(0, 50));
        }
    }
    // year (specific year range):
    // if 'all' (all articles in a specific year range);
    // else 'error'.
    else if (num.test(range)) {
        const range_num = parseInt(range);
        if (category === 'all' && range_num >= 1970 && range_num <= current_year) {
            // 獲取全站文章 URL
            const urls = cids.map((cid) => `https://app3.rthk.hk/mediadigest/category.php?cid=${cid}`);
            const list_all = await Promise.all(
                // 每個任務是篩選出一個文章目錄裏需要抓取的文章 URL，以供後續「獲取全文」
                urls.map(async(url) => {
                    const response = await got.get(url);
                    const $ = cheerio.load(response.data);
                    // 對應文章 URL 與年份
                    // Ref: https://cythilya.github.io/2016/03/13/jquery-map-grep/
                    let list = $('div.category-line').map((_index, line) => $(line).find('a').first().attr('href')).toArray();
                    const year = $('div.category-line div.pull-right').map((_index, date) => new Date($(date).text()).getFullYear()).toArray();
                    list = list.filter((_url, i) => year[i] === range_num);
                    // 篩出 list (需要抓取的文章 URL 並組成數列)
                    return Promise.resolve(list);
                })
            );
            const list = [...new Set(list_all.flat())]; // removed duplicates and flatten
            rss = await getArticle(ctx, list);
        }
    }

    ctx.state.data = {
        title: '傳媒透視',
        link: 'https://app3.rthk.hk/mediadigest/index.php',
        item: rss,
    };
};