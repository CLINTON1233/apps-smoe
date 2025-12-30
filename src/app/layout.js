import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Installer Dashboard - Seatrium Applications",
  description: "Seatrium Installer Dashboard for Application Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}