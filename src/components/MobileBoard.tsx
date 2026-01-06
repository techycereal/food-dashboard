type MobileBoardProps = {
    children: React.ReactNode;
};

export default function MobileBoard({ children }: MobileBoardProps) {
    return (
        <div className="flex md:hidden justify-center px-4 py-10">
            <div className="relative w-full max-w-sm">
                {/* Clipboard body */}
                <div className="relative h-[75vh] rounded-md bg-[#bb8e51] shadow-[6px_6px_4px_rgba(0,0,0,0.25)] paper-noise">
                    {/* Clipboard clip */}
                    <div className="absolute top-1 left-1/2 h-10 w-32 -translate-x-1/2 rounded-t-[20px] bg-[#ababab] shadow-md z-10" />

                    {/* Paper */}
                    <div className="absolute inset-4 pt-12 bg-white px-4 py-6 flex flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
