import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Typing Zen Garden',
  description: 'A peaceful place to practice typing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}