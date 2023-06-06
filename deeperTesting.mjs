import { compareTwoNames, getPronunciation, getIpaOfOneWord} from './compareNames.mjs';

let [name1, name2] = ["dallie connally","dolly smith connally"];
console.log(name1, " AND ", name2);
let result = compareTwoNames(name1, name2);
console.log(result);
