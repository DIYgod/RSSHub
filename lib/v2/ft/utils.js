const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');

const ParseContent = (content, type = 'p') => (content ? `<${type}>${content}</${type}>` : '');

const ProcessJson = (item, json_data) => {
    item.title = json_data.cheadline;
    item.author = json_data.cauthor.replace(/<\/?.+?>/g, '');
    item.pubDate = new Date(Math.max(json_data.pubdate, json_data.last_publish_time) * 1000).toUTCString();

    item.description = '';
    item.description += ParseContent(`「${json_data.clongleadbody}」`);
    if (json_data.cshortleadbody.endsWith('.mp3')) {
        if (json_data.story_pic && json_data.story_pic.smallbutton) {
            item.itunes_item_image = json_data.story_pic.smallbutton;
        }
        item.enclosure_url = json_data.cshortleadbody;
        item.enclosure_type = 'audio/mpeg';
    } else {
        // seem only to be meta data
        // item.description += ParseContent(json_data.cshortleadbody);
    }
    if (json_data.story_pic && json_data.story_pic.smallbutton) {
        item.description += `<img src="${json_data.story_pic.smallbutton}"/>`;
    }
    item.description += ParseContent(json_data.cbody);
    item.description += '<br>';
    item.description += ParseContent(`<b>${json_data.eheadline}</b>`);
    item.description += ParseContent(json_data.elongleadbody);
    item.description += ParseContent(json_data.ebody);

    return item;
};

const ProcessWebview = (feed, $, ctx, site, channel) => {
    if (!feed || !feed.length) {
        if (ctx.params.language === 'chinese') {
            feed.title = 'FT 中文网';
            feed.description =
                'FT 中文网是英国《金融时报》唯一的非英语网站，致力于向中国商业菁英和企业决策者及时提供来自全球的商业、经济、市场、管理和科技新闻，同时报道和评论对中国经济和全球商业真正重大且具影响力的事件并揭示事态的来龙去脉。';
        } else {
            feed.title = 'FT 中文網';
            feed.description =
                'FT 中文網是英國《金融時報》唯一的非英語網站，致力於向中國商業菁英和企業決策者及時提供來自全球的商業、經濟、市場、管理和科技新聞，同時報導和評論對中國經濟和全球商業真正重大且具影響力的事件並揭示事態的來龍去脈。';
        }
        if (channel) {
            feed.title += ` - ${channel}`;
            feed.link = `https://${site}/${channel}`;
        } else {
            feed.link = `https://${site}`;
        }
    }
    feed.items = $('.items > .item-container')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h2').text(),
                description: item.find('.item-lead').text(),
                link: item.attr('data-type') ? `https://${site}/${item.attr('data-type')}/${item.attr('data-id')}` : `https://${site}${item.find('a').attr('href')}`,
            };
        })
        .get();
};

const ProcessFeed = (i, $, link) => {
    const title = $('h1').text();
    let content = $('div.story-container').eq(i);

    // 处理封面图片
    content.find('div.story-image > figure').each((_, e) => {
        const src = `https://thumbor.ftacademy.cn/unsafe/1340x754/${e.attribs['data-url']}`;

        $(`<img src=${src}>`).insertAfter(content.find('div.story-lead')[0]);
    });

    // 付费文章跳转
    content.find('div#subscribe-now-container').each((_, e) => {
        $(`<br/><p>此文章为付费文章，会员<a href='${link}'>请访问网站阅读</a>。</p>`).insertAfter(content.find('div.story-body')[0]);
        $(e).remove();
    });

    // 获取作者
    let author = '';
    content.find('span.story-author > a').each((_, e) => {
        author += `${$(e).text()} `;
    });
    author = author.trim();

    // 去除头部主题, 头部重复标题, 冗余元数据, 植入广告, 植入 js, 社交分享按钮, 底部版权声明, 空白 DOM
    content
        .find(
            'div.story-theme, h1.story-headline, div.story-byline, div.mpu-container-instory,script, div#story-action-placeholder, div.copyrightstatement-container, div.clearfloat, div.o-ads, h2.list-title, div.allcomments, div.logincomment, div.nologincomment'
        )
        .each((_, e) => {
            $(e).remove();
        });
    content = content.html();

    return { content, author, title };
};

const getData = async ({ site = 'www.ftchinese.com', channel, ctx }) => {
    let feed = {};

    if (channel) {
        channel = channel.toLowerCase();
        channel = channel.split('-').join('/');

        try {
            feed = await parser.parseURL(`https://${site}/rss/${channel}`);
        } catch (error) {
            try {
                const previewResponse = await got.get(`https://${site}/${channel}?webview=ftcapp&bodyonly=yes&maxB=1&device=iPad`);
                const $ = cheerio.load(previewResponse.data);
                ProcessWebview(feed, $, ctx, site, channel);
            } catch (error) {
                return {
                    title: `FT 中文网 ${channel} 不存在`,
                    description: `FT 中文网 ${channel} 不存在`,
                };
            }
        }
    } else {
        try {
            const previewResponse = await got.get(`https://${site}/?webview=ftcapp&bodyonly=yes&maxB=1&device=iPad`);
            const $ = cheerio.load(previewResponse.data);
            ProcessWebview(feed, $, ctx, site, channel);
        } catch (error) {
            feed = await parser.parseURL(`https://${site}/rss/feed`);
        }
    }

    const items = await Promise.all(
        feed.items.map((item) => {
            item.link = item.link.replace('http://', 'https://');
            return ctx.cache.tryGet(item.link, async () => {
                let json_data;
                try {
                    let item_type = item.link.split('/')[3];
                    if (item_type === 'video') {
                        json_data = undefined;
                    } else {
                        if (item_type !== 'interactive') {
                            item_type = 'story';
                        }
                        const item_id = item.link.split('/')[4];
                        const json_response = await got.get(`https://${site}/index.php/jsapi/get_${item_type}_more_info/${item_id}`);
                        json_data = json_response.data;
                        if (json_data.id !== item_id) {
                            json_data = undefined;
                        }
                    }
                } catch (error) {
                    json_data = undefined;
                }
                if (json_data) {
                    return ProcessJson(item, json_data);
                } else {
                    try {
                        const response = await got.get(`${item.link}?full=y&archive`);
                        const $ = cheerio.load(response.data);
                        const results = [];
                        for (let i = 0; i < $('div.story-container').length; i++) {
                            results.push(ProcessFeed(i, $, item.link));
                        }

                        item.title = results[0].title;
                        item.description = results.map((result) => result.content).join('');
                        item.author = results[0].author;
                    } catch (error) {
                        // nothing
                    }
                    return item;
                }
            });
        })
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};

module.exports = {
    getData,
};
