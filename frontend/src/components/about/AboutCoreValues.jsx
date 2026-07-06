import { motion } from "framer-motion";

const AboutCoreValues = ({ values }) => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-600 font-bold tracking-widest text-xs uppercase">
            BẢO CHỨNG THƯƠNG HIỆU
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Giá Trị Cốt Lõi
          </h2>
          <div className="w-16 h-1 bg-primary-600 mx-auto mt-4"></div>
        </div>

        <div className="row g-4">
          {values.map((val, idx) => (
            <div key={idx} className="col-12 col-md-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="h-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto mb-6">
                  {val.icon}
                </div>
                <h4 className="font-extrabold text-lg mb-3 text-slate-900">
                  {val.title}
                </h4>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutCoreValues;
