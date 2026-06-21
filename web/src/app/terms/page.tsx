import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-12">Last Updated: June 21, 2026</p>

        <div className="space-y-8 prose prose-invert prose-slate max-w-none">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, accessing, or using the KenyaBooks software application ("Software") and the
              associated website ("Website"), you agree to be bound by these Terms of Service ("Terms"). If you do not
              agree to all of these Terms, do not use the Software or Website. These Terms constitute a binding legal
              agreement between you ("User" or "you") and KenyaBooks ("Company", "we", "us", or "our").
            </p>
            <p>
              We reserve the right, at our sole discretion, to change, modify, add, or remove portions of these Terms
              at any time. It is your responsibility to check these Terms periodically for changes. Your continued use
              of the Software following the posting of changes will mean that you accept and agree to the changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. License Grant and Restrictions</h2>
            <p>
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable,
              revocable license to download, install, and use the Software on devices that you own or control.
            </p>
            <h3 className="text-xl font-medium text-white mt-4 mb-2">You agree not to:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify, adapt, translate, reverse engineer, decompile, or disassemble the Software.</li>
              <li>Rent, lease, lend, sell, redistribute, or sublicense the Software.</li>
              <li>Remove, alter, or obscure any copyright, trademark, or other proprietary rights notices.</li>
              <li>Use the Software for any illegal, unauthorized, or otherwise improper purposes.</li>
              <li>Circumvent or attempt to circumvent any security measures or usage limitations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Ownership and Offline Nature</h2>
            <p>
              KenyaBooks is an "offline-first" application. You acknowledge and agree that all business data, financial
              records, customer information, and transactions you input into the Software are stored locally on your
              device in an SQLite database.
            </p>
            <p className="text-emerald-400 font-medium">
              We do not sync, host, back up, or have any access to your data.
            </p>
            <p>
              You are entirely responsible for securing your device, encrypting your disk, and maintaining adequate,
              regular backups of your data. We shall have no liability for any loss of data resulting from hardware
              failure, malware, user error, device theft, or any other cause.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Integrations and Webviews</h2>
            <p>
              The Software may provide built-in access to third-party services and government portals, including but not
              limited to the Kenya Revenue Authority (KRA) iTax, eTIMS, NHIF, NSSF, and the Central Bank of Kenya. These
              features are provided strictly for your convenience.
            </p>
            <p>
              We do not operate, control, or endorse these third-party services. Your use of these portals through the
              Software's embedded web browsers is at your own risk and subject to the respective terms and privacy
              policies of those third parties. We are not responsible for any downtime, API changes, or inaccuracies
              provided by these third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Disclaimer of Warranties</h2>
            <p>
              THE SOFTWARE AND WEBSITE ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL
              WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              WE MAKE NO WARRANTY THAT (I) THE SOFTWARE WILL MEET YOUR REQUIREMENTS, (II) THE SOFTWARE WILL BE
              UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, (III) THE RESULTS OBTAINED FROM THE USE OF THE SOFTWARE WILL
              BE ACCURATE OR RELIABLE, ESPECIALLY CONCERNING TAX CALCULATIONS, COMPLIANCE WITH KRA REGULATIONS, OR
              ACCOUNTING STANDARDS.
            </p>
            <p className="font-medium text-amber-400">
              The Software does not constitute professional tax, accounting, or legal advice. You must independently
              verify all figures, returns, and reports before submitting them to any regulatory body.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL KENYABOOKS, ITS AFFILIATES,
              DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE
              LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SOFTWARE; (II) ANY
              CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SOFTWARE; (III) ANY CONTENT OBTAINED FROM THE SOFTWARE; AND
              (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY,
              CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF
              THE POSSIBILITY OF SUCH DAMAGE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless KenyaBooks and its licensee and licensors, and their
              employees, contractors, agents, officers, and directors, from and against any and all claims, damages,
              obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's
              fees), resulting from or arising out of a) your use and access of the Software, by you or any person
              using your account and password, or b) a breach of these Terms, or c) your failure to comply with
              applicable tax or accounting regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the Republic of Kenya, without
              regard to its conflict of law provisions. Any dispute arising from these Terms or the use of the Software
              shall be resolved exclusively through arbitration in Nairobi, Kenya, in accordance with the Arbitration
              Act, 1995.
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
