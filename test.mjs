
import { compareTwoNames, getPronunciation } from './compareNames.mjs';

for (const match of myList) {
    let [name1, name2] = match.split(";");
    const result = compareTwoNames(name1, name2);
    if (result[0] == false){
        let ipa1 = getPronunciation(name1)
        let ipa2 = getPronunciation(name2)
        console.log(name1," AND ", name2)
        console.log(ipa1, " AND ", ipa2)
        console.log(result);
        break;
    }
}