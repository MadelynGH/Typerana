"use client"
import { useState, useEffect, useRef } from "react";
import styles from "./tool.module.css";
import { Inconsolata, Montserrat } from "next/font/google";

const inconsolata = Inconsolata({
    weight: ["400"]
});

const montserrat = Montserrat({
    weight: ["400", "500", "600", "700", "800"]
});

function Play({ game, updateStage, bestScores, updateBestScores}) {
    const [currentParagraph, updateCurrentParagraph] = useState(0);
    let paragraphList = ["The quick brown fox jumps over the lazy dog.", "The five boxing wizards jump quickly."]
    const [paragraph, updateParagraph] = useState(new String(paragraphList[currentParagraph]).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i));
    const [currentLetter, updateCurrentLetter] = useState(0);
    const inputRef = useRef(null);
    const [startingTime, updateStartingTime] = useState(null);
    const [elapsedTime, updateElapsedTime] = useState(game == "timedParagraph" ? 0 : 15);
    const [charsTyped, updateCharsTyped] = useState(0);
    const [restarted, updateRestarted] = useState(true);

    const intervalRef = useRef(null);

    function restart() {
        clearInterval(intervalRef.current);
        updateElapsedTime(game == "timedParagraph" ? 0 : 15);
        updateCurrentLetter(0);
        updateCurrentParagraph(0);
        updateCharsTyped(0);
        updateRestarted(true);
    }

    useEffect(() => {
        updateParagraph(new String(paragraphList[currentParagraph % paragraphList.length]).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i));
    }, [currentParagraph]);

    useEffect(() => {
        inputRef.current.focus();
    }, [inputRef.current]);

    useEffect(() => {
        currentLetter != 0 ? updateCharsTyped(charsTyped + 1) : null;
        if (currentLetter >= paragraph.length) {
            if (game == "timedParagraph") {
                clearInterval(intervalRef.current);
                if ((elapsedTime < bestScores[0]) || !(bestScores[0])) {
                    updateBestScores([elapsedTime, bestScores[1]]);
                }
                updateRestarted(false);
            } else if (game == "asMuchAsPossible") {
                updateCurrentParagraph(currentParagraph + 1);
                updateCurrentLetter(0);
            }
        }
    }, [currentLetter]);
    
    useEffect(() => {
        if (startingTime && currentParagraph == 0) {
            if (game == "timedParagraph") {
                intervalRef.current = setInterval(() => updateElapsedTime(((performance.now() - startingTime)/1000).toFixed(2)), 10);
            } else if (game == "asMuchAsPossible") {
                intervalRef.current = setInterval(() => updateElapsedTime((15-((performance.now() - startingTime)/1000)).toFixed(2)), 10);
            }
        }
    }, [startingTime]);

    if (game == "asMuchAsPossible") {
        useEffect(() => {
            if (elapsedTime < 0.1) {
                clearInterval(intervalRef.current);
                updateElapsedTime(0);
                if ((charsTyped > bestScores[1]) || !(bestScores[1])) {
                    updateBestScores([bestScores[0], charsTyped]);
                }
                updateRestarted(false);
            }
        }, [elapsedTime]);
    }

    return (
        <>
            <button onClick={() => updateStage(0)} className={styles.backButton}>←</button>

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
            <h2><span className={styles.purpleText}>{elapsedTime}</span> seconds</h2>
            {game == "asMuchAsPossible" ? <h2>Characters typed: <span className={styles.purpleText}>{charsTyped}</span></h2> : null}
            <button onClick={() => {
                restart();
            }} className={montserrat.className}>Reset</button>
            {game == "timedParagraph" ? <h2 style={{
                opacity: !bestScores[0] ? "0" : "100"
            }}>Your Best Time: <span className={styles.purpleText}>{bestScores[0]}</span> seconds</h2> :
            <h2 style={{
                opacity: !bestScores[1] ? "0" : "100"
            }}>Your Best Score (characters typed): <span className={styles.purpleText}>{bestScores[1]}</span> characters</h2>}

            <input ref={inputRef} onKeyDown={async (e) => {
                if (restarted) {
                    if (e.key == paragraph[currentLetter]) {
                        if ((currentLetter == 0) && ((game == "timedParagraph") || (currentParagraph == 0))) {
                            updateStartingTime(performance.now());
                        }
                        updateCurrentLetter(currentLetter + 1);
                    } else if ((e.key == " ") && (paragraph[currentLetter].type == "span")) {
                        if (paragraph[currentLetter].props.className == "space") {
                            updateCurrentLetter(currentLetter + 1);
                        }
                    }
                }
            }} onBlur={() => inputRef.current.focus()} style={{opacity: "0", width: "0", height: "0", margin: "0", padding: "0"}} />
        </>
    );
}

export default function Tool() {
    const [stage, updateStage] = useState(0);
    const [selectedGame, updateSelectedGame] = useState(null);
    const [bestScores, updateBestScores] = useState();
    
    useEffect(() => {
        if (document.cookie.includes("bestScores")) {
            let myCookie = document.cookie.split("bestScores=")[1].split(",");
            console.log(myCookie);
            updateBestScores([myCookie[0] ? JSON.parse(myCookie[0]) : null, myCookie[1] ? JSON.parse(myCookie[1]) : null]);
        } else {
            updateBestScores([null, null]);
        }
    }, [updateBestScores]);

    useEffect(() => {
        if (bestScores) {
            document.cookie = `bestScores=${[bestScores[0], bestScores[1]]}`;
        }
    }, [bestScores]);
    
    return (
        <>
            {stage == 0 ?
                <>
                    <h2>Choose Your Experience:</h2>
                    <div style={{
                        display: "flex",
                        flexFlow: "column wrap",
                        alignItems: "center",
                        gap: "20px"
                    }}>
                        <button onClick={() => {updateSelectedGame("timedParagraph"); updateStage(1);}} className={montserrat.className}>Timed Paragraph</button>
                        <button onClick={() => {updateSelectedGame("asMuchAsPossible"); updateStage(1);}} className={montserrat.className}>As Much As Possible</button>
                    </div>
                </>
            : <Play game={selectedGame} updateStage={updateStage} bestScores={bestScores} updateBestScores={updateBestScores} />
            }
        </>
    );
}