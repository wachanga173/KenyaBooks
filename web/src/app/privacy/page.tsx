import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      <nav className="border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            KenyaBooks
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-12">Last Updated: June 21, 2026</p>

        <div className="space-y-8 prose prose-invert prose-slate max-w-none">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to KenyaBooks. We respect your privacy and are deeply committed to protecting your personal data
              and financial information. This Privacy Policy outlines how we collect, use, and protect your information
              when you use the KenyaBooks Desktop Application ("Software") and our associated website ("Website").
            </p>
            <p>
              We designed KenyaBooks with an uncompromising "privacy-by-design" approach. By making the Software entirely
              offline-first, we have systematically eliminated the vast majority of privacy risks typically associated
              with cloud-based accounting software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. The Offline-First Guarantee</h2>
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-2">We Do Not Have Your Data</h3>
              <p className="m-0 text-emerald-100">
                Because KenyaBooks is a local, offline desktop application, <strong>we do not collect, process, transmit,
                store, or even have the technical capability to access your financial data, invoices, client lists, or
                business secrets.</strong> All data you enter into the Software is written directly to a local SQLite
                database that resides exclusively on your device's hard drive.
              </p>
            </div>
            <p>
              Specifically, we <strong>DO NOT</strong> collect:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your KRA PIN, passwords, or eTIMS credentials.</li>
              <li>Transaction data, income, expenses, or balance sheets.</li>
              <li>Customer, vendor, or employee Personally Identifiable Information (PII).</li>
              <li>M-Pesa statements, banking details, or integration tokens.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Collected on the Website</h2>
            <p>
              When you visit our Website (the distribution platform) to download the Software, we may collect standard,
              anonymous web server logs to maintain security and monitor traffic. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP Addresses (anonymized where possible).</li>
              <li>Browser type and version.</li>
              <li>Operating system.</li>
              <li>Time and date of your visit.</li>
            </ul>
            <p>
              This Website is hosted on Vercel, and standard CDN logging applies. We do not use intrusive tracking cookies
              or third-party retargeting pixels (e.g., Facebook Pixel) on our download pages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Telemetry and Updates in the Software</h2>
            <p>
              While your business data stays offline, the Software may make minimal network requests for functional and
              maintenance purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Version Checking:</strong> The app occasionally pings our GitHub repository to check if a new update is available. This reveals your IP address to GitHub's servers but transmits no personal data.</li>
              <li><strong>Crash Reporting (Opt-In):</strong> If the application encounters a fatal error, you may be presented with a dialogue asking to send a crash report. This report contains a stack trace and technical environment data to help us fix the bug. You must explicitly consent to send this report.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services within the App</h2>
            <p>
              The Software features embedded browsers that allow you to access portals like KRA iTax, eTIMS, NHIF, and
              NSSF. When you open these tabs:
            </p>
            <p>
              You are establishing a direct, encrypted (HTTPS) connection between your computer and the respective government
              or third-party server. KenyaBooks acts merely as a browser in this context. We do not proxy, intercept, or
              log your traffic to these portals. Your interactions are governed by the privacy policies of the Government
              of Kenya and related institutions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Security Recommendations</h2>
            <p>
              Because your data is localized, the security of your financial information relies on the physical and digital
              security of your computer. We strongly recommend that you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enable Full Disk Encryption (BitLocker for Windows, FileVault for macOS).</li>
              <li>Set a strong, unique password for your computer's user account.</li>
              <li>Regularly use the Software's "Backup" feature and store the resulting file in a secure, off-site location (such as an encrypted USB drive or secure cloud storage).</li>
              <li>Install reputable anti-malware software to prevent unauthorized exfiltration of your SQLite database.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Data Rights</h2>
            <p>
              Under the Kenya Data Protection Act, 2019, data subjects have rights regarding data access, correction, and
              deletion. However, because we do not possess your data, we cannot fulfill these requests centrally. To
              exercise your data rights regarding the financial data in KenyaBooks, you must use the tools provided
              within the Software to modify, export, or delete the local database files on your own device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to this Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. If we make significant changes, we will notify you by
              revising the "Last Updated" date at the top of this policy and, in some cases, providing a notice within
              the Software interface.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Information</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, you can reach out to us
              by creating an issue on our official GitHub repository.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-12 mt-12">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} KenyaBooks. Built for Kenyan businesses.</p>
        </div>
      </footer>
    </div>
  );
}
