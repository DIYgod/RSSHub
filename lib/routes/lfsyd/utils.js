const md5 = require('@/utils/md5');
const getForm = function (form) {
    const key = 'b8d5b38577b8bb382b0c783b474b95f9';
    form.timestamp = Math.floor(new Date().getTime() / 1000);
    form.key = key;
    form.sign = md5(new URLSearchParams(form).toString());
    delete form.key;
    return form;
};
module.exports = {
    getForm,
};
