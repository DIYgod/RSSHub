const weiboUtils = {
    format: (status) => {
        // 长文章的处理
        let temp = (status.longText && status.longText.longTextContent.replace(/\n/g, '<br>')) || status.text || '';
        // 表情图标转换为文字
        temp = temp.replace(/<span class="url-icon"><img src=".*?" style="width:1em;height:1em;" alt="(.*?)"><\/span>/g, '$1');
        // 去掉外部链接的图标
        temp = temp.replace(/<span class="url-icon"><img src=".*?"><\/span><\/i>/g, '');
        // 去掉多余无意义的标签
        temp = temp.replace(/<span class="surl-text">/g, '');
        // 最后插入两个空行，让转发的微博排版更加美观一些
        temp += '<br><br>';

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

    getTime: (html) => {
        let math;
        let date = new Date();
        if (/(\d+)分钟前/.exec(html)) {
            math = /(\d+)分钟前/.exec(html);
            date.setMinutes(date.getMinutes() - math[1]);
            return date.toUTCString();
        } else if (/(\d+)小时前/.exec(html)) {
            math = /(\d+)小时前/.exec(html);
            date.setHours(date.getHours() - math[1]);
            return date.toUTCString();
        } else if (/今天 (\d+):(\d+)/.exec(html)) {
            math = /今天 (\d+):(\d+)/.exec(html);
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), math[1], math[2]);
            return date.toUTCString();
        } else if (/昨天 (\d+):(\d+)/.exec(html)) {
            math = /昨天 (\d+):(\d+)/.exec(html);
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, math[1], math[2]);
            return date.toUTCString();
        } else if (/(\d+)月(\d+)日 (\d+):(\d+)/.exec(html)) {
            math = /(\d+)月(\d+)日 (\d+):(\d+)/.exec(html);
            date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2], math[3], math[4]);
            return date.toUTCString();
        } else if (/(\d+)-(\d+)-(\d+)/.exec(html)) {
            math = /(\d+)-(\d+)-(\d+)/.exec(html);
            date = new Date(math[1], parseInt(math[2]) - 1, math[3]);
            return date.toUTCString();
        } else if (/(\d+)-(\d+)/.exec(html)) {
            math = /(\d+)-(\d+)/.exec(html);
            date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2]);
            return date.toUTCString();
        }
        return html;
    },
};

module.exports = weiboUtils;
