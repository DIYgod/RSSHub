const serverOffset = new Date().getTimezoneOffset() / 60;

// 基于已知文章日期时区，提供 pubDate GMT 时间
// to determine the correct pubDate in GMT given a known article timezone offset

module.exports = (html, timezone) => new Date(new Date(html).getTime() - 60 * 60 * 1000 * (timezone + serverOffset)).toUTCString();
