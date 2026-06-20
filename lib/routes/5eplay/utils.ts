const getAcwScV2ByArg1 = (arg1) => {
    const pwd = '3000176000856006061501533003690027800375';
    const hexXor = function (box, pwd) {
        let res = '';
        for (let i = 0x0; i < box.length && i < pwd.length; i += 2) {
            const tmp1 = Number.parseInt(box.slice(i, i + 2), 16);
            const tmp2 = Number.parseInt(pwd.slice(i, i + 2), 16);
            let tmp = (tmp1 ^ tmp2).toString(16);
            if (tmp.length === 1) {
                tmp = '0' + tmp;
            }
            res += tmp;
        }
        return res;
    };
    const unsbox = function (str: string) {
        const code = [15, 35, 29, 24, 33, 16, 1, 38, 10, 9, 19, 31, 40, 27, 22, 23, 25, 13, 6, 11, 39, 18, 20, 8, 14, 21, 32, 26, 2, 30, 7, 4, 17, 5, 3, 28, 34, 37, 12, 36];
        const res: string[] = [];
        for (let i = 0; i < str.length; i++) {
            const cur = str[i];
            for (let j = 0; j < code.length; j++) {
                if (code[j] === i + 1) {
                    res[j] = cur;
                }
            }
        }
        return res.join('');
    };
    const box = unsbox(arg1);
    return hexXor(box, pwd);
};

export { getAcwScV2ByArg1 };
