import { parseSync, rawTransferSupported } from 'oxc-parser';

export const parseScriptSource = (source: string) => {
    const { program, errors } = parseSync('script.js', source, {
        lang: 'js',
        sourceType: 'script',
        preserveParens: false,
        experimentalRawTransfer: rawTransferSupported(),
    } as never);
    return { program, errors };
};
