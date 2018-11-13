const { resolve } = require('url');
const day = require('dayjs');

exports.mapDetail = (ele) => {
    const link = resolve('https://tits-guru.com', ele.find('.img-link').attr('href'));
    const title = ele.find('.img-link > img').attr('title');
    const image = ele
        .find('.horizontal-socials .socials-share-pinterest > span')
        .attr('data-src')
        .match(/media=(.+)&url=/)[1];
    const dateStr = ele.find('.post-time').text();
    return {
        link,
        title,
        pubDate: exports.parseDate(dateStr.trim()).toUTCString(),
        description: `
            <img referrerpolicy="no-referrer" src="${image}" />
        `.trim(),
    };
};

exports.parseDate = (str) => {
    // 网页给的是一种很诡异的零时区表示
    const [, _dayStr, timeStr] = str.match(/^(.+) (.+)$/);
    const current = day().add(new Date().getTimezoneOffset(), 'minute'); // offset date
    let dayStr;
    if (_dayStr === 'Today') {
        dayStr = current.format('YYYY-MM-DD');
    } else if (_dayStr === 'Yesterday') {
        dayStr = current.subtract(1, 'day').format('YYYY-MM-DD');
    } else if (_dayStr.match(/[a-z]+/)) {
        // eg. '06 november'
        dayStr = day(`${_dayStr} UTC`)
            .set('year', day().year())
            .format('YYYY-MM-DD');
    } else {
        // eg. '16.03.2014'
        const [, dd, mm, yy] = _dayStr.match(/(\d+)\.(\d+)\.(\d+)/);
        dayStr = `${yy}-${mm}-${dd}`;
    }
    return new Date(`${dayStr} ${timeStr} UTC`);
};
