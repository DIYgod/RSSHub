const got = require('@/utils/got');
const pediyUtils = require('./utils');
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
    translate: [32, '外文翻译'],
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const type = ctx.params.type || 'latest';
    let path;
    let title;
    if (categoryId.hasOwnProperty(category)) {
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
        if (category === 'digest') {
            path = 'new-digest.htm';
            title = '看雪论坛精华主题';
        } else {
            path = 'new-tid.htm';
            title = '看雪论坛最新主题';
        }
    }

    const response = await got({
        method: 'get',
        url: baseUrl + path,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.thread');

    const resultItem = await Promise.all(
        list
            ? list
                  // fix .thread .top_3
                  .filter((_, elem) => {
                      const pubDate = pediyUtils.dateParser($('.date', elem).eq(0).text(), 8);
                      return elem.attribs.class.indexOf('top') === -1 || new Date() - new Date(pubDate) < 1000 * 60 * 60 * 24 * 3;
                  })
                  .map(async (_, elem) => {
                      const subject = $('.subject a', elem).eq(1);
                      const pubDate = pediyUtils.dateParser($('.date', elem).eq(0).text(), 8);

                      const link = `${baseUrl}${subject.attr('href')}`;
                      const key = `pediy: ${link}`;
                      const value = await ctx.cache.get(key);
                      let description;

                      if (value) {
                          description = value;
                      } else {
                          const postDetail = await got({
                              method: 'get',
                              url: link,
                          });
                          const $ = cheerio.load(postDetail.data);
                          $('.card')
                              .eq(0)
                              .find('.message img')
                              .each((_, item) => {
                                  item = $(item);

                                  const src = item.attr('src');
                                  if (typeof src !== 'undefined' && !src.startsWith('https://') && !src.startsWith('http://')) {
                                      item.attr('src', `https://bbs.pediy.com/${src}`);
                                  }
                                  item.attr('referrerpolicy', 'no-referrer');
                              });

                          description = $('.card').eq(0).find('.message').html();
                          ctx.cache.set(key, description);
                      }

                      return Promise.resolve({
                          title: subject.text(),
                          link,
                          pubDate: new Date(pubDate),
                          description,
                      });
                  })
                  .get()
            : []
    );

    ctx.state.data = {
        title,
        link: baseUrl + path,
        item: resultItem,
    };
};
