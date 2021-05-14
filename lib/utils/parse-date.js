const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/customParseFormat'));

module.exports = (date, ...options) => dayjs(date, ...options).toDate();
