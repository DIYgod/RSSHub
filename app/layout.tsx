export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body className="bg-white">{children}</body>
        </html>
    );
}
