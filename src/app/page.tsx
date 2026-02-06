'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Target, BarChart3, Dumbbell, Sparkles, Moon, Sun, Store } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

// Static data
const features = [
  {
    icon: Target,
    title: 'Kişisel Programlar',
    description: 'Hedeflerinize ve vücut tipinize özel hazırlanmış antrenman ve beslenme planları.',
  },
  {
    icon: Zap,
    title: 'Anlık Takip',
    description: 'Performansınızı gerçek zamanlı izleyin, anında geri bildirim alın.',
  },
  {
    icon: BarChart3,
    title: 'Detaylı Analiz',
    description: 'Gelişiminizi grafikler ve istatistiklerle derinlemesine analiz edin.',
  },
];

const stats = [
  { value: '500+', label: 'Aktif Üye' },
  { value: '1000+', label: 'Antrenman' },
  { value: '98%', label: 'Memnuniyet' },
];

export default function LandingPage() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <div
      className="min-h-screen overflow-hidden relative transition-colors duration-300"
      style={{
        backgroundColor: 'var(--landing-bg)',
        color: 'var(--landing-text)'
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 noise opacity-[0.03] mix-blend-overlay" />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(var(--landing-grid-color), 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--landing-grid-color), 0.04) 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem'
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundImage: `radial-gradient(rgba(var(--landing-grid-color), 0.07) 1px, transparent 1px)`,
            backgroundSize: '1.5rem 1.5rem'
          }}
        />
        <div
          className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse-slow transition-colors duration-500"
          style={{ backgroundColor: 'var(--landing-glow1)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[100px] animate-pulse-slow [animation-delay:3s] transition-colors duration-500"
          style={{ backgroundColor: 'var(--landing-glow2)' }}
        />
      </div>

      {/* Header */}
      <header
        className="container mx-auto p-6 relative z-10 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-700"
      >
        <div className="flex items-center gap-3">
          <div
            className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
            style={{
              boxShadow: `0 10px 25px -5px var(--landing-card-shadow)`
            }}
          >
            <Image
              src="/shark-logo.jpg"
              alt="Alphletich Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tight" style={{ color: 'var(--landing-text)' }}>
            ALPLETICH
          </span>
        </div>

        <div className="flex gap-3 items-center">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="transition-colors duration-200"
              style={{ color: 'var(--landing-text-muted)' }}
            >
              Giriş Yap
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="border-0 transition-colors duration-300"
              style={{
                background: `linear-gradient(135deg, var(--landing-primary), var(--landing-cta-gradient-to))`,
                boxShadow: `0 4px 15px -3px var(--landing-card-shadow)`
              }}
            >
              Kayıt Ol
            </Button>
          </Link>
        </div>
      </header>

      {/* Fixed Theme Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 border-2"
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            color: isDark ? '#fbbf24' : '#475569'
          }}
          aria-label="Tema değiştir"
        >
          {isDark ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-24 text-center relative z-10">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 transition-colors duration-300 animate-in fade-in zoom-in duration-700"
          style={{
            backgroundColor: 'var(--landing-badge-bg)',
            border: '1px solid var(--landing-badge-border)',
            color: 'var(--landing-badge-text)'
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold">Türkiye'nin İlk Fitness Pazaryeri</span>
        </div>

        {/* Main Title */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
        >
          <span style={{ color: 'var(--landing-text)' }}>Fitness</span>
          <br />
          <span
            className="inline-block bg-clip-text text-transparent transition-all duration-300"
            style={{
              backgroundImage: `linear-gradient(135deg, var(--landing-primary), var(--landing-primary-light), var(--landing-cta-gradient-to))`
            }}
          >
            Dünyan
          </span>
        </h1>

        <div
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
          style={{ color: 'var(--landing-text-muted)' }}
        >
          İster <span className="font-bold text-green-600">Koç</span> ol dükkanını aç, ister <span className="font-bold text-blue-600">Öğrenci</span> ol hayalindeki programa ulaş.
          Sporun buluşma noktası Alpletich.
        </div>

        {/* Dual CTA Section for Marketplace */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {/* Coach Card */}
          <div className="p-8 rounded-3xl border-2 hover:border-green-500 transition-all duration-300 group relative overflow-hidden bg-white/5 backdrop-blur-sm"
            style={{ borderColor: 'var(--landing-card-border)' }}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Dumbbell className="w-24 h-24" />
            </div>
            <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--landing-text)' }}>Koçlar İçin</h3>
            <p className="mb-6 font-medium" style={{ color: 'var(--landing-text-muted)' }}>
              Kendi fitness dükkanını aç, programlarını listele ve binlerce öğrenciye ulaş.
            </p>
            <Link href="/register?role=coach">
              <Button className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                Dükkanını Aç
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Student Card */}
          <div className="p-8 rounded-3xl border-2 hover:border-blue-500 transition-all duration-300 group relative overflow-hidden bg-white/5 backdrop-blur-sm"
            style={{ borderColor: 'var(--landing-card-border)' }}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24" />
            </div>
            <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--landing-text)' }}>Öğrenciler İçin</h3>
            <p className="mb-6 font-medium" style={{ color: 'var(--landing-text-muted)' }}>
              Hedefine uygun programı bul, güvenle satın al ve gelişime başla.
            </p>
            <Link href="/register?role=student">
              <Button className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                Program Keşfet
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-8 md:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500"
        >
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-black text-green-600 group-hover:scale-110 transition-transform">100+</div>
            <div className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--landing-text-muted2)' }}>Onaylı Koç</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-black text-blue-600 group-hover:scale-110 transition-transform">500+</div>
            <div className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--landing-text-muted2)' }}>Program</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-black text-purple-600 group-hover:scale-110 transition-transform">5k+</div>
            <div className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--landing-text-muted2)' }}>Mutlu Öğrenci</div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section
        className="container mx-auto px-6 py-24 relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--landing-text)' }}>
            Neden Alpletich?
          </h2>
          <p className="max-w-xl mx-auto font-medium" style={{ color: 'var(--landing-text-muted)' }}>
            Sporcular ve Koçlar için tasarlanmış ekosistem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div
            className="group p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--landing-card-bg)',
              borderColor: 'var(--landing-card-border)'
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-green-100 text-green-600">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: 'var(--landing-text)' }}>
              Koç Dükkanı
            </h3>
            <p className="leading-relaxed font-medium" style={{ color: 'var(--landing-text-muted)' }}>
              Kendi profilini oluştur, programlarını yükle ve satışa başla. Tüm yönetim sende.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className="group p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--landing-card-bg)',
              borderColor: 'var(--landing-card-border)'
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-blue-100 text-blue-600">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: 'var(--landing-text)' }}>
              Doğrulanmış İçerik
            </h3>
            <p className="leading-relaxed font-medium" style={{ color: 'var(--landing-text-muted)' }}>
              Uzman koçlar tarafından hazırlanmış, bilimsel ve sonuç odaklı antrenman programları.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className="group p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--landing-card-bg)',
              borderColor: 'var(--landing-card-border)'
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-purple-100 text-purple-600">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: 'var(--landing-text)' }}>
              Hızlı Etkileşim
            </h3>
            <p className="leading-relaxed font-medium" style={{ color: 'var(--landing-text-muted)' }}>
              Satın aldığın programı hemen uygulamaya başla, koçunla mesajlaş ve gelişimi takip et.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-24 overflow-hidden"
      >
        <div className="container mx-auto px-6 relative z-10">
          <div
            className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl transition-colors duration-300"
            style={{
              background: `linear-gradient(135deg, var(--landing-cta-gradient-from), var(--landing-cta-gradient-to))`,
              boxShadow: `0 25px 50px -12px var(--landing-card-shadow)`
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white mb-6 backdrop-blur-sm"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-bold">Şimdi Katıl</span>
              </div>

              <h2
                className="text-3xl md:text-5xl font-black mb-4 text-white"
              >
                Dönüşümüne Bugün Başla
              </h2>
              <p
                className="text-lg text-white/90 max-w-xl mx-auto mb-8"
              >
                Binlerce kişi hedeflerine ulaştı. Sıradaki sen ol.
              </p>
              <div>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="px-10 bg-white hover:bg-slate-50 shadow-xl shadow-black/20 text-lg h-14 rounded-2xl font-bold transition-colors duration-200"
                    style={{ color: 'var(--landing-primary)' }}
                  >
                    Ücretsiz Kayıt Ol
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="container mx-auto px-6 py-12 border-t relative z-10 transition-colors duration-300"
        style={{ borderColor: 'var(--landing-footer-border)' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm transition-transform duration-300 hover:scale-105"
            >
              <Image
                src="/shark-logo.jpg"
                alt="Alpletich Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-black" style={{ color: 'var(--landing-text)' }}>ALPLETICH</span>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--landing-text-muted2)' }}>
            © 2026 Alpletich. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
