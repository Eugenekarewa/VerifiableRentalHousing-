// this is a test one to check out if my tailwind working which it F does
"use client";

import ConnectWallet from "@/components/ConnectWallet";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Verifiable Rental Protocol
          </h1>
          <ConnectWallet />
        </header>

        {/* Hero Section */}
        <section className="text-center mb-16">
          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
            Trust-minimized rentals on-chain. Browse properties, verify
            instantly, book with confidence.
          </p>
        </section>

        {/* Mock Property Grid */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 text-slate-800 dark:text-slate-200">
            Available Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="bg-gray-200 dark:bg-gray-700 h-64" />{" "}
                {/* Placeholder image */}
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-2">
                    Luxury Apartment #{i}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Modern 2-bed in downtown • $200/night
                  </p>
                  <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-slate-500 dark:text-slate-400">
          © 2025 Verifiable Rental • Built with Next.js + Tailwind
        </footer>
      </div>
    </main>
  );
}
