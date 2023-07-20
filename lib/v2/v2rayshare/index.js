const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { data: response } = await got('https://v2rayshare.com/');
    const $ = cheerio.load(response);

    const body = $('body > main > div > div > div.content-wrapper.col-lg-8 > div > div'); // 正文列表

    const items = [];
    for (let i = 0; i < body.length; i++) {
        const im = body.eq(i).children().eq(0).children().eq(0); // 标题的a标签
        const year = im.attr('title').split('」')[1].split('年')[0];
        const month = im.attr('title').split('「')[1].split('月')[0].padStart(2, '0');
        const day = im.attr('title').split('月')[1].split('日')[0].padStart(2, '0');
        const html = `<b>Clash节点：</b><a href='https://v2rayshare.com/wp-content/uploads/${year}/${month}/${year}${month}${day}.yaml'>https://v2rayshare.com/wp-content/uploads/${year}/${month}/${year}${month}${day}.yaml</a></br></br>温馨提示：本站提供的都是免费且公共的节点，稳定性与长时间连接速率无法与收费版的高速机场节点相提并论，不能奢望太多。</br>注意你自己的网络环境（本地连接当中的DNS，手动配置一下：114.114.114.114，8.8.8.8或是其它公共的DNS。）</br>如果某个网址无法代理访问，可切换到全局代理模式，一般可解决。`;
        const a = {
            title: im.attr('title'),
            link: im.attr('href'),
            author: 'V2rayShare',
            category: ['免费节点'],
            pubDate: parseDate(`${year}/${month}/${day}`),
            description: html
        };
        items.push(a);
    }

    ctx.state.data = {
        title: 'V2rayShare',
        link: 'https://v2rayshare.com/',
        description : '免费节点分享网站',
        item: items
    };
};

