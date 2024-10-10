import md5 from '@/utils/md5';

function hash(images) {
    const entries = Object.entries(images)
        .map((x) => `${x[1].os}/${x[1].architecture},${x[1].digest}`)
        .sort((a, b) => a.localeCompare(b));
    const text = entries.join('|');
    return md5(text);
}

export { hash };
