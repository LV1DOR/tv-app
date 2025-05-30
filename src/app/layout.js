import "./globals.css";
import Link from "next/link";

// --- Move NavWrapper to its own file or define it here as a client component ---
import NavWrapper from "./NavWrapper"; // If you move it to its own file

export const metadata = {
  title: "TV Control App",
  description: "Admin and Display Pages for TV Control",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavWrapper>
          {children}
        </NavWrapper>
      </body>
    </html>
  );
}
