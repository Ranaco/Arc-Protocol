import * as React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "next-themes";
import "~~/styles/globals.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>{children}</ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;
