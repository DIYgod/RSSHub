const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { cid, type } = ctx.params;
    const link = `http://www.xuetangx.com/courses/${cid}/about`;
    const res = await got(link);
    const $ = cheerio.load(res.data);

    const courseTitle = $('#title1').text();
    const infoTag = $('#course_data');
    let title,
        description = '',
        startTime,
        endTime,
        status;
    switch (type) {
        case 'start':
            title = '开课时间';
            startTime = infoTag.attr('data-start');
            description = `开课时间: ${startTime ? new Date(startTime).toUTCString() : '暂无'}`;
            break;
        case 'end':
            title = '结课时间';
            endTime = infoTag.attr('data-end');
            description = `结课时间: ${endTime ? new Date(endTime).toUTCString() : '永久开课'}`;
            break;
        case 'status':
            title = '课程进度';
            status = infoTag.attr('data-serialized');
            description = `课程进度: ${Number(status) > -1 ? `连载至第${status}讲` : '暂无'}`;
            break;
    }
    const item = [];
    if (title && description) {
        item.push({
            title,
            description,
            link,
            guid: description,
        });
    }

    ctx.state.data = {
        title: `${courseTitle} - ${title}`,
        description: `${courseTitle} - ${title}`,
        link,
        item,
        allowEmpty: true,
    };
};
