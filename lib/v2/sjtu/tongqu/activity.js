const got = require('@/utils/got');
const { art } = require('@/utils/render');
const { join } = require('path');

const urlRoot = 'https://tongqu.sjtu.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
    const config = {
        all: 0,
        newest: -1,
        recruitment: 9,
        lecture: 2,
        outdoors: 10,
        jobs: 4,
        studyTours: 5,
        competitions: 7,
        publicWarefare: 11,
        partyDay: 13,
        studentAffairs: 14,
        ads: 12,
        others: 8,
    };

    // requests API
    const link = `${urlRoot}/api/act/type?type=${config[type]}&status=0&offset=0&offset=0&number=10&order=act.create_time&desc=true`;
    const response = await got(link);
    const data = response.data;

    // parses data
    const activities = data.result.acts;
    const feeds = activities.map((e) => ({
        title: e.name,
        link: new URL(`/act/${e.actid}`, urlRoot).href,
        category: e.typename,
        description: art(join(__dirname, '../templates/activity.art'), { e }),
    }));

    ctx.state.data = {
        title: '同去网活动',
        link,
        item: feeds,
    };
};
