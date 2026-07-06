import { motion } from "framer-motion";
import { Globe, TrendingUp } from "lucide-react";

const AboutVisionMission = () => {
  return (
    <section className="py-20 bg-slate-950 text-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-primary-950/20 to-slate-950"></div>
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-500 font-bold tracking-widest text-xs uppercase">
            ĐỊNH HƯỚNG PHÁT TRIỂN
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white">
            Tầm Nhìn & Sứ Mệnh
          </h2>
          <div className="w-16 h-1 bg-primary-600 mx-auto mt-4"></div>
        </div>

        <div className="row g-4 justify-content-center">
          {/* Vision Card */}
          <div className="col-12 col-md-6">
            <motion.div
              whileHover={{
                y: -8,
                borderColor: "rgb(var(--color-brand-500) / 0.4)",
              }}
              className="h-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col transition-all duration-300 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl group-hover:bg-primary-600/20 transition-all duration-300"></div>
              <div className="w-14 h-14 bg-primary-700/20 border border-primary-600/30 rounded-xl flex items-center justify-center text-primary-500 mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">TẦM NHÌN</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light flex-1">
                Trở thành thương hiệu phân phối thực phẩm nhập khẩu hàng đầu Việt
                Nam. Deat Lemi Shop định hướng xây dựng hệ thống chi nhánh phủ
                khắp toàn quốc, là lựa chọn số một của người tiêu dùng thông
                thái khi nghĩ về thịt sạch và các sản phẩm ẩm thực ngoại nhập hảo
                hạng.
              </p>
            </motion.div>
          </div>

          {/* Mission Card */}
          <div className="col-12 col-md-6">
            <motion.div
              whileHover={{
                y: -8,
                borderColor: "rgb(var(--color-brand-500) / 0.4)",
              }}
              className="h-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col transition-all duration-300 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl group-hover:bg-primary-600/20 transition-all duration-300"></div>
              <div className="w-14 h-14 bg-primary-700/20 border border-primary-600/30 rounded-xl flex items-center justify-center text-primary-500 mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">SỨ MỆNH</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light flex-1">
                Mang nguồn dinh dưỡng chất lượng cao chuẩn quốc tế tới bàn ăn của
                mọi gia đình Việt. Chúng tôi cam kết đem lại sự an tâm tuyệt đối
                về chất lượng vệ sinh thực phẩm, tối ưu trải nghiệm mua sắm và hỗ
                trợ chăm sóc sức khỏe cộng đồng qua từng thớ thịt.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutVisionMission;
