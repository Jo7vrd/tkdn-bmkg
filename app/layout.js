import './globals.css';
import { Geist } from 'next/font/google';
import Header from '../components/header';
import Footer from '../components/footer';
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
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="grow pt-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}