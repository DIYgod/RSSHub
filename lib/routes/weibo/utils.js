const got = require('@/utils/got');

const weiboUtils = {
    format: (status) => {
        // 长文章的处理
        let temp = (status.longText && status.longText.longTextContent.replace(/\n/g, '<br>')) || status.text || '';
        // 去掉外部链接的图标
        temp = temp.replace(/<span class=["|']url-icon["|']>.*?网页链接<\/span>/g, '网页链接');
        // 表情图标转换为文字
        temp = temp.replace(/<span class="url-icon"><img.*?alt="(.*?)".*?><\/span>/g, '$1');
        // 去掉乱七八糟的图标
        temp = temp.replace(/<span class=["|']url-icon["|']>(.*?)<\/span>/g, '');
        // 去掉全文
        temp = temp.replace(/全文<br>/g, '<br>');
        temp = temp.replace(/<a href="(.*?)">全文<\/a>/g, '');

        // 处理外部链接
        temp = temp.replace(/https:\/\/weibo\.cn\/sinaurl\/.*?&u=(http.*?")/g, function(match, p1) {
            return decodeURIComponent(p1);
        });

        // 处理转发的微博
        if (status.retweeted_status) {
            // 当转发的微博被删除时user为null
            if (status.retweeted_status.user) {
                temp += `转发 <a href="https://weibo.com/${status.retweeted_status.user.id}" target="_blank">@${status.retweeted_status.user.screen_name}</a>: `;
            }
            // 插入转发的微博
            temp += weiboUtils.format(status.retweeted_status);
        }

        // 添加微博配图
        if (status.pics) {
            status.pics.forEach(function(item) {
                temp += '<img referrerpolicy="no-referrer" src="' + item.large.url + '"><br><br>';
            });
        }
        return temp;
    },
    getShowData: (uid, bid) =>
        new Promise(async function(resolve) {
            const link = `https://m.weibo.cn/statuses/show?id=${bid}`;
            const itemResponse = await got.get(link, {
                headers: {
                    Referer: `https://m.weibo.cn/u/${uid}`,
                    'MWeibo-Pwa': 1,
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                },
            });
            resolve(itemResponse.data.data);
        }),
};

module.exports = weiboUtils;
