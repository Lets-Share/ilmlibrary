export function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 md:p-12 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to IlmLibrary. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our 
              website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services (e.g., reading progress, saved books).</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
              used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal 
              data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">5. Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at 
              <a href="mailto:privacy@ilmlibrary.com" className="text-indigo-600 dark:text-indigo-400 ml-1 hover:underline">privacy@ilmlibrary.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
