export const metadata = { title: "フライングパンケーキ" };

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
