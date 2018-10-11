const axios = require('../../utils/axios');
const dateHelper = require('../../utils/date');
const cheerio = require('cheerio');

const baseUrl = 'https://bbs.pediy.com/';
const categoryId = {
    iot: [128, '智能设备'],
    blockchain: [172, '区块链安全'],
    android: [161, 'Android安全'],
    ios: [166, 'iOS安全'],
    re: [4, '软件逆向'],
    coding: [41, '编程技术'],
    unpack: [88, '加壳脱壳'],
    crypto: [132, '密码算法'],
    vuln: [150, '二进制漏洞'],
    crackme: [37, 'CrackMe'],
    pwn: [171, 'Pwn'],
    web: [151, 'WEB安全'],
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const type = ctx.params.type || 'latest';
    let path;
    let title;
    let isSpecific;

    if (categoryId.hasOwnProperty(category)) {
        isSpecific = true;
        if (type === 'digest') {
            // type为digest时只获取精华帖
            path = `forum-${categoryId[category][0]}-1.htm?digest=1`;
            title = `看雪论坛精华主题 - ${categoryId[category][1]}`;
        } else {
            // type为空/非法/latest时则只获取最新帖
            path = `forum-${categoryId[category][0]}.html`;
            title = `看雪论坛最新主题 - ${categoryId[category][1]}`;
        }
    } else {
        // category未知时则获取全站最新帖
        isSpecific = false;
        if (category === 'digest') {
            path = 'new-digest.htm';
            title = '看雪论坛精华主题';
        } else {
            path = 'new-tid.htm';
            title = '看雪论坛最新主题';
        }
    }

    const response = await axios({
        method: 'get',
        url: baseUrl + path,
        headers: {
            Referer: baseUrl,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: `${title}`,
        link: baseUrl + path,
        item: $('.thread')
            .map((_, elem) => {
                const subject = $('.subject a', elem).eq(1);
                const author = $('.username', elem).eq(0);

                let pubDate = $('.date', elem).eq(0);
                if (pubDate.text().indexOf('前') !== -1) {
                    pubDate = dateHelper(pubDate.text(), 8);
                } else {
                    pubDate = pubDate.text();
                }

                let topic;
                if (isSpecific) {
                    topic = categoryId[category][1];
                } else {
                    topic = $('.subject a.small', elem)
                        .eq(0)
                        .text();
                }

                return {
                    title: subject.text(),
                    link: baseUrl + subject.attr('href'),
                    pubDate: pubDate,
                    description: `作者: ${author.text()} 版块: ${topic}`,
                };
            })
            .get(),
    };
};
