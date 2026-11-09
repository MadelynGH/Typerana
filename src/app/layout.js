import { Montserrat } from "next/font/google";

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
        {children}
      </body>
    </html>
  );
}