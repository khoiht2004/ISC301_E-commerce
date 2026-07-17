/* eslint-disable react/prop-types */
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CopyText = ({
  text,
  className = "",
  textClassName = "font-medium text-slate-800",
  children,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan truyền (VD: click vào row để mở chi tiết)
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Đã copy!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy thất bại");
    }
  };

  if (!text) return <span className="text-slate-400 italic">N/A</span>;

  return (
    <div className={`flex items-center gap-2 group w-max ${className}`}>
      {children ? (
        children
      ) : (
        <span
          className={`truncate max-w-[150px] ${textClassName}`}
          title={text}
        >
          {text}
        </span>
      )}
      <button
        onClick={handleCopy}
        className="p-1 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
        title="Copy"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default CopyText;
