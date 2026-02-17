import "./globals.css";
import { NextAuthProvider } from "./providers/NextAuthProvider";

export const metadata = {
  title: "EBOOK Web App 2.0",
  description: "Your ultimate financial management tool for businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
