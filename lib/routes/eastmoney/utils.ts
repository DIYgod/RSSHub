function getRatingChangeStr(ratingChange) {
    let ratingChangeName = '';
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

function getEpsStr(eps) {
    let EpsStr = '';
    if (eps !== undefined) {
        EpsStr = eps === '' ? '' : Number(eps).toFixed(3);
    }
    return EpsStr;
}

function getPeStr(pe) {
    let PeStr = '';
    if (pe !== undefined) {
        PeStr = pe === '' ? '' : Number(pe).toFixed(2);
    }
    return PeStr;
}

export { getRatingChangeStr, getEpsStr, getPeStr };
