import md5 from '@/utils/md5';

function link(str: string, ...args: string[]): string {
    let result = args.map((arg) => arg + str).join('');
    if (result.search('-')) {
        result = result.substring(0, result.length - 1);
    }
    return result;
}

function replaceCharAt(str: string, index: number, replacement: string) {
    return index < 0 || index >= str.length ? str : str.slice(0, index) + replacement + str.slice(index + 1);
}

export function sign(payload: Map<string, any>) {
    const map = new Map();
    const lowerCaseKeys: string[] = [];

    for (const [key, value] of payload.entries()) {
        const lowerCaseKey = key.toLowerCase();
        lowerCaseKeys.push(lowerCaseKey);
        map.set(lowerCaseKey, typeof value === 'string' ? value.toLowerCase() : value);
    }

    const sortedString = lowerCaseKeys
        .sort()
        .map((key) => key + '=' + map.get(key))
        .join('');
    const linkedString = link('--'.substring(0, 1), '#CEAIWER', '892F', 'KB97', 'JKB6', 'HJ7OC7C8', 'GJZG');
    const lastSeparatorIndex = linkedString.lastIndexOf('--'.substring(0, 1)); // 32
    const replacedString = replaceCharAt(linkedString, lastSeparatorIndex, ''); // #CEAIWER-892F-KB97-JKB6-HJ7OC7C8GJZG
    const finalString = (sortedString + replacedString).toLowerCase();

    return md5(finalString);
}
