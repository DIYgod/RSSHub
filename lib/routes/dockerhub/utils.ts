import md5 from '@/utils/md5';

function hash(images) {
    const entries = Object.entries(images)
        .map((x) => [`${x[1].os}/${x[1].architecture}`, x[1].digest])
        .sort((a, b) => a[0] - b[0]);
    return md5(entries.map((x) => x.join(',')).join('|'));
}

export { hash };
