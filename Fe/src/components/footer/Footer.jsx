import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white">
      {/* Dải trang trí phía trên */}
      <div className="h-[3px] w-full bg-gradient-to-r from-red-300 via-red-700 to-red-300" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo & intro */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {/* C-learning Logo */}
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="50%" stopColor="#B91C1C" />
                    <stop offset="100%" stopColor="#991B1B" />
                  </linearGradient>
                  <linearGradient id="footerAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#footerLogoGradient)" />
                <rect x="30" y="2" width="14" height="4" rx="2" fill="url(#footerAccentGrad)" opacity="0.9" />
                <text x="16" y="33" textAnchor="middle" fill="white" fontSize="26" fontFamily="'Inter', 'Segoe UI', sans-serif" fontWeight="800" letterSpacing="-1">C</text>
                <line x1="28" y1="16" x2="40" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
                <line x1="28" y1="22" x2="38" y2="22" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
                <line x1="28" y1="28" x2="36" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="flex flex-col">
                <span className="text-white leading-tight font-bold">C-learning</span>
                <span className="text-xs text-stone-400 font-normal">Nền tảng học tiếng Trung</span>
              </div>
            </h2>
            <p className="mt-4 text-stone-300 leading-relaxed text-sm">
              Nền tảng học <span className="text-red-400 font-medium">tiếng Trung</span> hiện đại — học từ vựng, ngữ pháp, luyện nghe và hội thoại
              theo chuẩn HSK, giúp bạn tiến bộ từng ngày. C-learning đồng hành cùng bạn.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-700 hover:bg-red-700 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-700 hover:bg-red-700 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-700 hover:bg-red-700 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-700 hover:bg-red-700 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
              </a>
            </div>
          </div>

          {/* Links - Khóa học */}
          <div>
            <h3 className="text-base font-semibold mb-4 pb-2 border-b border-slate-700 text-red-400">
              Khóa học
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/courses" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  HSK 1 - Sơ cấp
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  HSK 2-3 - Trung cấp
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  HSK 4-6 - Cao cấp
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  Luyện thi HSK
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Tài nguyên */}
          <div>
            <h3 className="text-base font-semibold mb-4 pb-2 border-b border-slate-700 text-red-400">
              Tài nguyên
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/practice" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Luyện tập
                </Link>
              </li>
              <li>
                <Link to="/manage-document" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Tài liệu học
                </Link>
              </li>
              <li>
                <Link to="/flashcard" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Flashcard
                </Link>
              </li>
              <li>
                <Link to="/event" className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Sự kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-base font-semibold mb-4 pb-2 border-b border-slate-700 text-red-400">
              Đăng ký nhận bản tin
            </h3>
            <p className="text-stone-300 mb-4 text-sm">
              Nhận mẹo học, từ mới và cập nhật khóa học mới mỗi tuần.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Đã đăng ký nhận tin thành công!");
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                required
                placeholder="Email của bạn"
                className="px-4 py-2.5 rounded-lg w-full text-stone-900 bg-white focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-red-700 px-4 py-2.5 rounded-lg font-semibold text-white hover:bg-red-800 transition-colors text-sm"
              >
                Đăng ký ngay
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-400">
            © {new Date().getFullYear()} C-learning | All rights reserved
          </p>
          <div className="flex gap-6 text-sm text-stone-400">
            <Link to="/privacy" className="hover:text-red-400 transition-colors">Chính sách bảo mật</Link>
            <Link to="/terms" className="hover:text-red-400 transition-colors">Điều khoản sử dụng</Link>
            <Link to="/contact" className="hover:text-red-400 transition-colors">Liên hệ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
