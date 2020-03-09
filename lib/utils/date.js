// 格式化 类型这个的时间 ， 几分钟前 | 几小时前 | 几天前 | 几月前 | 几年前 | 具体的格式不对的时间
const serverOffset = new Date().getTimezoneOffset() / 60;

module.exports = (html, timeZone = -serverOffset) => {
    let math;
    let date = new Date();
    if (/(\d+)分钟前/.exec(html)) {
        math = /(\d+)分钟前/.exec(html);
        date.setMinutes(date.getMinutes() - math[1]);
        date.setSeconds(0);
    } else if (/(\d+)小时前/.exec(html)) {
        math = /(\d+)小时前/.exec(html);
        date.setHours(date.getHours() - math[1]);
    } else if (/(\d+)天前/.exec(html)) {
        math = /(\d+)天前/.exec(html);
        date.setDate(date.getDate() - math[1]);
    } else if (/(\d+)月前/.exec(html)) {
        math = /(\d+)月前/.exec(html);
        date.setMonth(date.getMonth() - math[1]);
    } else if (/(\d+)年前/.exec(html)) {
        math = /(\d+)年前/.exec(html);
        date.setFullYear(date.getFullYear() - math[1]);
    } else if (/今天\s*(\d+):(\d+)/.exec(html)) {
        math = /今天\s*(\d+):(\d+)/.exec(html);
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), math[1], math[2]);
    } else if (/昨天\s*(\d+):(\d+)/.exec(html)) {
        math = /昨天\s*(\d+):(\d+)/.exec(html);
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, math[1], math[2]);
    } else if (/前天\s*(\d+):(\d+)/.exec(html)) {
        math = /前天\s*(\d+):(\d+)/.exec(html);
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 2, math[1], math[2]);
    } else if (/(\d+)年(\d+)月(\d+)日(\d+)时/.exec(html)) {
        math = /(\d+)年(\d+)月(\d+)日(\d+)时/.exec(html);
        date = new Date(parseInt(math[1]), parseInt(math[2]) - 1, parseInt(math[3]), parseInt(math[4]));
    } else if (/(\d+)年(\d+)月(\d+)日/.exec(html)) {
        math = /(\d+)年(\d+)月(\d+)日/.exec(html);
        date = new Date(parseInt(math[1]), parseInt(math[2]) - 1, parseInt(math[3]));
    } else if (/(\d+)-(\d+)-(\d+) (\d+):(\d+)/.exec(html)) {
        math = /(\d+)-(\d+)-(\d+) (\d+):(\d+)/.exec(html);
        date = new Date(math[1], parseInt(math[2]) - 1, math[3], math[4], math[5]);
    } else if (/(\d+)-(\d+) (\d+):(\d+)/.exec(html)) {
        math = /(\d+)-(\d+) (\d+):(\d+)/.exec(html);
        date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2], math[3], math[4]);
    } else if (/(\d+)\/(\d+)\/(\d+)\s*(\d+):(\d+):(\d+)/.exec(html)) {
        math = /(\d+)\/(\d+)\/(\d+)\s*(\d+):(\d+):(\d+)/.exec(html);
        date = new Date(math[1], parseInt(math[2]) - 1, math[3], math[4], math[5], math[6]);
    } else if (/(\d+)\/(\d+)\/(\d+)\s*(\d+):(\d+)/.exec(html)) {
        math = /(\d+)\/(\d+)\/(\d+)\s*(\d+):(\d+)/.exec(html);
        date = new Date(math[1], parseInt(math[2]) - 1, math[3], math[4], math[5]);
    } else if (/(\d+)\/(\d+)\s*(\d+):(\d+)/.exec(html)) {
        math = /(\d+)\/(\d+)\s*(\d+):(\d+)/.exec(html);
        date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2], math[3], math[4]);
    } else if (/(\d+)月(\d+)日 (\d+):(\d+)/.exec(html)) {
        math = /(\d+)月(\d+)日 (\d+):(\d+)/.exec(html);
        date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2], math[3], math[4]);
    } else if (/(\d+)月(\d+)日/.exec(html)) {
        math = /(\d+)月(\d+)日/.exec(html);
        date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2]);
    } else if (/(\d+)\/(\d+)/.exec(html)) {
        math = /(\d+)\/(\d+)/.exec(html);
        date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2]);
    } else if (/(\d+)-(\d+)-(\d+)/.exec(html)) {
        math = /(\d+)-(\d+)-(\d+)/.exec(html);
        date = new Date(math[1], parseInt(math[2]) - 1, math[3]);
    } else if (/(\d+)-(\d+)/.exec(html)) {
        math = /(\d+)-(\d+)/.exec(html);
        date = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2]);
    } else if (/(\d+):(\d+)/.exec(html)) {
        math = /(\d+):(\d+)/.exec(html);
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), math[1], math[2]);
    } else if (/刚刚/.exec(html)) {
        math = /刚刚/.exec(html);
    }

    if (math) {
        return new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
    }
    return html;
};
