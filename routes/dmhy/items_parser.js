module.exports = ($) =>
    Array.from($('tbody tr'))
        .map((el) => {
            const $el = $(el);
            const $titlea = $el.find('.title>a');
            const category = $el
                .find('td:nth-child(2) font')
                .text()
                .trim();
            const team = $el
                .find('.tag')
                .text()
                .trim();
            const magnet = $el.find('.arrow-magnet').attr('href');
            const size = $el
                .find('td:nth-child(5)')
                .text()
                .trim();
            const datestr = $el
                .find('td:nth-child(1)>span')
                .text()
                .trim();
            return {
                title: $titlea.text().trim(),
                description: `分類: ${category}<br>聯盟: ${team}<br>磁鏈: ${magnet}<br>大小: ${size}`,
                link: `http://share.dmhy.org${$titlea.text().trim()}`,
                pubDate: new Date(datestr).toUTCString(),
            };
        })
        .filter((i) => i.title);
