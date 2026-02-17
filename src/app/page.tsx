'use client';

import Link from 'next/link';
import { Store, UserCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">

      {/* Container */}
      <div className="w-full max-w-sm lg:max-w-md flex flex-col items-center text-center">

        {/* Title Section */}
        <div className="mb-8 lg:mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl lg:text-3xl font-black tracking-tight text-slate-900 mb-3 px-2">
            Sporun <br />
            <span className="text-green-600">Yeni Dünyası</span>
          </h1>
          <p className="text-base lg:text-sm font-bold text-slate-500 max-w-[260px] lg:max-w-[300px] mx-auto leading-tight">
            Koçlar ve sporcular için tasarlanmış profesyonel platform.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

          <Link href="/register?role=student" className="block group">
            <div className="p-4 lg:p-4 rounded-2xl lg:rounded-xl bg-white border-2 border-slate-100 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-50 shadow-sm group-hover:shadow-md active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 lg:w-10 lg:h-10 rounded-xl lg:rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <UserCheck className="w-5 h-5 lg:w-5 lg:h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg lg:text-base font-black text-slate-900 group-hover:text-green-700 transition-colors">Öğrenciyim</h3>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-green-600/70 transition-colors italic">Ders almak istiyorum</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

          <Link href="/register?role=coach" className="block group">
            <div className="p-4 lg:p-4 rounded-2xl lg:rounded-xl bg-white border-2 border-slate-100 transition-all duration-200 group-hover:border-green-600 group-hover:bg-green-50 shadow-sm group-hover:shadow-md active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 lg:w-10 lg:h-10 rounded-xl lg:rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <Store className="w-5 h-5 lg:w-5 lg:h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg lg:text-base font-black text-slate-900 group-hover:text-green-700 transition-colors">Eğitmenim</h3>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-green-600/70 transition-colors italic">Ders vermek istiyorum</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

        </div>

        {/* Login Link */}
        <div className="mt-8 lg:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-sm font-bold text-slate-400">
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
