import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 mt-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-white">V</span>
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">Vanted</span>
            </div>
            <p className="max-w-md text-slate-400 leading-relaxed">
              The premium marketplace for professional services. We connect top-tier talent with clients who demand excellence.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Vanted Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
