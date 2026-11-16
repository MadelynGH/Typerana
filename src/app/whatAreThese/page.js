import styles from "../../_components/tool.module.css";
import Link from "next/link";

export default function Page() {
    return (
        <>
            <Link className={styles.backButton} href="/Typerana">←</Link>

            <h2 style={{
                marginTop: "80px"
            }}>What Are These?</h2>
            <ul style={{
                width: "60%",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
                lineHeight: "1.7"
            }}>
                <li><b>Timed Paragraph: </b>Type a paragraph as fast as you can.</li>
                <li><b>As Much As Possible: </b>Type as much as you can in 15 seconds.</li>
                <li><b>Word Rush: </b>You have two seconds per word (the word gradually fades away); words are displayed one at a time for you to build your word streak. If you take too long for a word, you lose you streak and the game is over.</li>
                <li><b>Survival: </b>You have five lives. Each mistake costs you a life. Try to survive as many characters as possible!</li>
                <li><b>Memory Mode: </b>You get to see a passage. When you're ready, try to reconstruct it from memory. (This is not timed, nor does it detect your accuracy; it's more of an exercise.)</li>
                <li><b>Case Challenge: </b>Type a sentence, alternating the letters between uppercase and lowercase (starting with uppercase). The sentences are of similar style to those used in Memory Mode. (This is not timed, nor does it detect your accuracy; it's more of an exercise.)</li>
                <li><b>Unscramble: </b>A scrambled-up word will be displayed. Unscramble it by typing the original word! (This is not timed, nor does it detect your accuracy; it's more of an exercise.)</li>
                <li><b>Custom Practice: </b>Choose your own practice text to type untimed!</li>
            </ul>
        </>
    );
}
