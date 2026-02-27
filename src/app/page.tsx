'use client';

import Link from 'next/link';
import { Store, UserCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg flex flex-col items-center text-center">

        {/* Logo - Fixed position */}
        <div className="mb-6 lg:mb-8 animate-in fade-in duration-500">
          <img src="/sp-logo.png" alt="SP Logo" className="h-16 sm:h-20 lg:h-24 w-auto object-contain" />
        </div>

        {/* Card wrapper for desktop */}
        <div className="w-full lg:bg-white lg:rounded-3xl lg:shadow-xl lg:border lg:border-slate-100 lg:p-10">

          {/* Title */}
          <div className="mb-6 lg:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-3xl sm:text-4xl lg:text-4xl font-black tracking-tight text-slate-900 mb-2">
              Sporun <br />
              <span className="text-green-600">Yeni Dünyası</span>
            </h1>
            <p className="text-sm lg:text-base font-bold text-slate-500 max-w-xs lg:max-w-sm mx-auto leading-tight">
              Koçlar ve sporcular için tasarlanmış profesyonel platform.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="w-full space-y-3 lg:space-y-3.5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

            <Link href="/register?role=student" className="block group">
              <div className="p-4 lg:p-5 rounded-2xl bg-white border-2 border-slate-100 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-50 shadow-sm group-hover:shadow-md active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <UserCheck className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base lg:text-lg font-black text-slate-900 group-hover:text-green-700 transition-colors">Öğrenciyim</h3>
                    <p className="text-xs lg:text-sm font-bold text-slate-400 group-hover:text-green-600/70 transition-colors">Ders almak istiyorum</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link href="/register?role=coach" className="block group">
              <div className="p-4 lg:p-5 rounded-2xl bg-white border-2 border-slate-100 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-50 shadow-sm group-hover:shadow-md active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <Store className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base lg:text-lg font-black text-slate-900 group-hover:text-green-700 transition-colors">Eğitmenim</h3>
                    <p className="text-xs lg:text-sm font-bold text-slate-400 group-hover:text-green-600/70 transition-colors">Ders vermek istiyorum</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

          </div>

          {/* Login Link */}
          <div className="mt-6 lg:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <p className="text-sm lg:text-base font-bold text-slate-400">
              Hesabın var mı?{' '}
              <Link href="/login" className="text-slate-900 hover:text-green-600 underline underline-offset-4 decoration-2 decoration-green-300 hover:decoration-green-600 transition-all">
                Hemen Giriş Yap
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        © 2026 Sportaly. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
