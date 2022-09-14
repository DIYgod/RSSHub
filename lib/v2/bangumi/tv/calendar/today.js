const getData = require('./_base');

module.exports = async (ctx) => {
    const [list, data] = await getData(ctx);
    const siteMeta = data.siteMeta;

    const today = new Date(Date.now());

    // 将 UTC 时间向前移动9小时，即可在数值上表示东京时间
    today.setUTCHours(today.getUTCHours() + 9);

    const day = today.getUTCDay();

    const todayList = list.filter((l) => l.weekday.id % 7 === day)[0];

    const todayBgmId = todayList.items.map((t) => t.id);
    const images = todayList.items.reduce((p, c) => {
        p[c.id] = (c.images || {}).large;
        return p;
    }, {});

    const todayBgm = data.items.filter((d) => todayBgmId.includes(d.bgm_id));
    todayBgm.forEach((bgm) => {
        bgm.image = images[bgm.bgm_id];
    });

    ctx.state.data = {
        title: 'bangumi 每日放送',
        link: 'https://bgm.tv/calendar',
        item: todayBgm.map((bgm) => {
            const updated = new Date(Date.now());
            updated.setSeconds(0);
            const begin = new Date(bgm.begin || updated);
            updated.setHours(begin.getHours());
            updated.setMinutes(begin.getMinutes());
            updated.setSeconds(begin.getSeconds());

            const link = `http://bangumi.tv/subject/${bgm.bgm_id}`;
            const id = `${link}#${new Intl.DateTimeFormat('zh-CN').format(updated)}`;

            const image = `<img src=${bgm.image} />`;
            const html =
                image +
                '<ul>' +
                bgm.sites
                    .map((s) => {
                        let url;
                        if (s.url) {
                            url = s.url;
                        } else {
                            url = siteMeta[s.site].urlTemplate.replace('{{id}}', s.id);
                        }
                        return `<li><a href="${url}">${siteMeta[s.site].title}</a></li>`;
                    })
                    .join('') +
                '</ul>';

            return {
                id,
                guid: id,
                title: [
                    bgm.title,
                    Object.values(bgm.titleTranslate)
                        .map((t) => t.join('｜'))
                        .join('｜'),
                ].join('｜'),
                updated: updated.toISOString(),
                pubDate: updated.toUTCString(),
                link,
                description: html,
                content: { html },
            };
        }),
    };
};
