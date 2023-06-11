const date1 = new Date();
let myList = [];


import { compareTwoNames, getPronunciation, cleanIpaByItself, cleanIpasTogether} from '../compareNames.mjs';

for (const match of myList) {
    let [name1, name2] = match.split(";");
    const result = compareTwoNames(name1, name2);
    if (result[0] == true){
        console.log(name1, name2)
        let ipa1 = getPronunciation(name1);
        let ipa2 = getPronunciation(name2);
        [ipa1, ipa2] = [cleanIpaByItself(ipa1), cleanIpaByItself(ipa2)];
        [ipa1, ipa2] = cleanIpasTogether(ipa1, ipa2);
        console.log(ipa1,ipa2);
        console.log(result);
        break;
    }
}
const date2 = new Date();
const differenceInSeconds = (date2 - date1) / 1000;
console.log(differenceInSeconds);