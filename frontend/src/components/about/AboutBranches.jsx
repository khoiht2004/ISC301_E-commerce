import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

const AboutBranches = ({ branches, activeBranch, setActiveBranch }) => {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-600 font-bold tracking-widest text-xs uppercase">
            HỆ THỐNG PHÂN PHỐI
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Chi Nhánh & Bản Đồ
          </h2>
          <div className="w-16 h-1 bg-primary-600 mx-auto mt-4"></div>
        </div>

        <div className="row g-5">
          {/* Branch Cards list */}
          <div className="col-12 col-lg-5 flex flex-col gap-4">
            {branches.map((branch) => {
              const isActive = activeBranch === branch.id;
              return (
                <motion.div
                  key={branch.id}
                  onClick={() => setActiveBranch(branch.id)}
                  whileHover={{ scale: 1.01 }}
                  className={`cursor-pointer border-2 rounded-2xl p-5 transition-all duration-300 flex gap-4 ${
                    isActive
                      ? "border-primary-600 bg-primary-50/20 shadow-md"
                      : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-primary-700 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-extrabold text-base text-slate-900 m-0">
                        {branch.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-primary-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {branch.city}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                      {branch.address}
                    </p>

                    <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary-600" />
                        <span>
                          Hotline: <b>{branch.hotline}</b>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary-600" />
                        <span>Mở cửa: {branch.hours}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Google Map Tab Content */}
          <div className="col-12 col-lg-7">
            <div className="h-[350px] md:h-[450px] bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative">
              {branches.map((branch) => {
                const isActive = activeBranch === branch.id;
                return (
                  <div
                    key={branch.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                      isActive
                        ? "opacity-100 z-10 pointer-events-auto"
                        : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    {isActive && (
                      <iframe
                        title={branch.name}
                        src={branch.mapUrl}
                        className="w-full h-full border-0"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutBranches;
