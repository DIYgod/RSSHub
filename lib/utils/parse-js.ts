import { type OxcError, parseSync, type Program, rawTransferSupported } from 'oxc-parser';

let canUseRawTransfer = rawTransferSupported();

export const parseScriptSource = (source: string): { program: Program; errors: OxcError[] } => {
    if (canUseRawTransfer) {
        try {
            const { program, errors } = parseSync('script.js', source, {
                lang: 'js',
                sourceType: 'script',
                preserveParens: false,
                experimentalRawTransfer: true,
            } as never);
            return { program, errors };
        } catch {
            canUseRawTransfer = false;
        }
    }

    const { program, errors } = parseSync('script.js', source, {
        lang: 'js',
        sourceType: 'script',
        preserveParens: false,
        experimentalRawTransfer: false,
    } as never);
    return { program, errors };
};
