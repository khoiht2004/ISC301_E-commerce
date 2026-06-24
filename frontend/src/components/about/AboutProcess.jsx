import { motion } from "framer-motion";

const AboutProcess = ({ steps }) => {
  return (
    <section className="py-20 md:py-28 bg-slate-50 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-600 font-bold tracking-widest text-xs uppercase">
            QUY TRÌNH KHÉP KÍN
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Từ Đồng Cỏ Đến Bàn Ăn
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-3">
            Quy trình nhập khẩu và bảo quản thịt tiêu chuẩn quốc tế
          </p>
          <div className="w-16 h-1 bg-primary-600 mx-auto mt-4"></div>
        </div>

        {/* Timeline UI */}
        <div className="relative mt-12">
          {/* Connection Line for Desktop */}
          <div className="hidden lg:block absolute top-[40px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-primary-600/20 via-primary-600 to-primary-600/20 -z-10"></div>

          <div className="row g-4 justify-content-center relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="h-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative"
                >
                  {/* Step Number Badge */}
                  <div className="w-12 h-12 bg-primary-700 text-white rounded-full font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-primary-700/20">
                    {step.number}
                  </div>
                  <h4 className="font-extrabold text-base mb-2 text-slate-900">
                    {step.title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutProcess;
