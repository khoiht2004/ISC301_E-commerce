import { useState } from "react";
import { ShieldCheck, Eye, Heart, Award } from "lucide-react";
import AboutHero from "../components/about/AboutHero";
import AboutBrandStory from "../components/about/AboutBrandStory";
import AboutVisionMission from "../components/about/AboutVisionMission";
import AboutCoreValues from "../components/about/AboutCoreValues";
import AboutProcess from "../components/about/AboutProcess";
import AboutBranches from "../components/about/AboutBranches";
import AboutFAQ from "../components/about/AboutFAQ";
import AboutFooterCTA from "../components/about/AboutFooterCTA";

const AboutPage = () => {
  const [activeBranch, setActiveBranch] = useState("hn");
  const [openFaq, setOpenFaq] = useState(null);

  const branches = [
    {
      id: "hn",
      city: "Hà Nội",
      name: "Chi nhánh Hà Nội",
      address: "120 Trần Duy Hưng, Cầu Giấy, Hà Nội",
      hotline: "024.7300.7300",
      hours: "08:00 - 22:00",
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.4443900984954!2d105.80164871488316!3d21.014902986006766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab5ef7e4b9cb%3A0x6e2db05934522818!2zMTIwIFRy4bqnbiBEdXkgSMawbmcsIFRydW5nIEjDsmEsIEPhuqd1IEdp4bqleSwgSMOgIE7hu5lpLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1653300000000!5m2!1sen!2s",
    },
    {
      id: "dn",
      city: "Đà Nẵng",
      name: "Chi nhánh Đà Nẵng",
      address: "45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
      hotline: "0236.730.7300",
      hours: "08:00 - 22:00",
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0298816654763!2d108.21200231481165!3d16.063777988883656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219b5b47a06ab%3A0xe5a3e1b7c0ff74!2zNDUgTmd1eeG7hW4gVsSDbiBMaW5oLCBCw6xuaCBIacOqbiwgSOG6o2kgQ2jDonUsIMSQw6AgTuG6tW5nLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1653300000001!5m2!1sen!2s",
    },
    {
      id: "hcm",
      city: "TP. Hồ Chí Minh",
      name: "Chi nhánh TP.HCM",
      address: "88 Nguyễn Huệ, Quận 1, TP.HCM",
      hotline: "028.7300.7300",
      hours: "08:00 - 22:00",
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602324222046!2d106.702310114749!3d10.776019392321857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a1b6a78b%3A0x1d368e7188b8d4e4!2zODggTmd1eeG7hW4gSHXhu4csIELhurNuIE5naMOpLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1653300000002!5m2!1sen!2s",
    },
  ];

  const values = [
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: "Chất lượng",
      description:
        "Chỉ cung cấp những thớ thịt nhập khẩu hảo hạng từ các trang trại uy tín trên thế giới, đảm bảo độ tươi ngon vượt trội.",
    },
    {
      icon: <Eye className="w-8 h-8 text-primary-600" />,
      title: "Minh bạch",
      description:
        "Nguồn gốc xuất xứ rõ ràng, đầy đủ chứng từ nhập khẩu chính ngạch và giấy kiểm dịch từ các cơ quan chức năng.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary-600" />,
      title: "An toàn",
      description:
        "Bảo quản bằng công nghệ cấp đông Châu Âu khép kín, tuyệt đối không chất bảo quản hay phụ gia độc hại.",
    },
    {
      icon: <Heart className="w-8 h-8 text-primary-600" />,
      title: "Tận tâm",
      description:
        "Luôn lắng nghe, tận tình tư vấn và giao hàng hỏa tốc trong 0-4h để bảo toàn chất lượng dinh dưỡng của thực phẩm.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Chọn nguồn cung",
      description:
        "Hợp tác trực tiếp với các trang trại nuôi thả tự nhiên đạt chuẩn hữu cơ tại Mỹ, Úc, Nhật Bản.",
    },
    {
      number: "02",
      title: "Kiểm định chất lượng",
      description:
        "Mỗi lô thịt đều trải qua 3 tuyến kiểm dịch nghiêm ngặt trước khi đóng gói xuất khẩu.",
    },
    {
      number: "03",
      title: "Cấp đông chuẩn quốc tế",
      description:
        "Sử dụng công nghệ cấp đông nhanh (Quick Freezing) tại -40°C để giữ nguyên dưỡng chất và cấu trúc cơ thịt.",
    },
    {
      number: "04",
      title: "Vận chuyển lạnh",
      description:
        "Vận chuyển khép kín trong các container lạnh chuyên dụng xuyên suốt hành trình về Việt Nam.",
    },
    {
      number: "05",
      title: "Giao đến khách hàng",
      description:
        "Đóng gói hút chân không hai lớp và giao nhanh bằng thùng giữ nhiệt tận tay khách hàng.",
    },
  ];

  const faqs = [
    {
      question: "Thịt nhập khẩu tại Deat Lemi Shop có nguồn gốc từ đâu?",
      answer:
        "Tất cả các sản phẩm thịt bò, heo, cừu tại Deat Lemi Shop đều được nhập khẩu chính ngạch từ các quốc gia phát triển mạnh về chăn nuôi như Mỹ (USDA Prime/Choice), Úc (MSA Certified), Nhật Bản (Wagyu A5), Canada... Chúng tôi cam kết cung cấp đầy đủ giấy chứng nhận nguồn gốc xuất xứ (CO) và kiểm dịch vệ sinh an toàn thực phẩm.",
    },
    {
      question: "Deat Lemi Shop có giao hàng toàn quốc không?",
      answer:
        "Chúng tôi hỗ trợ giao hàng hỏa tốc bằng thùng giữ nhiệt chuyên dụng trong vòng 2-4h tại nội thành Hà Nội, Đà Nẵng và TP.HCM. Đối với các tỉnh thành lân cận khác, chúng tôi cung cấp dịch vụ giao hàng thông qua hệ thống xe tải đông lạnh chuyên dụng để đảm bảo sản phẩm luôn duy trì ở nhiệt độ tiêu chuẩn và không bị rã đông trong quá trình vận chuyển.",
    },
    {
      question: "Làm thế nào để bảo quản thịt nhập khẩu đúng cách tại nhà?",
      answer:
        "Để bảo toàn nguyên vẹn độ ngọt và giá trị dinh dưỡng, bạn nên bảo quản thịt trong ngăn đá hoặc tủ đông chuyên dụng ở nhiệt độ dưới -18°C. Trước khi chế biến, hãy rã đông tự nhiên bằng cách chuyển thịt xuống ngăn mát tủ lạnh từ 4-8 tiếng. Tránh rã đông trực tiếp bằng nước nóng hoặc lò vi sóng ở nhiệt độ quá cao vì sẽ làm mất đi các dưỡng chất tự nhiên trong thịt.",
    },
    {
      question:
        "Sản phẩm của Deat Lemi Shop có đầy đủ chứng nhận an toàn thực phẩm không?",
      answer:
        "Hoàn toàn có. 100% sản phẩm bày bán tại Deat Lemi Shop đều vượt qua các đợt kiểm dịch khắt khe của Bộ Nông nghiệp & Phát triển Nông thôn và Bộ Y tế Việt Nam. Sản phẩm được sơ chế và đóng gói tại cơ sở đạt tiêu chuẩn HACCP và ISO 22000 về hệ thống quản lý an toàn thực phẩm.",
    },
  ];

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      <AboutHero />
      <AboutBrandStory />
      <AboutVisionMission />
      <AboutCoreValues values={values} />
      <AboutProcess steps={steps} />
      <AboutBranches
        branches={branches}
        activeBranch={activeBranch}
        setActiveBranch={setActiveBranch}
      />
      <AboutFAQ faqs={faqs} openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <AboutFooterCTA />
    </div>
  );
};

export default AboutPage;
