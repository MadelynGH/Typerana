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

function Play({ game, updateStage, bestScores, updateBestScores, customText }) {
    const [currentParagraph, updateCurrentParagraph] = useState(0);
    let paragraphList = ["The quick brown fox jumps over the lazy dog.", "The five boxing wizards jump quickly."];
    let combinedParagraphList = "";
    paragraphList.forEach((i, n) => {
        combinedParagraphList = combinedParagraphList.concat(n > 0 ? " " : "", i);
    });
    let wordBank = ["the", "wait", "fox", "dog", "hello", "chair", "table", "bracket", "cat", "what", "laptop", "computer", "paragraph", "decent", "recent", "blah"];
    const [paragraph, updateParagraph] = useState((game == "asMuchAsPossible" || game == "survival" ? new String(paragraphList[0]) : (game == "timedParagraph" ? new String(combinedParagraphList) : (game == "customPractice" ? new String(customText) : new String(wordBank[Math.floor(Math.random()*wordBank.length)])))).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i));
    const [currentLetter, updateCurrentLetter] = useState(0);
    const inputRef = useRef(null);
    const [startingTime, updateStartingTime] = useState(null);
    const [elapsedTime, updateElapsedTime] = useState(game == "timedParagraph" ? 0 : (game == "asMuchAsPossible" ? 15 : 2));
    const [charsTyped, updateCharsTyped] = useState(0);
    const [restarted, updateRestarted] = useState(true);
    const [wpm, updateWpm] = useState();
    const [lives, updateLives] = useState(5);
    const [keyCurrentlyDown, updateKeyCurrentlyDown] = useState(false);

    const intervalRef = useRef(null);

    function restart() {
        if (game == "wordRush") {
            updateParagraph(new String(wordBank[Math.floor(Math.random()*wordBank.length)]).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i))
        }
        clearInterval(intervalRef.current);
        updateElapsedTime(game == "timedParagraph" ? 0 : (game == "asMuchAsPossible" ? 15 : 2));
        updateCurrentLetter(0);
        updateCurrentParagraph(0);
        updateCharsTyped(0);
        updateRestarted(true);
        updateWpm();
        updateLives(5);
    }

    useEffect(() => {
        if (game == "asMuchAsPossible" || game == "survival") {
            updateParagraph(new String(paragraphList[currentParagraph % paragraphList.length]).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i));
        }
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
                    updateBestScores([elapsedTime, bestScores[1], bestScores[2], bestScores[3]]);
                }
                updateRestarted(false);
                updateWpm(Math.round(((paragraphList[0].length+paragraphList[1].length)/ 5)/(elapsedTime/60)) + " WPM (approximate)");
            } else if (game == "asMuchAsPossible" || game == "survival") {
                updateCurrentParagraph(currentParagraph + 1);
                updateCurrentLetter(0);
            } else if (game == "wordRush") {
                updateStartingTime(performance.now());
                updateCurrentParagraph(currentParagraph + 1);
                updateParagraph(new String(wordBank[Math.floor(Math.random()*wordBank.length)]).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i));
                updateCurrentLetter(0);
            }
        }
    }, [currentLetter]);
    
    useEffect(() => {
        clearInterval(intervalRef.current);
        if (startingTime && currentParagraph == 0) {
            if (game == "timedParagraph") {
                intervalRef.current = setInterval(() => updateElapsedTime(((performance.now() - startingTime)/1000).toFixed(2)), 10);
            } else if (game == "asMuchAsPossible") {
                intervalRef.current = setInterval(() => updateElapsedTime((15-((performance.now() - startingTime)/1000)).toFixed(2)), 10);
            }
        }
        if (game == "wordRush" && startingTime) {
            intervalRef.current = setInterval(() => updateElapsedTime((2-((performance.now() - startingTime)/1000)).toFixed(2)), 10);
        }
    }, [startingTime]);

    if (game == "asMuchAsPossible") {
        useEffect(() => {
            if (elapsedTime < 0.01) {
                clearInterval(intervalRef.current);
                updateElapsedTime(0);
                if ((charsTyped > bestScores[1]) || !(bestScores[1])) {
                    updateBestScores([bestScores[0], charsTyped, bestScores[2], bestScores[3]]);
                }
                updateRestarted(false);
            }
        }, [elapsedTime]);
    } else if (game == "wordRush") {
        useEffect(() => {
            if (elapsedTime < 0.01) {
                if (currentParagraph > bestScores[2] || !(bestScores[2])) {
                    updateBestScores([bestScores[0], bestScores[1], currentParagraph, bestScores[3]]);
                }
                clearInterval(intervalRef.current);
                updateElapsedTime(0);
                updateRestarted(false);
            }
        }, [elapsedTime])
    }
    
    if (game == "survival") {
        useEffect(() => {
            if (lives == 0) {
                updateRestarted(false);
                if (charsTyped > bestScores[3] || !(bestScores[3])) {
                    updateBestScores([bestScores[0], bestScores[1], bestScores[2], charsTyped]);
                }
            }
        }, [lives]);
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
                width: "fit-content",
                maxWidth: "80%",
                opacity: game == "wordRush" ? Math.round(elapsedTime*50) + "%" : "100%"
            }}>
                {paragraph.map((i, n) => n == currentLetter ? <h2 key={n} className={`${styles.letter} ${styles.currentLetter}`}>{i}</h2> : <h2 key={n} className={`${styles.letter}`}>{i}</h2>)}
            </div>
            {game == "wordRush" || game == "survival" ? <h2 style={{
                opacity: (game == "wordRush" && elapsedTime == 0) || (game == "survival" && lives == 0) ? "100%" : "0%"
            }}>GAME OVER</h2> : null}
            {(game == "customPractice" || game == "wordRush" || game == "survival") ? null : <h2><span className={styles.purpleText}>{elapsedTime}</span> seconds</h2>}
            {game == "asMuchAsPossible" || game == "survival" ? <h2>Characters typed: <span className={styles.purpleText}>{charsTyped}</span></h2> : null}
            {game == "wordRush" ? <h2>Word streak: <span className={styles.purpleText}>{currentParagraph}</span></h2> : null}
            {game == "survival" ? <h2>Lives remaining: <span className={styles.purpleText}>{lives}</span></h2> : null}
            {game == "timedParagraph" ? <h2>{wpm}</h2> : null}
            <button onClick={() => {
                restart();
            }} className={montserrat.className}>Reset</button>
            {game == "timedParagraph" ? <h2 style={{
                opacity: !bestScores[0] ? "0" : "100"
            }}>Your Best Time: <span className={styles.purpleText}>{bestScores[0]}</span> seconds</h2> :
            (game == "asMuchAsPossible" || game == "survival" ? <h2 style={{
                opacity: ((game == "asMuchAsPossible" && !bestScores[1]) || game == "survival" && !bestScores[3]) ? "0" : "100"
            }}>Your Best Score (characters typed): <span className={styles.purpleText}>{game == "asMuchAsPossible" ? bestScores[1] : bestScores[3]}</span> characters</h2> : (game == "wordRush" ?
            <h2 style={{
                opacity: !bestScores[2] ? "0" : "100"
            }}>Your Streak Record: <span className={styles.purpleText}>{bestScores[2]}</span> words</h2>
            : null))}

            <input ref={inputRef} onKeyDown={(e) => {
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
                    } else if (game == "survival") {
                        if (!keyCurrentlyDown && !(["Unidentified", "Shift", "Alt", "AltGraph", "CapsLock", "Control", "Fn", "FnLock", "Hyper", "Meta", "NumLock", "ScrollLock", "Super", "Symbol", "SymbolLock", "Backspace"].includes(e.key))) {
                            updateLives(lives - 1);
                            updateKeyCurrentlyDown(true);
                        }
                    }
                }
            }} onKeyUp={() => updateKeyCurrentlyDown(false)} onBlur={() => inputRef.current.focus()} style={{opacity: "0", width: "0", height: "0", margin: "0", padding: "0"}} />
        </>
    );
}

export default function Tool() {
    const [stage, updateStage] = useState(0);
    const [selectedGame, updateSelectedGame] = useState(null);
    const [bestScores, updateBestScores] = useState();
    const [customText, updateCustomText] = useState();
    
    useEffect(() => {
        if (document.cookie.includes("bestScores")) {
            let myCookie = document.cookie.split("bestScores=")[1].split(",");
            console.log(myCookie);
            updateBestScores([myCookie[0] ? JSON.parse(myCookie[0]) : null, myCookie[1] ? JSON.parse(myCookie[1]) : null, myCookie[2] ? JSON.parse(myCookie[2]) : null]);
        } else {
            updateBestScores([null, null, null]);
        }
    }, [updateBestScores]);

    useEffect(() => {
        if (bestScores) {
            document.cookie = `bestScores=${[bestScores[0], bestScores[1], bestScores[2]]}`;
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
                        <button onClick={() => {updateSelectedGame("wordRush"); updateStage(1);}} className={montserrat.className}>Word Rush</button>
                        <button onClick={() => {updateSelectedGame("survival"); updateStage(1);}} className={montserrat.className}>Survival</button>
                        <button onClick={() => {
                            updateSelectedGame("customPractice");
                            let promptResult = prompt("Type the text you'd like to practice with."); 
                            if (promptResult) {
                                updateCustomText(promptResult);
                                updateStage(1);
                            }}} className={montserrat.className}>Custom Practice</button>
                    </div>

                    <h2 style={{
                        marginTop: "80px"
                    }}>What Are These?</h2>
                    <ul style={{
                        width: "60%",
                        marginLeft: "auto",
                        marginRight: "auto",
                        textAlign: "left"
                    }}>
                        <li><b>Timed Paragraph: </b>Type a paragraph as fast as you can.</li>
                        <li><b>As Much As Possible: </b>Type as much as you can in 15 seconds.</li>
                        <li><b>Word Rush: </b>You have two seconds per word; words are displayed one at a time for you to build your word streak. If you take too long for a word, you lose you streak and the game is over.</li>
                        <li><b>Custom Practice: </b>Choose your own practice text to type untimed!</li>
                    </ul>
                </>
            : <Play game={selectedGame} updateStage={updateStage} bestScores={bestScores} updateBestScores={updateBestScores} customText={customText} />
            }
        </>
    );
}