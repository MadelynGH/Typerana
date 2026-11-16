import { Montserrat } from "next/font/google";
import "./globals.css";

export const metadata = {
  "title": "Typerana"
};

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800"]
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={montserrat.className}>
        <h1 style={{
          fontSize: "2.4em"
        }}>Typerana</h1>
        {children}
      </body>
    </html>
  );
}