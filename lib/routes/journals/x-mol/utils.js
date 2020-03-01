const XmolUtils = {
    host: 'https://www.x-mol.com',
    transDate: (date) => new Date(`${date} GMT+0800`).toUTCString(),
    getDate: (text) => {
        const reg = /[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
        if (typeof text === 'string') {
            const arr = text.match(reg);
            return arr && text.match(reg)[0];
        } else {
            return null;
        }
    },
    setDesc: (image, text) => `<p><img src="${image}"></p><p>${text}</p>`,
};

module.exports = XmolUtils;
