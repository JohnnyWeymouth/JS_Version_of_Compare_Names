import { compareTwoNames, getPronunciation, getIpaOfOneWord} from './compareNames.mjs';

let [name1, name2] = ["max lurie", "max a. luria"];
console.log(name1, " AND ", name2);
let result = compareTwoNames(name1, name2);
console.log(result);
