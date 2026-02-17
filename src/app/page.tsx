'use client';

import Link from 'next/link';
import { Store, UserCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">

      {/* Container - smaller on desktop */}
      <div className="w-full max-w-sm md:max-w-xs flex flex-col items-center text-center">

        {/* Title Section */}
        <div className="mb-8 md:mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-2xl font-black tracking-tight text-slate-900 mb-2 px-2">
            Sporun <br />
            <span className="text-green-600">Yeni Dünyası</span>
          </h1>
          <p className="text-sm md:text-xs font-bold text-slate-500 max-w-[260px] md:max-w-[220px] mx-auto leading-tight">
            Koçlar ve sporcular için tasarlanmış profesyonel platform.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="w-full space-y-2.5 md:space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

          <Link href="/register?role=student" className="block group">
            <div className="p-4 md:p-3 rounded-2xl md:rounded-lg bg-white border-2 border-slate-100 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-50 shadow-sm group-hover:shadow-md active:scale-[0.98]">
              <div className="flex items-center gap-4 md:gap-3">
                <div className="w-11 h-11 md:w-8 md:h-8 rounded-xl md:rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <UserCheck className="w-5 h-5 md:w-4 md:h-4" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-base md:text-sm font-black text-slate-900 group-hover:text-green-700 transition-colors">Öğrenciyim</h3>
                  <p className="text-xs md:text-[10px] font-bold text-slate-400 group-hover:text-green-600/70 transition-colors italic">Ders almak istiyorum</p>
                </div>
                <ArrowRight className="w-5 h-5 md:w-3.5 md:h-3.5 text-slate-200 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

          <Link href="/register?role=coach" className="block group">
            <div className="p-4 md:p-3 rounded-2xl md:rounded-lg bg-white border-2 border-slate-100 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-50 shadow-sm group-hover:shadow-md active:scale-[0.98]">
              <div className="flex items-center gap-4 md:gap-3">
                <div className="w-11 h-11 md:w-8 md:h-8 rounded-xl md:rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <Store className="w-5 h-5 md:w-4 md:h-4" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-base md:text-sm font-black text-slate-900 group-hover:text-green-700 transition-colors">Eğitmenim</h3>
                  <p className="text-xs md:text-[10px] font-bold text-slate-400 group-hover:text-green-600/70 transition-colors italic">Ders vermek istiyorum</p>
                </div>
                <ArrowRight className="w-5 h-5 md:w-3.5 md:h-3.5 text-slate-200 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

        </div>

        {/* Login Link */}
        <div className="mt-6 md:mt-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-sm md:text-xs font-bold text-slate-400">
            Hesabın var mı? {' '}
            <Link href="/login" className="text-slate-900 hover:text-green-600 underline underline-offset-4 decoration-2 decoration-green-300 hover:decoration-green-600 transition-all">
              Hemen Giriş Yap
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
