type EmailBoardProps = {
    children: React.ReactNode;
};

export default function EmailBoard({ children }: EmailBoardProps) {
    return (
        <div className="hidden md:flex justify-center px-6 py-10">
            <div className="relative w-full max-w-3xl">
                {/* Clipboard body */}
                <div className="relative max-h-[30vh] min-h-[30vh] rounded-md bg-[#bb8e51] shadow-[6px_6px_4px_rgba(0,0,0,0.25)] paper-noise">
                    {/* Paper */}
                    <div className="absolute inset-4 bg-white px-6 py-8 flex flex-col">
                        {/* Side tab */}
                        <div className="absolute -left-4 top-1/2 h-36 w-12 -translate-y-1/2 rounded-l-[24px] bg-[#ababab] shadow-md" />

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
