import React, { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

interface MultilineTextboxProp {
    height: number|string;
    width: number|string;
    maxCharsPerLine: number;
    content?: string;
    values?: string[]
}

// 사용자 정의 ref 타입 정의
export interface MultilineTextboxHandle {
    submitContent: () => string[];
}

export const MultilineTextbox = forwardRef<MultilineTextboxHandle, MultilineTextboxProp>(({ height, width, maxCharsPerLine, values }, ref) => {
    const [isInitialOpen, setInitialOpen] = useState<boolean>(true);
    const [textLines, setTextLines] = useState<string[]>([]);
    const [loc, setLoc] = useState<number>(1);
    const locRef = useRef<HTMLTextAreaElement>(null);
    const inputAreaRef = useRef<HTMLTextAreaElement>(null);

    const insertLineBreaks = (text: string, maxWidth: number) => {
        const lines = text.split("\n");
        const processedLines: string[] = [];

        lines.forEach(line => {
            let currentLine = line;
            while (currentLine.length > maxWidth) {
                processedLines.push(currentLine.slice(0, maxWidth));
                currentLine = currentLine.slice(maxWidth);
            }
            processedLines.push(currentLine);
        });

        return processedLines.join("\n");
    };

    const onChangeContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const updatedText = insertLineBreaks(e.target.value, maxCharsPerLine);
        const stringLines = updatedText.split("\n");
        setTextLines(stringLines);
        setLoc(stringLines.length);
        e.target.value = updatedText;
    };

    const onScrollCapture = () => {
        if (locRef.current && inputAreaRef.current) {
            locRef.current.scrollTop = inputAreaRef.current.scrollTop;
        }
    };

    useEffect(() => {
        if(values && isInitialOpen) {
            inputAreaRef.current.defaultValue = values.join('\n');
            setLoc(values.length);
            setInitialOpen(false);
        }
        
        const setLocText = () => {
            const locStrings: string[] = [];
            for (let i = 0; i < loc; i++) {
                locStrings.push((i + 1).toFixed(1));
            }
            const locNumbering = locStrings.join("\n");
            if (locRef.current) locRef.current.value = locNumbering;
        };



        setLocText();        
    }, [loc]);

    useImperativeHandle(ref, () => ({
        submitContent: () => {
            return textLines
        },
    }));

    return (
        <div className="flex flex-row" style={{ height, width }}>
            {/* Liner */}
            <div className="min-w-[48px] max-w-[48px] h-full" style={{ background: "skyblue"}}>
                <textarea
                    className="w-full h-full"
                    ref={locRef}
                    style={{ resize: "none", background: "none", overflowY: "hidden", overflowWrap: "break-word", userSelect:'none'}}
                    readOnly
                />
            </div>
            {/* Textarea */}
            <div className="flex-grow border">
                <textarea
                    key={'sptMultiLine'}
                    className="w-full h-full"
                    ref={inputAreaRef}
                    style={{ resize: "none", whiteSpace: "pre-wrap" }}
                    onChange={onChangeContent}
                    onScroll={onScrollCapture}
                    wrap="off" // 여기서 wrap 속성을 꺼야 강제 줄바꿈이 반영됨
                />
            </div>
        </div>
        );
    }
);
