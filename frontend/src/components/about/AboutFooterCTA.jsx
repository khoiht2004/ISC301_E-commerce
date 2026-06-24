import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, ArrowRight } from "lucide-react";

const AboutFooterCTA = () => {
  return (
    <section className="relative py-20 bg-primary-950 text-white text-center overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-900/60 to-primary-950 z-0"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl z-0"></div>

      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Truck className="w-8 h-8 text-primary-500 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Trải Nghiệm Thịt Nhập Khẩu <br />
            Cao Cấp Ngay Hôm Nay
          </h2>
          <p className="text-primary-200 text-sm md:text-base mb-8 leading-relaxed font-light">
            Liên hệ ngay để nhận các chương trình ưu đãi đặc biệt và trải
            nghiệm dịch vụ giao hàng siêu tốc 2-4h từ Deat Lemi Shop. Miễn phí
            vận chuyển cho các đơn hàng đạt giá trị tối thiểu.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-primary-950 hover:bg-slate-100 font-extrabold px-10 py-4 rounded-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 no-underline"
          >
            Xem sản phẩm <ArrowRight className="w-5 h-5 text-primary-600" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutFooterCTA;
