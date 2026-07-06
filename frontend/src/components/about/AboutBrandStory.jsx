import { motion } from "framer-motion";

const AboutBrandStory = () => {
  return (
    <section id="brand-story" className="py-20 md:py-28 bg-white">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary-600 font-bold tracking-widest text-xs uppercase block mb-3">
                VỀ CHÚNG TÔI
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
                Tinh Hoa Ẩm Thực Nhập Khẩu Cho Bữa Ăn Trọn Vẹn
              </h2>
              <div className="w-16 h-1 bg-primary-600 mb-8"></div>
              <div className="space-y-5 text-slate-600 text-sm md:text-base leading-relaxed font-light">
                <p>
                  Được thành lập với khát vọng mang đến nguồn thực phẩm cao cấp
                  cho thị trường Việt Nam, <strong>Deat Lemi Shop</strong> tự hào
                  là đối tác phân phối thịt nhập khẩu uy tín từ các thương hiệu
                  chăn nuôi danh giá bậc nhất thế giới.
                </p>
                <p>
                  Mỗi sản phẩm tại cửa hàng của chúng tôi đều trải qua quy trình
                  đánh giá và bảo quản nghiêm ngặt bằng công nghệ cấp đông sâu
                  Châu Âu hiện đại. Điều này giúp giữ nguyên cấu trúc protein,
                  vị ngọt tự nhiên và dinh dưỡng dồi dào nguyên bản của miếng
                  thịt.
                </p>
                <p>
                  Chúng tôi không chỉ bán thịt sạch, chúng tôi mang tới một
                  phong cách sống ẩm thực thượng lưu - nơi sự an toàn, chất
                  lượng và trải nghiệm của khách hàng luôn được đặt ở vị thế độc
                  tôn.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="border-l-4 border-primary-600 pl-4">
                  <h3 className="text-2xl font-black text-slate-900 m-0">
                    100%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                    Chất lượng nhập khẩu
                  </p>
                </div>
                <div className="border-l-4 border-primary-600 pl-4">
                  <h3 className="text-2xl font-black text-slate-900 m-0">
                    Giao nhanh
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                    Trong vòng 2 giờ
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-lg-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary-800/10 rounded-2xl transform translate-x-4 translate-y-4 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=1000&auto=format&fit=crop"
                alt="Premium Steak Cuts Deat Lemi Shop"
                className="w-full h-[400px] md:h-[480px] object-cover rounded-2xl shadow-xl border border-slate-100"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutBrandStory;
