"use client"
import { useState, useEffect, useRef } from "react";
import styles from "./tool.module.css";
import { Inconsolata, Montserrat } from "next/font/google";
import Link from "next/link";

const inconsolata = Inconsolata({
    weight: ["400"]
});

const montserrat = Montserrat({
    weight: ["400", "500", "600", "700", "800"]
});

function Play({ game, updateStage, bestScores, updateBestScores, customText }) {
    function constructSentence() {
        let adjectives = ["weird", "sticky", "red", "orange", "yellow", "green", "blue", "purple"];
        let nouns = ["car", "chair", "table", "computer", "cat", "dog", "cloud", "picture"];
        let movementVerbs = ["walks", "runs", "skips", "jumps", "hops"];
        return `The ${adjectives[Math.floor(Math.random()*adjectives.length)]} ${nouns[Math.floor(Math.random()*nouns.length)]} ${movementVerbs[Math.floor(Math.random()*movementVerbs.length)]} to the ${adjectives[Math.floor(Math.random()*adjectives.length)]} ${nouns[Math.floor(Math.random()*nouns.length)]} and says, "You are ${adjectives[Math.floor(Math.random()*adjectives.length)]}."`;
    }
    function scrambleWord(wordArray) {
        let wordArrayCopy = wordArray.slice();
        let scrambled = "";
        for (let i of wordArray) {
            let chosenLetterIndex = Math.floor(Math.random()*wordArrayCopy.length);
            scrambled = scrambled.concat(wordArrayCopy[chosenLetterIndex]);
            wordArrayCopy.splice(chosenLetterIndex, 1);
        };

        if (JSON.stringify(scrambled.split("")) != JSON.stringify(wordArray)) {
            return scrambled;
        } else {
            scrambleWord(wordArray);
        }
    }
    const [currentParagraph, updateCurrentParagraph] = useState(0);
    let paragraphList = ["The quick brown fox jumps over the lazy dog.", "The five boxing wizards jump quickly."];
    let combinedParagraphList = "";
    paragraphList.forEach((i, n) => {
        combinedParagraphList = combinedParagraphList.concat(n > 0 ? " " : "", i);
    });
    let wordBank = ["the", "wait", "fox", "dog", "hello", "chair", "table", "bracket", "cat", "what", "laptop", "computer", "paragraph", "decent", "recent", "blah"];
    const [paragraph, updateParagraph] = useState((game == "asMuchAsPossible" || game == "survival" ? new String(paragraphList[0]) : (game == "timedParagraph" ? new String(combinedParagraphList) : (game == "customPractice" ? new String(customText) : (game == "wordRush" ? new String(wordBank[Math.floor(Math.random()*wordBank.length)]) : (game == "memory" ? constructSentence() : (game == "caseChallenge" ? constructSentence().toLowerCase() : wordBank[Math.floor(Math.random()*wordBank.length)])))))).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i));
    const [scrambledParagraph, updateScrambledParagraph] = useState(scrambleWord(paragraph));
    const [currentLetter, updateCurrentLetter] = useState(game == "memory" ? -1 : 0);
    const inputRef = useRef(null);
    const [startingTime, updateStartingTime] = useState(null);
    const [elapsedTime, updateElapsedTime] = useState(game == "timedParagraph" ? 0 : (game == "asMuchAsPossible" ? 15 : 2));
    const [charsTyped, updateCharsTyped] = useState(0);
    const [restarted, updateRestarted] = useState(game == "memory" ? false : true);
    const [wpm, updateWpm] = useState();
    const [lives, updateLives] = useState(5);
    const [keyCurrentlyDown, updateKeyCurrentlyDown] = useState(false);
    const [memoryStage, updateMemoryStage] = useState(0);
    const [nextRequiredCase, updateNextRequiredCase] = useState(1);
    let myI = 0;
    const [casedParagraph, updateCasedParagraph] = useState(paragraph.map((i) => {
        if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(i)) {
            myI ++;
            return (myI-1) % 2 == 0 ? i.toUpperCase() : i.toLowerCase();
        } else {
            return i;
        }
    }));

    const intervalRef = useRef(null);

    function restart() {
        let soonToBeParagraph;
        if (game == "wordRush") {
            soonToBeParagraph = new String(wordBank[Math.floor(Math.random()*wordBank.length)]).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i);
            updateParagraph(soonToBeParagraph);
        } else if (game == "memory" || game == "caseChallenge") {
            soonToBeParagraph = (game == "memory" ? constructSentence() : constructSentence().toLowerCase()).split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i);
            updateParagraph(soonToBeParagraph);
        } else if (game == "unscramble") {
            soonToBeParagraph = wordBank[Math.floor(Math.random()*wordBank.length)].split("").map(i => i == " " ? <span className="space">&nbsp;</span> : i);
            updateParagraph(soonToBeParagraph);
            updateScrambledParagraph(scrambleWord(soonToBeParagraph));
        }
        clearInterval(intervalRef.current);
        updateElapsedTime(game == "timedParagraph" ? 0 : (game == "asMuchAsPossible" ? 15 : 2));
        updateCurrentLetter(game == "memory" ? -1 : 0);
        updateCurrentParagraph(0);
        updateCharsTyped(0);
        updateRestarted(true);
        updateWpm();
        updateLives(5);
        updateMemoryStage(0);
        myI = 0;
        if (game == "caseChallenge") {
            updateCasedParagraph(soonToBeParagraph.map((i) => {
            if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(i)) {
                myI ++;
                return (myI-1) % 2 == 0 ? i.toUpperCase() : i.toLowerCase();
            } else {
                return i;
            }
        }));
        }
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
            if ((charsTyped > bestScores[1]) || !(bestScores[1])) {
                updateBestScores([bestScores[0], charsTyped, bestScores[2], bestScores[3]]);
            }
            if (elapsedTime < 0.01) {
                clearInterval(intervalRef.current);
                updateElapsedTime(0);
                updateRestarted(false);
            }
        }, [elapsedTime]);
    } else if (game == "wordRush") {
        useEffect(() => {
            if (currentParagraph > bestScores[2] || !(bestScores[2])) {
                updateBestScores([bestScores[0], bestScores[1], currentParagraph, bestScores[3]]);
            }
            if (elapsedTime < 0.01) {
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
            }
        }, [lives]);

        useEffect(() => {
            if (charsTyped > bestScores[3] || !(bestScores[3])) {
                updateBestScores([bestScores[0], bestScores[1], bestScores[2], charsTyped]);
            }
        }, [charsTyped]);
    }

    return (
        <>
            <button onClick={() => updateStage(0)} className={styles.backButton}>←</button>

            <h2>{game == "timedParagraph" ? "Timed Paragraph" : (game == "asMuchAsPossible" ? "As Much As Possible" : (game == "wordRush" ? "Word Rush" : (game == "survival" ? "Survival" : (game == "customPractice" ? "Custom Practice" : (game == "memory" ? "Memory Mode" : (game == "caseChallenge" ? "Case Challenge" : "Unscramble"))))))}</h2>

            {game == "unscramble" ? <h3>{scrambledParagraph}</h3> : null}

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
                {paragraph.map((i, n) => n == currentLetter ? <h2 key={n} className={`${styles.letter} ${styles.currentLetter}`} style={{
                    color: (memoryStage == 1 || game == "unscramble") ? "transparent" : "inherit",
                    opacity: game != "caseChallenge" ? "100%" : "50%"
                }}>{i}</h2> : <h2 key={n} className={`${styles.letter}`} style={{
                    color: ((memoryStage == 1 || game == "unscramble") && currentLetter <= n) ? "transparent" : "inherit",
                    opacity: game != "caseChallenge" ? "100%" : (currentLetter > n) ? "100%" : "50%"
                }}>{game == "caseChallenge" && currentLetter > n ? casedParagraph[n] : i}</h2>)}
            </div>
            {game == "wordRush" || game == "survival" ? <h2 style={{
                opacity: (game == "wordRush" && elapsedTime == 0) || (game == "survival" && lives == 0) ? "100%" : "0%"
            }}>GAME OVER</h2> : null}
            {(game == "customPractice" || game == "wordRush" || game == "survival" || game == "memory" || game == "caseChallenge" || game == "unscramble") ? null : <h2><span className={styles.purpleText}>{elapsedTime}</span> seconds</h2>}
            {game == "asMuchAsPossible" || game == "survival" ? <h2>Characters typed: <span className={styles.purpleText}>{charsTyped}</span></h2> : null}
            {game == "wordRush" ? <h2>Word streak: <span className={styles.purpleText}>{currentParagraph}</span></h2> : null}
            {game == "survival" ? <h2>Lives remaining: <span className={styles.purpleText}>{lives}</span></h2> : null}
            {game == "timedParagraph" ? <h2>{wpm}</h2> : null}
            {game == "memory" && memoryStage == 0 ? <button onClick={() => {
                updateCurrentLetter(0);
                updateRestarted(true);
                updateMemoryStage(1);
            }} className={montserrat.className}>I'm Ready</button> : null}
            {!(game == "memory" && memoryStage == 0) ? <button onClick={() => {
                restart();
            }} className={montserrat.className}>Reset</button> : null}
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
                if (restarted && paragraph[currentLetter]) {
                    if ((paragraph[currentLetter].type == "span")) {
                        if (paragraph[currentLetter].props.className == "space") {
                            if ((e.key == " ")) {
                                updateCurrentLetter(currentLetter + 1);
                            } else if (!keyCurrentlyDown && !(["Unidentified", "Shift", "Alt", "AltGraph", "CapsLock", "Control", "Fn", "FnLock", "Hyper", "Meta", "NumLock", "ScrollLock", "Super", "Symbol", "SymbolLock", "Backspace"].includes(e.key))) {
                                updateLives(lives - 1);
                                updateKeyCurrentlyDown(true);
                            }
                        }
                    } else if (!(paragraph[currentLetter].type == "span") && ((game != "caseChallenge" && e.key == paragraph[currentLetter]) || (e.key == casedParagraph[currentLetter]))) {
                        e.key != " " ? updateNextRequiredCase((nextRequiredCase + 1) % 2) : null;
                        if ((currentLetter == 0) && ((game == "timedParagraph") || (currentParagraph == 0))) {
                            updateStartingTime(performance.now());
                        }
                        updateCurrentLetter(currentLetter + 1);
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
            updateBestScores([myCookie[0] ? JSON.parse(myCookie[0]) : null, myCookie[1] ? JSON.parse(myCookie[1]) : null, myCookie[2] ? JSON.parse(myCookie[2]) : null, myCookie[3] ? JSON.parse(myCookie[3]) : null]);
        } else {
            updateBestScores([null, null, null, null]);
        }
    }, [updateBestScores]);

    useEffect(() => {
        if (bestScores) {
            document.cookie = `bestScores=${[bestScores[0], bestScores[1], bestScores[2], bestScores[3]]}`;
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
                        <button onClick={() => {updateSelectedGame("memory"); updateStage(1);}} className={montserrat.className}>Memory Mode</button>
                        <button onClick={() => {updateSelectedGame("caseChallenge"); updateStage(1);}} className={montserrat.className}>Case Challenge</button>
                        <button onClick={() => {updateSelectedGame("unscramble"); updateStage(1);}} className={montserrat.className}>Unscramble</button>
                        <button onClick={() => {
                            updateSelectedGame("customPractice");
                            let promptResult = prompt("Type the text you'd like to practice with."); 
                            if (promptResult) {
                                updateCustomText(promptResult);
                                updateStage(1);
                            }}} className={montserrat.className}>Custom Practice</button>
                    </div>
                    <Link href="./whatAreThese" style={{
                        display: "inline-block",
                        marginTop: "50px",
                        fontSize: "1.2em",
                        color: "black",
                        textDecoration: "none",
                        borderBottom: "1.5px solid black",
                        fontWeight: "450"
                    }}>What Are These?</Link>
                </>
            : <Play game={selectedGame} updateStage={updateStage} bestScores={bestScores} updateBestScores={updateBestScores} customText={customText} />
            }
        </>
    );
}