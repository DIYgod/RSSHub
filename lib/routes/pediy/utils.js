const pediyUtils = {
    dateParser: (html, timeZone) => {
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
        } else if (/(\d+)天前/.exec(html)) {
            math = /(\d+)天前/.exec(html);
            date.setDate(date.getDate() - math[1]);
            return date.toUTCString();
        } else if (/(\d+)-(\d+)-(\d+) (\d+):(\d+)/.exec(html)) {
            math = /(\d+)-(\d+)-(\d+) (\d+):(\d+)/.exec(html);
            date = new Date(math[1], parseInt(math[2]) - 1, math[3], math[4], math[5]);
            const serverOffset = new Date().getTimezoneOffset() / 60;
            return new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
        }
        return html;
    },
};

module.exports = pediyUtils;
