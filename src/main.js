import { compareTwoNames } from './compareNames.js';

// Get the HTML element
const resultElement = document.getElementById('result');

// Call the function and update the element's content
resultElement.innerHTML = compareTwoNames("Johnny C Weymouth", "John weymouth christian");