import './globals.css';
import { Geist } from 'next/font/google';
import ClientLayout from '../components/ClientLayout';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'TKDN Evaluator - Sistem Evaluasi Tingkat Komponen Dalam Negeri',
  description:
    'Aplikasi untuk mengevaluasi TKDN produk sesuai peraturan pemerintah Indonesia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={geist.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
