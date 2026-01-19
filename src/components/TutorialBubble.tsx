import React from "react";

interface TutorialBubbleProps {
    show: boolean;
    text: React.ReactNode;
    position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
    onNext?: () => void;
    onBack?: () => void;
    onDone?: () => void;
    isLast?: boolean;
    children?: React.ReactNode;
    condition: boolean;
}

export function TutorialBubble({
    show,
    text,
    position = "top",
    onNext,
    onBack,
    onDone,
    children,
    condition,
}: TutorialBubbleProps) {
    if (!show) return <>{children}</>;

    const positionClasses: Record<string, string> = {
        top: "bottom-full mb-3 left-1/2 -translate-x-1/2",
        bottom: "top-full mt-3 left-1/2 -translate-x-1/2",
        left: "right-full mr-3 top-1/2 -translate-y-1/2",
        right: "left-full ml-3 top-1/2 -translate-y-1/2",
        "top-left": "bottom-full mb-3 left-0",
        "top-right": "bottom-full mb-3 right-0",
        "bottom-left": "top-full mt-3 left-0",
        "bottom-right": "top-full mt-3 right-0",
    };

    const arrowClasses: Record<string, string> = {
        top: "top-full left-1/2 -translate-x-1/2 -mt-1",
        bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
        left: "left-full top-1/2 -translate-y-1/2 -ml-1",
        right: "right-full top-1/2 -translate-y-1/2 -mr-1",
        "top-left": "top-full left-2 -mt-1",
        "top-right": "top-full right-2 -mt-1",
        "bottom-left": "bottom-full left-2 -mb-1",
        "bottom-right": "bottom-full right-2 -mb-1",
    };

    return (
        <div className="relative">
            {/* 👇 Children */}
            <div className="contents">{children}</div>

            {/* Bubble */}
            <div
                className={`
          absolute z-50 w-40 md:w-56 p-3 sm:p-1 text-sm sm:text-xs
          bg-black/90 text-white rounded-lg
          shadow-lg
          ${positionClasses[position]}
        `}
            >
                <div className="whitespace-pre-line">{text}</div>

                {/* Arrow */}
                <div
                    className={`
            absolute w-2 h-2 sm:w-1.5 sm:h-1.5 bg-black/90 rotate-45
            ${arrowClasses[position]}
          `}
                />

                {(onNext || onBack || onDone) && (
                    <div className="flex justify-between items-center mt-3 text-xs sm:text-[10px]">
                        {onBack ? (
                            <button onClick={onBack} className="underline opacity-70">
                                Back
                            </button>
                        ) : (
                            <span />
                        )}

                        {onDone ? (
                            <button onClick={onDone} className="font-bold underline">
                                Done
                            </button>
                        ) : (
                            <>
                                {console.log(condition)}
                                {condition != false && (
                                    <button onClick={onNext} className="font-bold underline">
                                        Next
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
