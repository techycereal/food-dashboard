interface HangingSign {
  onClick: () => void
}

export default function HangingSign({ onClick }: HangingSign) {
  return (
    <div className="absolute top-[-8px] sm:top-[-12px] right-2 sm:right-4 flex flex-col items-center">
      {/* Ropes */}
      <div className="flex justify-between w-[12vw] max-w-[200px] min-w-[120px]">
        <div className="bg-[#8b5e3c] w-[4px] sm:w-[6px] h-[10vw] sm:h-[14vw] max-h-[60px]" />
        <div className="bg-[#8b5e3c] w-[4px] sm:w-[6px] h-[10vw] sm:h-[14vw] max-h-[60px]" />
      </div>

      {/* Sign Board */}
      <div
        className="bg-[#f4f4f4] shadow-lg mt-0 relative flex items-center justify-center hover:shadow-2xl transition-shadow"
        style={{
          width: "12vw",
          minWidth: "120px",
          maxWidth: "200px",
          height: "8vw",
          minHeight: "80px",
          maxHeight: "140px",
        }}
        onClick={onClick}
      >
        {/* Add Product Button */}
        <div className="cursor-pointer bg-gray-400 w-[90%] h-[90%] flex flex-col items-center justify-center">
          <span className="text-white font-bold text-md sm:text-md md:text-xl">Add Product</span>
        </div>
      </div>
    </div>
  );
}
