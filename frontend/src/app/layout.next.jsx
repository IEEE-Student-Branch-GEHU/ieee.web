/* eslint-disable react-refresh/only-export-components */
import './globals.css';
import { ThemeProvider } from '../components/theme/ThemeProvider';

export const metadata = {
  title: 'IEEE Student Branch - GEHU Dehradun',
  description: 'IEEE Student Branch at Graphic Era Hill University, Dehradun.',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="site-surface font-body min-h-screen"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
