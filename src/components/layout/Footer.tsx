'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Heart } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      setStatus('success');
      setEmail('');
      setMessage('Successfully subscribed!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed.');
    }
  };

  return (
    <footer id="footer" className="bg-surface text-foreground border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-lg bg-primary text-black flex items-center justify-center font-bold text-lg shadow-sm">
                F
              </span>
              <span className="font-sans font-extrabold text-xl tracking-tight">
                Founder<span className="text-primary">Brief</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Actionable startup breakdowns, AI trends, growth strategies, and fundraising lessons delivered weekly. The smartest startup insights in 5 minutes.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>


          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Startups', 'AI', 'Growth', 'Marketing', 'Fundraising', 'Operations'].map((cat) => (
                <li key={cat}>
                  <Link href={`/articles?category=${cat}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Get Weekly Insights</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Join founders and operators receiving our weekly briefs.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-md py-2 pl-3 pr-10 text-sm focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-0 top-0 bottom-0 px-3 bg-primary text-black hover:bg-primary/90 transition-all rounded-r-md flex items-center justify-center cursor-pointer disabled:opacity-55"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {status === 'success' && (
                <p className="text-xs text-green-500 font-medium">{message}</p>
              )}
              {status === 'error' && (
                <p className="text-xs text-red-500 font-medium">{message}</p>
              )}
            </form>
          </div>
        </div>

        {/* Legal and Copyright */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} FounderBrief. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
          <div className="flex items-center space-x-1">
            <span>Built for founders with</span>
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
