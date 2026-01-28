import './globals.css';
import { Geist } from 'next/font/google';
import Header from '../components/header';
import Footer from '../components/footer';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'TKDN Evaluator - Sistem Evaluasi Tingkat Komponen Dalam Negeri',
  description:
    'Aplikasi untuk mengevaluasi TKDN produk sesuai peraturan pemerintah Indonesia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={geist.className} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="grow">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
