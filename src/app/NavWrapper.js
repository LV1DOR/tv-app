"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavWrapper({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/display/")) {
      document.body.classList.add("display-page");
    } else {
      document.body.classList.remove("display-page");
    }
  }, [pathname]);

  return (
    <>
      {!pathname.startsWith("/display/") && (
        <nav className="bg-gradient-to-r from-blue-700 via-purple-600 to-blue-400 shadow-lg px-8 py-4 flex items-center">
          <div className="flex flex-row gap-8">
            <Link
              href="/"
              className="no-underline text-white font-semibold hover:text-yellow-300 transition-colors duration-200"
            >
              Home&nbsp;&nbsp;&nbsp;
            </Link>
            <Link
              href="/admin"
              className="no-underline text-white font-semibold hover:text-yellow-300 transition-colors duration-200"
            >
              Admin
            </Link>
          </div>
        </nav>
      )}
      {children}
    </>
  );
}