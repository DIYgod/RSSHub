const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const topic = ctx.params.topic || '';
    const type = ctx.params.type || 'true';
    const rootUrl = 'https://www.dedao.cn';
    const detailUrl = `${rootUrl}/pc/ledgers/topic/detail`;
    const currentUrl = `${rootUrl}/knowledge${topic === '' ? '' : '/topic/' + topic}`;
    const apiUrl = `${rootUrl}/pc/ledgers/${topic === '' ? 'notes/friends_timeline' : 'topic/notes/list'}`;

    let title = '',
        description = '';

    if (topic !== '') {
        const detailResponse = await got({
            method: 'post',
            url: detailUrl,
            json: {
                incr_view_count: false,
                topic_id_hazy: topic,
            },
        });

        title = detailResponse.data.c.name;
        description = detailResponse.data.c.intro;
    }

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            count: 20,
            load_chain: true,
            is_elected: type === 'true',
            page_id: 0,
            topic_id_hazy: topic,
            version: 2,
        },
    });

    const items = (topic === '' ? response.data.c.notes : response.data.c.note_detail_list).map((item) => {
        let s_part = '';
        if (item.s_part) {
            const s_author = `<p>引用 ${item.s_part.nick_name} (${item.s_part.v_info}):</p>`;
            const s_content = `<p>${item.s_part.note.replace(/\n\n/g, '</p><p>')}</p> <a href="${rootUrl}/knowledge/note/${item.s_part.note_id_hazy}">[查看原文]</a>`;
            let s_images = '<br>';
            if (item.s_part.images) {
                for (const i of item.s_part.images) {
                    s_images += `<img src="${i.match(/"url":"(.*)"/)[1]}">`;
                }
            }
            s_part = s_author + s_content + s_images;
        }

        let f_images = '<br>';
        if (item.f_part.images) {
            for (const i of item.f_part.images) {
                f_images += `<img src="${i.match(/"url":"(.*)"/)[1]}">`;
            }
        }

        return {
            title: item.f_part.note,
            author: item.f_part.nick_name,
            description: `<p>${item.f_part.note.replace(/\n\n/g, '</p><p>')}</p>${f_images}<br>${s_part}`,
            link: `${rootUrl}/knowledge/note/${item.f_part.note_id_hazy}`,
            pubDate: new Date(date(item.f_part.time_desc)).toUTCString(),
        };
    });

    ctx.state.data = {
        title: `得到 - 知识城邦${title === '' ? '' : ' - ' + title}`,
        link: currentUrl,
        item: items,
        description,
    };
};
