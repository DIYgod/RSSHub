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

    getTime: (html) => {
        const setTimeZone = (date) => {
            // 微博源提供的时间戳为北京时间，需要转换为 UTC
            const serverOffset = new Date().getTimezoneOffset() / 60;
            return new Date(date.getTime() - 60 * 60 * 1000 * (8 + serverOffset)).toUTCString();
        };

        let math;
        let date = new Date();
        if (/(\d+)分钟前/.exec(html)) {
            math = /(\d+)分钟前/.exec(html);
            date.setMinutes(date.getMinutes() - math[1]);
            return setTimeZone(date);
        } else if (/(\d+)小时前/.exec(html)) {
            math = /(\d+)小时前/.exec(html);
            date.setHours(date.getHours() - math[1]);
            return setTimeZone(date);
        } else if (/今天 (\d+):(\d+)/.exec(html)) {
            math = /今天 (\d+):(\d+)/.exec(html);
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), math[1], math[2]);
            return setTimeZone(date);
        } else if (/昨天 (\d+):(\d+)/.exec(html)) {
            math = /昨天 (\d+):(\d+)/.exec(html);
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, math[1], math[2]);
            return setTimeZone(date);
        } else if (/(\d+)月(\d+)日 (\d+):(\d+)/.exec(html)) {
            math = /(\d+)月(\d+)日 (\d+):(\d+)/.exec(html);
            date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2], math[3], math[4]);
            return setTimeZone(date);
        } else if (/(\d+)-(\d+)-(\d+)/.exec(html)) {
            math = /(\d+)-(\d+)-(\d+)/.exec(html);
            date = new Date(math[1], parseInt(math[2]) - 1, math[3]);
            return setTimeZone(date);
        } else if (/(\d+)-(\d+)/.exec(html)) {
            math = /(\d+)-(\d+)/.exec(html);
            date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2]);
            return setTimeZone(date);
        }
        return html;
    },
};

module.exports = weiboUtils;
