"use client"
import { useState, useEffect, useRef } from "react";
import styles from "./tool.module.css";
import { Inconsolata } from "next/font/google";

const inconsolata = Inconsolata({
    weight: ["400"]
});

export default function Tool() {
    const [paragraph, updateParagraph] = useState(new String("The quick brown fox jumped over the lazy dog.").split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i));
    const [currentLetter, updateCurrentLetter] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, [inputRef.current]);

    return (
        <>
            <div className={inconsolata.className} style={{
                display: "flex",
                flexFlow: "row wrap",
                alignItems: "stretch"
            }}>
                {paragraph.map((i, n) => n == currentLetter ? <h2 key={n} className={`${styles.letter} ${styles.currentLetter}`}>{i}</h2> : <h2 key={n} className={`${styles.letter}`}>{i}</h2>)}
            </div>
            <input ref={inputRef} onKeyDown={(e) => {
                console.log(paragraph[currentLetter]);
                if (e.key == paragraph[currentLetter]) {
                    updateCurrentLetter(currentLetter + 1);
                } else if ((e.key == " ") && (paragraph[currentLetter].type == "span")) {
                    if (paragraph[currentLetter].props.className == "space") {
                        updateCurrentLetter(currentLetter + 1);
                    }
                }
            }} onBlur={() => inputRef.current.focus()} style={{opacity: "0"}} />
        </>
    );
}