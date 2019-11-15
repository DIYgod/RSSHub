const got = require('@/utils/got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const host = 'https://www.guancha.cn';
    const ptype = {
        all: { name: '首页Feeds', url: 'https://www.guancha.cn/' },
        redian: { name: '热点新闻', url: 'https://www.guancha.cn/api/redian.htm' },
        member: { name: '观察者', url: 'https://www.guancha.cn/api/member.htm' },
        gundong: { name: '滚动新闻', url: 'https://www.guancha.cn/api/new_gundong.htm' },
    };
    // 定义list存放请求数据,htmlarr暂存html数据组,outList存放输出的数据组
    const list = [],
        htmlarr = [],
        temp = [],
        HomeFeeds = [],
        RedianFeeds = [],
        MemberFeeds = [],
        GundongFeeds = [];
    let AllFeeds = [];
    // 获取新闻url过来的时间/ID
    function getData(jscontent, option) {
        switch (option) {
            case 'date': {
                const jsoutput = String(jscontent)
                    .substr(-23, 10)
                    .replace(/_/g, '-');
                return new Date(jsoutput).toLocaleDateString();
            }
            case 'urlid': {
                const jsoutput = String(jscontent).substr(-12, 6);
                return jsoutput;
            }
            default: {
                break;
            }
        }
    }
    // 循环获取ptype每个请求的数据内容
    for (const key in ptype) {
        const link = ptype[key].url;
        // eslint-disable-next-line no-await-in-loop
        const response = await got({
            method: 'get',
            url: link,
            headers: {
                Referer: host,
            },
        });
        // 由于数据结构不太一致，将所有的数据内容抽离提取成统一的对象
        if (key === 'all') {
            list[0] = response.data;
        }
        const $ = cheerio.load(list[0]);
        switch (key) {
            case 'all':
                // 获取头条 + 清理不带有h4标题的li
                htmlarr[0] = $('.content-headline').first();
                htmlarr[1] = $('.Review-item li h4').parent();
                htmlarr[2] = $('.img-List li h4').parent();
                $('.author-intro img')
                    .parent()
                    .remove();
                $('.module-img-head img')
                    .parent()
                    .remove();
                htmlarr[3] = $('[class="module-news gray"] .module-news-main')
                    .first()
                    .children();
                htmlarr[4] = $('[class="module-news-main mt15"]').children();
                temp.length = 0;
                temp.push(
                    htmlarr[0].map((index, item) => {
                        item = $(item);
                        const herfString = item.find('h3>a').attr('href');
                        const feed = {
                            category: ptype[key].name + '头条',
                            id: getData(herfString, 'urlid'),
                            title: item
                                .find('h3')
                                .text()
                                .trim(),
                            pageurl: host + herfString,
                            picurl: item
                                .find('a>img')
                                .first()
                                .attr('src'),
                            description:
                                item
                                    .find('h3')
                                    .text()
                                    .trim() +
                                `<img src="${item
                                    .find('a>img')
                                    .first()
                                    .attr('src')}" referrerpolicy="no-referrer" />`,
                            date: getData(herfString, 'date'),
                        };
                        return feed;
                    })
                );
                temp.push(
                    htmlarr[1].map((index, item) => {
                        item = $(item);
                        const herfString = item.find('h4.module-title>a').attr('href');
                        const feed = {
                            category: ptype[key].name + '左1列',
                            id: getData(herfString, 'urlid'),
                            title: item
                                .find('h4.module-title')
                                .text()
                                .trim(),
                            pageurl: host + herfString,
                            picurl: item.find('a.module-img>img').attr('src'),
                            description:
                                item
                                    .find('p.module-artile')
                                    .text()
                                    .trim() +
                                `<br/><a href=${host}${herfString} target="_blank"><img src="` +
                                item.find('a.module-img>img').attr('src') +
                                `" referrerpolicy="no-referrer" /><br/>【全文阅读】</a>`,
                            date: getData(herfString, 'date'),
                        };
                        return feed;
                    })
                );
                temp.push(
                    htmlarr[2].map((index, item) => {
                        item = $(item);
                        const herfString = item.find('h4.module-title>a').attr('href');
                        const feed = {
                            category: ptype[key].name + '中间+右边2列',
                            id: getData(herfString, 'urlid'),
                            title: item
                                .find('h4.module-title')
                                .text()
                                .trim(),
                            pageurl: item.find('div.fastRead-img a>img').attr('src'),
                            picurl: item.find('a>img').attr('src'),
                            description:
                                item.find('.resemble-art').html() +
                                `<br/><a href=${host}${herfString} target="_blank"><img src="` +
                                item.find('div.fastRead-img a>img').attr('src') +
                                `" referrerpolicy="no-referrer" /><br/>【全文阅读】</a>`,
                            date: getData(herfString, 'date'),
                        };
                        return feed;
                    })
                );
                temp.push(
                    htmlarr[3].map((index, item) => {
                        item = $(item);
                        const herfString = item
                            .find('a')
                            .first()
                            .attr('href');
                        const feed = {
                            category: ptype[key].name + '左列: 访谈、论坛',
                            id: getData(herfString, 'urlid'),
                            title: item
                                .find('a')
                                .first()
                                .text(),
                            pageurl: host + herfString,
                            picurl: `0`,
                            description:
                                item
                                    .find('a')
                                    .first()
                                    .text() +
                                item
                                    .find('p')
                                    .first()
                                    .text() +
                                `<br/><a href=${host}${herfString} target="_blank"><br/>【全文阅读】</a>`,
                            date: getData(herfString, 'date'),
                        };
                        return feed;
                    })
                );
                temp.push(
                    htmlarr[4].map((index, item) => {
                        item = $(item);
                        const herfString = item
                            .find('a')
                            .first()
                            .attr('href');
                        const feed = {
                            category: ptype[key].name + '右列: 历史、深度',
                            id: getData(herfString, 'urlid'),
                            title: item
                                .find('a')
                                .first()
                                .text(),
                            pageurl: host + herfString,
                            picurl: `0`,
                            description:
                                item
                                    .find('a')
                                    .first()
                                    .text() + `<br/><a href=${host}${herfString} target="_blank"><br/>【全文阅读】</a>`,
                            date: getData(herfString, 'date'),
                        };
                        return feed;
                    })
                );
                // 集结所有feeds对象给到HomeFeeds;
                for (let i = 0; i < temp.length; i++) {
                    for (let k = 0; k < temp[i].length; k++) {
                        HomeFeeds.push(temp[i][k]);
                    }
                }
                break;
            case 'redian':
                list[1] = response.data.items;
                temp.length = 0;
                temp.push(
                    list[1].map((item) => ({
                        category: ptype[key].name + '_热点',
                        id: '0',
                        title: '[热点]' + item.TITLE,
                        pageurl: host + '/' + item.HTTP_URL,
                        date: getData(item.HTTP_URL, 'date'),
                        picurl: '0',
                    }))
                );
                // 集结所有feeds对象给到RedianFeeds;
                for (let i = 0; i < temp.length; i++) {
                    for (let k = 0; k < temp[i].length; k++) {
                        RedianFeeds.push(temp[i][k]);
                    }
                }
                break;
            case 'member':
                list[2] = response.data.items;
                temp.length = 0;
                temp.push(
                    list[2].map((item) => ({
                        category: ptype[key].name + '_右列观察员',
                        id: item.id,
                        title: '[付费]' + item.title,
                        pageurl: 'https://member.guancha.cn/post/view?id=' + item.id,
                        picurl: item.h_pic,
                        description: item.title + `<img src="${item.h_pic}" referrerpolicy="no-referrer" />`,
                        date: item.created_at,
                    }))
                );
                // 集结所有feeds对象给到MemberFeeds;
                for (let i = 0; i < temp.length; i++) {
                    for (let k = 0; k < temp[i].length; k++) {
                        MemberFeeds.push(temp[i][k]);
                    }
                }
                break;
            case 'gundong':
                list[3] = response.data.fenghot;
                list[4] = response.data.member;
                list[5] = response.data.kuaixun;
                temp.length = 0;
                temp.push(
                    list[5].map((item) => ({
                        category: ptype[key].name + '_滚动新闻',
                        id: '0',
                        title: '[滚动新闻]' + item.TITLE,
                        pageurl: host + '/' + item.HTTP_URL,
                        picurl: '0',
                        date: getData(item.HTTP_URL, 'date'),
                    }))
                );
                temp.push(
                    list[3].map((item) => ({
                        category: ptype[key].name + '_风闻7天最热',
                        id: item.id,
                        title: '[风闻7天最热]' + item.title,
                        pageurl: 'https://user.guancha.cn/main/content?id=' + item.id,
                        picurl: '0',
                    }))
                );
                temp.push(
                    list[4].map((item) => ({
                        category: ptype[key].name + '_观察员',
                        id: item.id,
                        title: '[观察员付费]' + item.title,
                        pageurl: 'https://member.guancha.cn/post/view?id=' + item.id,
                        picurl: '0',
                    }))
                );

                for (let i = 0; i < temp.length; i++) {
                    for (let k = 0; k < temp[i].length; k++) {
                        GundongFeeds.push(temp[i][k]);
                    }
                }
                break;
        }
    }
    // 集合所有数据,控制分类输出
    switch (type) {
        case 'all':
            AllFeeds = HomeFeeds.concat(RedianFeeds, MemberFeeds, GundongFeeds);
            break;
        case 'home':
            AllFeeds = HomeFeeds;
            break;
        case 'others':
            AllFeeds = RedianFeeds.concat(MemberFeeds, GundongFeeds);
            break;
        default:
            AllFeeds = HomeFeeds;
            break;
    }
    ctx.state.data = {
        title: `观察者-首页新闻`,
        link: host,
        description: `观察者网，致力于荟萃中外思想者精华，鼓励青年学人探索，建中西文化交流平台，为崛起中的精英提供决策参考。`,
        allowEmpty: true,
        item: AllFeeds.map((item) => ({
            title: item.title,
            description: item.description || item.title + `<br/><a href=${item.pageurl} target="_blank"><br/>【全文阅读】</a>`,
            pubDate: item.date || new Date().toLocaleDateString(),
            link: item.pageurl,
            category: item.category,
            author: item.category,
            guid: item.id,
        })),
    };
};
