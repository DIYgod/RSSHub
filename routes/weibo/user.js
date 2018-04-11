const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const uid = req.params.uid;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.get({
                url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
                headers: {
                    'User-Agent': mix.ua,
                    'Referer': 'https://m.weibo.cn/'
                },
            }, function (err, httpResponse, body) {
                let data;
                try {
                    data = JSON.parse(body).data;
                }
                catch (e) {
                    data = {};
                }
                const name = data.userInfo && data.userInfo.screen_name;
                const containerid = data.tabsInfo && data.tabsInfo.tabs && data.tabsInfo.tabs[1] && data.tabsInfo.tabs[1].containerid || '';

                request.get({
                    url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=${containerid}`,
                    headers: {
                        'User-Agent': mix.ua,
                        'Referer': `https://m.weibo.cn/u/${uid}`
                    },
                }, function (err, httpResponse, body) {
                    let data;
                    try {
                        data = JSON.parse(body);
                    }
                    catch (e) {
                        data = {};
                    }

                    // 格式化每条微博的HTML
                    function format (status) {
                        // 长文章的处理
                        let temp = status.longText ? status.longText.longTextContent.replace(/\n/g, '<br>') : status.text;
                        // 表情图标转换为文字
                        temp = temp.replace(/<span class="url-icon"><img src=".*?" style="width:1em;height:1em;" alt="(.*?)"><\/span>/g, '$1');
                        // 去掉外部链接的图标
                        temp = temp.replace(/<span class="url-icon"><img src=".*?"><\/span><\/i>/g, '');
                        // 去掉多余无意义的标签
                        temp = temp.replace(/<span class="surl-text">/g, '');
                        // 最后插入两个空行，让转发的微博排版更加美观一些
                        temp += '<br><br>';

                        // 处理外部链接
                        temp = temp.replace(/https:\/\/weibo\.cn\/sinaurl\/.*?&u=(http.*?")/g, function (match, p1) {
                            return decodeURIComponent(p1);
                        });

                        // 处理转发的微博
                        if (status.retweeted_status) {
                            // 当转发的微博被删除时user为null
                            if (status.retweeted_status.user) {
                                temp += `转发 <a href="https://weibo.com/${status.retweeted_status.user.id}" target="_blank">@${status.retweeted_status.user.screen_name}</a>: `;
                            }
                            // 插入转发的微博
                            temp += format(status.retweeted_status);
                        }

                        // 添加微博配图
                        if (status.pics) {
                            status.pics.forEach(function (item) {
                                temp += '<img referrerpolicy="no-referrer" src="' + item.large.url + '"><br><br>';
                            });
                        }
                        return temp;
                    }

                    const html = art(path.resolve(__dirname, '../../views/rss.art'), {
                        title: `${name}的微博`,
                        link: `http://weibo.com/${uid}/`,
                        description: `${name}的微博`,
                        lastBuildDate: new Date().toUTCString(),
                        item: data.data.cards.filter((item) => item.mblog && !item.mblog.isTop).map((item) => {
                            const title = item.mblog.text.replace(/<.*?>/g, '');
                            return {
                                title: title.length > 24 ? title.slice(0, 24) + '...' : title,
                                description: format(item.mblog),
                                pubDate: new Date(item.mblog.created_at.length === 5 ? `${new Date().getFullYear()}-${item.mblog.created_at}` : item.mblog.created_at).toUTCString(),
                                link: `https://weibo.com/${uid}/${item.mblog.bid}`
                            };
                        }),
                    });
                    callback(html);
                });
            });
        }
    });
};