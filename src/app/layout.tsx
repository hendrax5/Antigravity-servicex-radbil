import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";

// Replaced Google Fonts with system fallback for offline-safe production builds
const inter = { variable: "--font-sans" };

export const metadata: Metadata = {
  title: "ServiceX Radbil",
  description: "Advanced ISP Billing, Auto-Provisioning & Network Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased text-foreground bg-background`}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
