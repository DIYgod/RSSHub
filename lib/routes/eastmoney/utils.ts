function getRatingChangeStr(ratingChange) {
    let ratingChangeName: string;
    switch (String(ratingChange)) {
        case '0':
            ratingChangeName = '调高';
            break;
        case '1':
            ratingChangeName = '调低';
            break;
        case '2':
            ratingChangeName = '首次';
            break;
        case '3':
            ratingChangeName = '维持';
            break;
        case '4':
            ratingChangeName = '无';
            break;
        default:
            ratingChangeName = '-';
            break;
    }
    return ratingChangeName;
}

// 按照东方财富的 js 规则：收益是保留三位小数，市盈率是保留两位小数
function getEpsOrPeStr(epsOrPe, keepDecimal) {
    let EpsOrPeStr = '';
    if (epsOrPe !== undefined) {
        EpsOrPeStr = epsOrPe === '' ? '' : Number(epsOrPe).toFixed(keepDecimal);
    }
    return EpsOrPeStr;
}

export { getEpsOrPeStr, getRatingChangeStr };
