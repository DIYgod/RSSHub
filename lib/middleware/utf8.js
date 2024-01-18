// https://stackoverflow.com/questions/2507608/error-input-is-not-proper-utf-8-indicate-encoding-using-phps-simplexml-lo/40552083#40552083
// https://stackoverflow.com/questions/1497885/remove-control-characters-from-php-string/1497928#1497928
module.exports = async (ctx, next) => {
    await next();
    ctx.body = typeof ctx.body === 'object' ? ctx.body : ctx.body.replaceAll(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, '');
};
