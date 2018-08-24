const axios = require('../../utils/axios');
const DateTime = require('luxon').DateTime;

// 映射信息复制自网页的JS代码 http://i.tq121.com.cn/j/data_alarm.js
const gradeMap = require('./gradeMapping.json');
const typeMap = require('./typeMapping.json');

module.exports = async (ctx) => {
    const alarmInfoURL = `http://product.weather.com.cn/alarm/grepalarm_cn.php?_=${Date.now()}`;
    const jsonString = (await axios.get(alarmInfoURL)).data.slice(14, -1);
    const alaramData = JSON.parse(jsonString)
        .data.map((pair) => {
            const location = pair[0];
            const list = pair[1].slice(0, -5).split('-');
            const date = DateTime.fromFormat(list[1], 'yyyyMMddhhmmss');
            const gradeCode = list[2].slice(2);
            const typeCode = list[2].slice(0, 2);
            return {
                location,
                date,
                grade: gradeMap[gradeCode],
                type: typeMap[typeCode],
                link: `http://www.weather.com.cn/alarm/newalarmcontent.shtml?file=${pair[1]}`,
            };
        })
        .slice(0, 30); // 取最新的30条数据
    ctx.state.data = {
        title: '中国天气网气象预警',
        link: 'http://www.weather.com.cn/alarm/',
        item: alaramData.map((item) => ({
            title: `${item.location}${item.date.toFormat('M月dd日HH时mm分')}发布${item.grade}${item.type}预警`,
            link: item.link,
            pubDate: item.date.toRFC2822(),
        })),
    };
};
