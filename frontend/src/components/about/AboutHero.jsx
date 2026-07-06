import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const AboutHero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-slate-950 pt-20">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1920&auto=format&fit=crop"
          alt="Premium Imported Meat Banner"
          className="w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      </div>

      <div className="container relative z-10 px-4 py-16 md:py-24">
        <div className="max-w-3xl text-left text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-500 font-bold mb-6 tracking-widest text-xs uppercase animate-pulse">
              <Sparkles className="w-4.5 h-4.5" /> Deat Lemi SHOP
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
              Thịt Nhập Khẩu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                Cao Cấp Hảo Hạng
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed font-light">
              Chào mừng bạn đến với Deat Lemi Shop - Hệ thống phân phối thực
              phẩm nhập khẩu cao cấp hàng đầu Việt Nam. Chúng tôi mang đến cho
              gia đình bạn những thớ thịt tươi ngon nhất được tuyển chọn nghiêm
              ngặt từ những nông trại hàng đầu tại Mỹ, Úc, Nhật Bản...
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-primary-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-800 transition-all duration-300 shadow-lg hover:shadow-primary-700/20 transform hover:-translate-y-1 no-underline flex items-center gap-2"
              >
                Khám phá sản phẩm <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#brand-story"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300 no-underline"
              >
                Tìm hiểu câu chuyện
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Curved bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden line-height-0">
        <svg
          className="relative block w-full h-[40px] text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79-22.2,103.59-32.17,158-33.46,158-3.75,326.69,56.77,482,51.84,182.26-5.78,348.64-56.77,560-26.06V0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default AboutHero;
