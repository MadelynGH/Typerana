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
    const [startingTime, updateStartingTime] = useState(performance.now());
    const [elapsedTime, updateElapsedTime] = useState(0);

    const intervalRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, [inputRef.current]);

    useEffect(() => {
        if (currentLetter >= paragraph.length) {
            clearInterval(intervalRef.current);
        }
    }, [currentLetter]);

    return (
        <>
            <div className={inconsolata.className} style={{
                display: "flex",
                flexFlow: "row wrap",
                alignItems: "stretch",
                marginLeft: "auto",
                marginRight: "auto",
                width: "fit-content"
            }}>
                {paragraph.map((i, n) => n == currentLetter ? <h2 key={n} className={`${styles.letter} ${styles.currentLetter}`}>{i}</h2> : <h2 key={n} className={`${styles.letter}`}>{i}</h2>)}
            </div>
            <h2>{elapsedTime} seconds</h2>

            <input ref={inputRef} onKeyDown={(e) => {
                if (e.key == paragraph[currentLetter]) {
                    if (currentLetter == 0) {
                        intervalRef.current = setInterval(() => updateElapsedTime(((performance.now() - startingTime)/1000).toFixed(2)), 10);
                    }
                    updateCurrentLetter(currentLetter + 1);
                } else if ((e.key == " ") && (paragraph[currentLetter].type == "span")) {
                    if (paragraph[currentLetter].props.className == "space") {
                        updateCurrentLetter(currentLetter + 1);
                    }
                }
            }} onBlur={() => inputRef.current.focus()} style={{opacity: "0"}} />
        </>
    );
}4