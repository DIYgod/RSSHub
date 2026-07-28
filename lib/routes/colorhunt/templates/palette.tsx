type PaletteProps = {
    colors: string[];
};

const Palette = ({ colors }: PaletteProps) => (
    <div style={{ maxWidth: '360px', borderRadius: '8px', overflow: 'hidden' }}>
        {colors.map((color) => (
            <div
                style={{
                    height: '64px',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    color: getTextColor(color),
                }}
            >
                {color}
            </div>
        ))}
    </div>
);

function getTextColor(color: string): string {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);

    return red * 0.299 + green * 0.587 + blue * 0.114 > 186 ? '#000000' : '#FFFFFF';
}

export default Palette;
