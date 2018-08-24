const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const DateTime = require('luxon').DateTime;

// 映射信息复制自网页的JS代码 http://i.tq121.com.cn/j/data_alarm.js
const gradeMap = {
    "01": "蓝色",
    "02": "黄色",
    "03": "橙色",
    "04": "红色",
    "05": "白色"
};

const typeMap = {
    "01": "台风",
    "02": "暴雨",
    "03": "暴雪",
    "04": "寒潮",
    "05": "大风",
    "06": "沙尘暴",
    "07": "高温",
    "08": "干旱",
    "09": "雷电",
    "10": "冰雹",
    "11": "霜冻",
    "12": "大雾",
    "13": "霾",
    "14": "道路结冰",
    "91": "寒冷",
    "92": "灰霾",
    "93": "雷雨大风",
    "94": "森林火险",
    "95": "降温",
    "96": "道路冰雪",
    "97": "干热风",
    "98": "空气重污染",
    "99": "低温",
    "51": "海上大雾",
    "52": "雷暴大风",
    "53": "持续低温",
    "54": "浓浮尘",
    "55": "龙卷风",
    "56": "低温冻害",
    "57": "海上大风",
    "58": "低温雨雪冰冻",
    "59": "强对流",
    "60": "臭氧",
    "61": "大雪",
    "62": "强降雨",
    "63": "强降温",
    "64": "雪灾",
    "65": "森林（草原）火险",
    "66": "雷暴",
    "67": "严寒",
    "68": "沙尘",
    "69": "海上雷雨大风",
    "70": "海上雷电",
    "71": "海上台风",
    "72": "低温"
};

module.exports = async (ctx) => {
    const alarmInfoURL = `http://product.weather.com.cn/alarm/grepalarm_cn.php?_=${Date.now()}`;
    const jsonString = (await axios.get(alarmInfoURL)).data.slice(14, -1);
    const alaramData = JSON.parse(jsonString).data
                        .map((pair, i) => {
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
                        .slice(0, 30) // 取最新的30条数据
    ctx.state.data = {
        title: '中国天气网气象预警',
        link: 'http://www.weather.com.cn/alarm/',
        item: alaramData.map(item => ({
            title: `${item.location}${item.date.toFormat('M月dd日HH时mm分')}发布${item.grade}${item.type}预警`,
            link: item.link,
            pubDate: item.date.toRFC2822(),
        })),
    };
};