import { negativeWords } from './negativeWords.js';
import { positiveWords } from './positiveWords.js';
import { negations } from './negationWords.js';
import { intensifiers } from './intensifiersWords.js';

function sentimentAnalysis(description) {
    let score = 0;

    let descriptionWords = description.split(/[?!:;,. ]+/)
    const filteredWords = [];

    for (let element of descriptionWords) {
        const lowerCaseElement = element.toLowerCase();
        if (verifyWord(lowerCaseElement)) {
            filteredWords.push(lowerCaseElement);
            continue;
        }
        const simplifiedWord = simplifyWord(lowerCaseElement)
        if (verifyWord(simplifiedWord)) {
            filteredWords.push(simplifiedWord);
        }
    };
    
    let currentNegation = false;

    for (let i = 0; i < filteredWords.length; i++) {
        const currentWord = filteredWords[i];
        let currentScore = 1;

        if (negations.has(currentWord)) {
            currentNegation = true;
            continue;
        }
        if (intensifiers.has(currentWord)) {
            continue;
        }
        if (negativeWords.has(currentWord)) {
            currentScore *= -1;
        }
        if (i > 0 && intensifiers.has(filteredWords[i - 1])) {
            currentScore *= 2;
        }
        if (currentNegation) {
            currentScore *= -1;
            currentNegation = false;
        }
        score += currentScore;
    }
    return score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
}

function verifyWord(word) {
    return negations.has(word) || intensifiers.has(word) || positiveWords.has(word) || negativeWords.has(word);
}

function simplifyWord(word) {
    const commonSuffixes = ["ing", "ed", "en", "s", "er", "est", "ize", "ise", "ify"];
    for (const element of commonSuffixes) {
        if (word.endsWith(element)) {
            return word.substring(0, word.length - element.length);
        }
    }
    return word;
}

export { sentimentAnalysis };