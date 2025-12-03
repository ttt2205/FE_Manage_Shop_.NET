import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "Retail Management System",
  description: "Created with Bootstrap",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}

        {/* Toast container */}
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Analytics />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          async
        ></script>
      </body>
    </html>
  );
}
