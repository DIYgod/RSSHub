const axios = require('../../utils/axios');

module.exports = async (ctx) => {
  const url = 'https://api.yii.dgtle.com/v2/whale-picture/list?page=1&dateline=0&version=3.9&sift=dateline&perpage=100';
  const response = await axios({
    method: 'get',
    url,
  });
  const data = response.data.list;
  ctx.state.data = {
    title: '鲸图 by extrastu',
    from: '数字尾巴',
    link:"http://www.dgtle.com",
    item: data
  };
};
