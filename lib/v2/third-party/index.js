module.exports = (ctx) => {
    // 接收一个post请求。格式为raw/json
    // koa-bodyparser会解析为对象，直接返回即可
    ctx.state.data = ctx.request.body;
};
