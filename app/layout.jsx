import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata = {
  title: "Retail Management System",
  description: "Created with Bootstrap",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Analytics />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  )
}
