import fs from 'fs';
import {partial_ratio, ratio} from 'fuzzball';
import unidecode from 'unidecode';
const surnamesList = JSON.parse(fs.readFileSync('_top_surnames.json'));
const ipa_one_syllable = JSON.parse(fs.readFileSync('_ipa_one_syllable.json'));
const ipa_all_names = JSON.parse(fs.readFileSync('_ipa_all_names.json'));





export function compareTwoNames(full_name1, full_name2) {
  var generic_name, name_too_short, names_match, reasoning, word_combo;
  full_name1 = cleanNameByItself(full_name1);
  full_name2 = cleanNameByItself(full_name2);
  [full_name1, full_name2] = cleanNamesTogether(full_name1, full_name2);
  [name_too_short, word_combo] = eitherNameTooShort(full_name1, full_name2);

  if (name_too_short) {
    reasoning = -2;
    return [false, reasoning, word_combo];
  }

  generic_name = isGenericName(full_name1, full_name2);
  [names_match, word_combo] = spellingComparison(full_name1, full_name2);

  if (names_match) {
    if (generic_name) {
      reasoning = 0;
      return [false, reasoning, word_combo];
    } else {
      reasoning = 1;
      return [true, reasoning, word_combo];
    }
  }

  [names_match, word_combo] = pronunciationComparison(full_name1, full_name2, word_combo);

  if (names_match) {
    if (generic_name) {
      reasoning = 0;
      return [false, reasoning, word_combo];
    } else {
      reasoning = 2;
      return [true, reasoning, word_combo];
    }
  } else {
    reasoning = -1;
    return [false, reasoning, word_combo];
  }
}




















function cleanNameByItself(name) {
  if (name === "") {
      return "";
  }
  name = name.toLowerCase(); // Makes all letters lowercase
  name = name.replace(/ +/g, ' '); // Removes double spaces
  if (name.slice(-1) === ' ') { // Removes space at end
      name = name.slice(0, -1);
  }
  if (name[0] === ' ') { // Removes space at beginning
      name = name.slice(1);
  }
  name = unidecode(name); // standardizes name into english alphabet
  name = name.replace(/[.,?;!"'*]/g, ''); // Removes Punctuation
  name = name.replace(/-/g, ' '); // Replaces "-" with " "
  name = name.replace(/\bjr\b/g, "").replace(/\bjunior\b/g, ''); // Removes jr
  name = name.replace(/\bsr\b/g, "").replace(/\bsenior\b/g, ''); // Removes sr
  name = name.replace(/\bprof\b/g, '').replace(/\bprofessor\b/g, ''); // Removes professor
  name = name.replace(/\bmr\b/g, '').replace(/\bmister\b/g, ''); // Removes mister
  name = name.replace(/\bmrs\b/g, '').replace(/\bmissus\b/g, ''); // Removes missus
  name = name.replace(/\bms\b/, '').replace(/\bmiss\b/g, ''); // Removes missus
  name = name.replace(/\bdr\b/, '').replace(/\bdoctor\b/g, ''); // Removes doctor
  name = name.replace(/\bstudent\b/g, ''); // Removes student
  name = name.replace(/\bsister\b/g, ''); // Removes sister
  name = name.replace(/\bbrother\b/g, ''); // Removes brother
  name = name.replace(/\bmother\b/g, ''); // Removes mother
  name = name.replace(/\bfather\b/g, ''); // Removes father
  name = name.replace(/ in law/g, ' '); // Removes in law
  name = name.replace(/ +/g, ' '); // Removes more than one space
  name = name.replace(/[1-9][a-z]{2,6}/g, '').replace(/ the /g, ''); // Removes stuff like "the 3rd"
  name = name.replace(/no suffix/g, ''); // Removes "no suffix"
  name = name.replace(/ rev$/, ''); // Removes " rev" at the end
  name = name.replace(/^rev /, ''); // Removes "rev " at the beginning
  name = name.replace(/reverend/g, ''); // Removes "reverend" everywhere
  name = name.replace(/head of household/g, ''); // Removes "head of household"
  name = name.replace(/ mc /g, ' mc'); // Removes spaces between mc last names
  name = name.replace(/^mc /, 'mc');
  name = name.replace(/ mac /g, ' mac'); // Removes spaces between mac last names
  name = name.replace(/^mac /, 'mac');
  name = name.replace(' van den ', ' vanden ');
  name = name.replace(/ vander /g, ' vander'); // Removes spaces between vander last names
  name = name.replace(/^vander /, 'vander');
  name = name.replace(/ del /g, ' de '); // Bandaid fix
  name = name.replace(/ +/g, ' '); // Removes more than one space
  name = name.trim(); //Removes extra space at beginning and at end
  return name;
}




















function cleanNamesTogether(fullName1, fullName2) {
  // Returns if either name is blank
  if (fullName1 === "" || fullName2 === "") {
      return [fullName1, fullName2];
  }

  // Add space
  fullName1 = fullName1 + " ";
  fullName2 = fullName2 + " ";

  // Fix when records are indexed with " or " in the name
  [fullName1, fullName2] = removeOrInNames(fullName1, fullName2);

  // Replaces ie endings with y endings
  fullName1 = fullName1.replace("ie ", "y ");
  fullName2 = fullName2.replace("ie ", "y ");

  // Replace nicknames with the standard name
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "abram", "abraham");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "burt", "albert");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "alby", "albert");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "abby", "abigail");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "aggy", "agnes");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "alexander", "alex");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "antoine", "anthony");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "auston", "austen");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "andy", "andrew");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bagg", "bogue");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "berty", "bert");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "berny", "bernard");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bruine", "brown");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "corl", "carl");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "carle", "carlo");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "carl", "carlo");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "callidge", "coolidge");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "claire", "clara");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "chas", "charles");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "chuck", "charles");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "koch", "cox");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "xper", "christopher");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "xr", "christopher");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "danil", "daniel");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "deitz", "dietz");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "diel", "dill");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "dietrich", "deatrick");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "emilo", "emile");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "edythe", "edith");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "erle", "earl");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "erle", "earle");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "irl", "earl");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "irl", "earle");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "irwind", "erwin");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "irwin", "erwin");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "evert", "everette");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "evert", "everett");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "evert", "everet");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "evert", "evret");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "dally", "dolly");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "dorothea", "dorothy");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "dorotha", "dorothea");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "freer", "freier");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "francois", "frank");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "francis", "frank");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "frances", "frank");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "friedrich", "fred");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "fritz", "fred");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "frederich", "frederic");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "friedrich", "frederick");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "fritz", "frederick");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "fritz", "friedrich");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "firts","frits");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "geo", "george");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "gorge", "george");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "geroge", "george");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "geo", "geroge");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "gerty", "gertrude");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jule", "julia");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "july", "julia");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "julia", "giuliana");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "trudy", "gertrude");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "hass", "haas");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "harl", "harold");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "harry", "harold");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "harry", "henry");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "harry", "henri");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "hatty", "harriett");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "hatty", "harriet");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "heinrich", "henry");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "hank", "henry");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "heinrichs", "heinricks");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "heinrich", "heinrick");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "holy", "holly");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "isb", "isabella");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "isb", "isabelle");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "inza", "inga");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ira", "irene");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "issac", "isaac");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "izaak", "isaac");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "isac", "isaac");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jas", "james");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jack", "jacob");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jerimah", "jeremiah");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jeremonah", "jeremiah");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jean", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jean", "johnny");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jack", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "johnny", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "johannes", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "johanne", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "johann", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "johan", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "hans", "john");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "joseph", "joe");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "joseph", "jose");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "joseh", "joseph");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "josy", "josephine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "josh", "josiah");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jimmae", "jimmy");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "jro", "jerome");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "juddy", "judy");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "julia", "juliette");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "julia", "juliet");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "julio", "julius");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "kit", "christopher");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "kit", "catherine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "kit", "Katherine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "kit", "Katharine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "kate", "katherine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "katharine", "katherine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "kath", "katherine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "katy", "katherine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "kruscher", "kreischer");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "leo", "leon");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "leonhard", "leonard");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "llyod", "lloyd");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "louis", "lewis");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "luis", "louis");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "lewis", "louisa");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "louis", "louisa");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "louise", "louisa");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "lk", "luke");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "luca", "lucy");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ma", "maria");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "mary", "maria");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "molly", "mary");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "mary", "marin");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "mab", "mabel");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "matty", "martha");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "mat", "martha");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "masson", "mason");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "matty", "matilda");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "madge", "margaret");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "maggy", "margaret");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "marguerite", "margaret");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "marguerite", "marjory");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "maggy", "magdalena");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "maggy", "magnolia");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "maher", "maire");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "mary", "miriam");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "micheal", "michell");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "michalsen", "michaelson");  
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "polly", "mary");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "marty", "martin");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "matt", "matthew");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "matt", "mathew");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "mgy", "margery");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nickolaus", "nicholas");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nicholis", "nicholas");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nicols", "nicholas");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ellen", "eleanor");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ellen", "eleanore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ellen", "eleanora");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nora", "eleanor");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nora", "eleanore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "eleanor", "eleanora");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nora", "eleanora");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nora", "elinore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "nell", "eleanore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "lenora", "eleanore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "lenora", "elinore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "lenora", "elinor");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "lenora", "elinor");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "olly", "olive");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "oskar", "oscar");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "pierre", "peter");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "pyotr", "peter");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "piere", "peter");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "philippe", "philip");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ramsey", "romsay");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ross", "rose");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ridenner", "ridenour");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "ridener", "ridenour");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "rider", "rieder");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "dick", "richard");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "rager", "roger");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "rolin", "ryland");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bob", "robert");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bobby", "robert");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bob", "rob");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bobby", "rob");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bob", "rbt");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bobby", "rbt");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bob", "rb");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bobby", "rb");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "rb", "robert");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "rbt", "robert");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "sal", "sarah");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "sally", "sarah");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "sal", "sara");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "sally", "sara");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "samul", "samuel");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "saint", "st");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "theo", "theodor");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "theo", "theodore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "theodre", "theodore");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "thos", "thomas");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "thomis", "thomas");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "thomis", "tom");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "thos", "tom");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "valentin", "valentine");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "waller", "walter");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wese", "wise");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wese", "weise");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "mena", "mina");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wilhemina", "wilhelmina");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "minny", "wilhelmina");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "williard", "willard");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "williard", "wilard");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wm", "william");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "willlam", "william");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wilhelm", "william");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "willis", "wilhelm");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wm", "wilhelm");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wm", "willis");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "bill", "william");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "billy", "william");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "wise", "weiss");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoy", "zoey");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoe", "zoey");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoy", "zowy");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoe", "zowy");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoey", "zoja");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoy", "zoja");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zowy", "zoja");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoe", "zoja");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoya", "zoja");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoey", "zoya");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoy", "zoya");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zowy", "zoya");
  [fullName1, fullName2] = cleanAwayNickname(fullName1, fullName2, "zoe", "zoya");

  // Remove articles
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "de");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "la");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "le");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "du");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "dela");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "los");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "der");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "den");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "von");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "vanden");
  [fullName1, fullName2] = removeArticles(fullName1, fullName2, "van");

  // Take care of weird spellings by comparing to the other name
  [fullName1, fullName2] = fixBothNamesSpellingWithRegex(fullName1, fullName2, "ij\\b", "y\\b", "y ");
  [fullName1, fullName2] = fixBothNamesSpellingWithRegex(fullName1, fullName2, "ow", "au", "au");
  [fullName1, fullName2] = fixBothNamesSpellingWithRegex(fullName1, fullName2, "owlk", "olk", "olk");

  var consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
  var all_letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "c", "cc", all_letters, all_letters);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "c", "s", ['t'], ['h']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "y", "ey", consonants, ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "i", "y", consonants, ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "i", "e", ['g'], ['n']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ce", "sa", consonants, consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ou", "oe", consonants, consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "a", "o", ['n'], ['n']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "a", "ai", consonants, ['th-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "a", "ay", consonants, consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ron", "an", ['f'], ['t']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "sc", "s", ['-'], ['h']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "s", "z", ['t'], ['e']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "e", "z", ['s'], ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "s", "c", ['a'], ['e']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ee", "ea", ['-r'], ['d-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "a", "e", ['h'], ['lm']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "a", "e", ['r'], ['n-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "a", "ai", ['b'], ['t']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "tt", "d", ['a'], ['el']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "tt", "dd", ['a'], ['el']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "le", "el", consonants, ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "asure", "azer", consonants, ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "toun", "town", ['-'], consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ee", "y", consonants, ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "k", "c", ['-'], ['oh']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "d", "t", ['r'], ['el']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "kow", "cow", consonants, ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "kow", "cowe", consonants, ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ole", "ol", ["-"], consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ole", "ol", consonants, consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ow", "ou", consonants, consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "oo", "oa", consonants, ['r']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ue", "uc", consonants, ['k']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ue", "e", consonants, ['w']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ri", "e", ['f'], ['d']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "o", "a", consonants, ['n-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ch", "ck", ['a'], ['s']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "chs", "xe", ['a'], ['-']);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "ae", "aa", consonants, consonants);
  [fullName1, fullName2] = replaceSubstringSandwichMiddleIfMatchingBread(fullName1, fullName2, "u", "oo", ['l'], ['s']);

  //Remove extra spaces
  fullName1 = fullName1.trim();
  fullName2 = fullName2.trim();
  fullName1 = fullName1.replace(/ +/g, " ");
  fullName2 = fullName2.replace(/ +/g, " ");

  // Finally, return
  return [fullName1, fullName2];
}




















function removeOrInNames(name1, name2) {
  name1 = name1.toLowerCase();
  name2 = name2.toLowerCase();

  if (name1.includes(" or ") && name2.includes(" or ")) {
    return [name1, name2];
  } else if (name1.includes(" or ")) {
    const name1_edited_A = name1.replace(/[a-z]+ or /g, " ");
    const word_combo_A = findWhichWordsMatchAndHowWell(name1_edited_A, name2);
    const average_score_A = word_combo_A.reduce((sum, tup) => sum + tup[2], 0) / word_combo_A.length;

    const name1_edited_B = name1.replace(/ or [a-z]+/g, " ");
    const word_combo_B = findWhichWordsMatchAndHowWell(name1_edited_B, name2);
    const average_score_B = word_combo_B.reduce((sum, tup) => sum + tup[2], 0) / word_combo_B.length;

    if (average_score_A >= average_score_B) {
      return [name1_edited_A, name2];
    } else {
      return [name1_edited_B, name2];
    }
  } else if (name2.includes(" or ")) {
    const name2_edited_A = name2.replace(/[a-z]+ or /g, " ");
    const word_combo_A = findWhichWordsMatchAndHowWell(name2_edited_A, name1);
    const average_score_A = word_combo_A.reduce((sum, tup) => sum + tup[2], 0) / word_combo_A.length;

    const name2_edited_B = name2.replace(/ or [a-z]+/g, " ");
    const word_combo_B = findWhichWordsMatchAndHowWell(name2_edited_B, name1);
    const average_score_B = word_combo_B.reduce((sum, tup) => sum + tup[2], 0) / word_combo_B.length;

    if (average_score_A >= average_score_B) {
      return [name1, name2_edited_A];
    } else {
      return [name1, name2_edited_B];
    }
  }

  // Return the original names if no edits were made
  return [name1, name2];
}




















function findWhichWordsMatchAndHowWell(name1, name2) {
  // Split strings into lists of words
  let words1 = name1.split(' ');
  let words2 = name2.split(' ');

  // Initialize empty list to store scores
  let scores = [];

  // Loops through each word in words1 and compare to each word in words2
  for (let i = 0; i < words1.length; i++) {
    let word1 = words1[i];
    for (let j = 0; j < words2.length; j++) {
      let word2 = words2[j];
      
      // Gets the score for how well the words match by using fuzz.partial_ratio
      let score = partial_ratio(word1, word2);

      // Unless word1 or word2 is only an initial, 
      if (word1.length === 1 || word2.length === 1) {
        // If the initial matches the first letter of the other word, give it a perfect score
        if (word1[0] === word2[0]) {
          score = 100;
        } else {
          // Otherwise the score is 0
          score = 0;
        }
      }

      // Add the score to scores
      scores.push([`${i} words1`, `${j} words2`, score]);
    }
  }

  // Gets the length of the shortest word
  let min_length = Math.min(words1.length, words2.length);

  // Generate all combinations of tuples with length equal to the number of words in string2
  let valid_combinations = generateCombinations(scores, min_length)
  
  // Cleans the valid combinations
  let cleaned_valid_combinations = [];
  for (let valid_combo of valid_combinations) {
    let cleaned_valid_combo = [];
    for (let tup of valid_combo) {
      let cleaned_tup = [tup[0].replace(' words1', '').replace(' words2', ''), tup[1].replace(' words1', '').replace(' words2', ''), tup[2]];
      cleaned_valid_combo.push(cleaned_tup);
    }
    cleaned_valid_combinations.push(cleaned_valid_combo);
  }

  // Find the combination(s) with the maximum sum
  let max_sum = cleaned_valid_combinations.reduce((max, combo) => {
    let sum = combo.reduce((acc, y) => acc + y[2], 0);
    return Math.max(max, sum);
  }, 0);
  
  let max_combinations = cleaned_valid_combinations.filter(combo => combo.reduce((acc, y) => acc + y[2], 0) === max_sum);

  // Assigns the max score combination with the most letters to be best_combo
  let best_combo = [];
  let max_letter_count = 0;
  for (let combo of max_combinations) {
    let letter_count = 0;
    for (let tup of combo) {
      let [x, y, z] = [parseInt(tup[0]), parseInt(tup[1]), tup[2]];
      letter_count += words1[x].length + words2[y].length;
    }
    if (letter_count > max_letter_count) {
      max_letter_count = letter_count;
      best_combo = combo;
    }
  }

  // Returns the combination of word matches that are the closest match
  return best_combo;
}




















function generateCombinations(scores, n) {
  const combinations = [];

  function backtrack(combination, start) {
    if (combination.length === n) {
      combinations.push([...combination]);
      return;
    }

    for (let i = start; i < scores.length; i++) {
      const [word1, word2, score] = scores[i];
      const hasDuplicate = combination.some(([prevWord1, prevWord2]) => prevWord1 === word1 || prevWord2 === word2);
      
      if (!hasDuplicate) {
        combination.push([word1, word2, score]);
        backtrack(combination, i + 1);
        combination.pop();
      }
    }
  }

  backtrack([], 0);
  return combinations;
}




















function cleanAwayNickname(fullName1, fullName2, nickname, standard_version) {
  fullName1 = fullName1.toLowerCase()
  fullName2 = fullName2.toLowerCase()
  const standard_in_one = new RegExp("\\b" + standard_version + "\\b", "i").test(fullName1);
  const standard_in_two = new RegExp("\\b" + standard_version + "\\b", "i").test(fullName2);
  const nickname_in_one = new RegExp("\\b" + nickname + "\\b", "i").test(fullName1);
  const nickname_in_two = new RegExp("\\b" + nickname + "\\b", "i").test(fullName2);

  if (standard_in_one && nickname_in_two && !nickname_in_one) {
    fullName2 = fullName2.replace(new RegExp("\\b" + nickname + "\\b", "gi"), standard_version);
  }
  if (standard_in_two && nickname_in_one && !nickname_in_two) {
    fullName1 = fullName1.replace(new RegExp("\\b" + nickname + "\\b", "gi"), standard_version);
  }

  return [fullName1, fullName2];
}




















function removeArticles(name1, name2, article) {
  let name1_edited = name1;
  let name2_edited = name2;
  const article_surrounded_by_space = ` ${article} `;
  const article_with_beginning_space = ` ${article}`;

  if (name1_edited.includes(article_surrounded_by_space) && name2_edited.includes(article_surrounded_by_space)) {
    // Both names contain the article surrounded by spaces
  } else if (name1_edited.includes(article_surrounded_by_space) && name2_edited.includes(article_with_beginning_space)) {
    name1_edited = name1_edited.replace(article_surrounded_by_space, article_with_beginning_space);
  } else if (name1_edited.includes(article_with_beginning_space) && name2_edited.includes(article_surrounded_by_space)) {
    name2_edited = name2_edited.replace(article_surrounded_by_space, article_with_beginning_space);
  }

  name1_edited = name1_edited.replace(new RegExp(article_surrounded_by_space, "g"), " ");
  name2_edited = name2_edited.replace(new RegExp(article_surrounded_by_space, "g"), " ");
  name1_edited = name1_edited.replace(/ +/g, " "); // Removes more than one space
  name2_edited = name2_edited.replace(/ +/g, " "); // Removes more than one space

  if (name1 === name1_edited && name2 === name2_edited) {
    // No edits were made, return names without articles
    return [name1.replace(article_surrounded_by_space, " "), name2.replace(article_surrounded_by_space, " ")];
  }

  // Edits were made, check if the edits were beneficial to the score
  const scores_original_names = findWhichWordsMatchAndHowWell(
    name1.replace(article_surrounded_by_space, " "),
    name2.replace(article_surrounded_by_space, " ")
  );
  const average_score_original_names = scores_original_names.reduce((sum, tup) => sum + tup[2], 0) / scores_original_names.length;

  const scores_edited_names = findWhichWordsMatchAndHowWell(name1_edited, name2_edited);
  const average_score_edited_names = scores_edited_names.reduce((sum, tup) => sum + tup[2], 0) / scores_edited_names.length;

  if (average_score_original_names <= average_score_edited_names) {
    // Edits were beneficial to the score, return the edited names
    return [name1_edited, name2_edited];
  }

  // Otherwise, return names without articles
  return [name1.replace(article_surrounded_by_space, " "), name2.replace(article_surrounded_by_space, " ")];
}




















function fixBothNamesSpellingWithRegex(name1, name2, regexToReplace, regexPresentInOtherWord, replacement) {
  // Finds if the regex statements are within the names
  const regexToReplaceInName1 = new RegExp(regexToReplace).test(name1);
  const regexToKeepInName1 = new RegExp(regexPresentInOtherWord).test(name1);
  const regexToReplaceInName2 = new RegExp(regexToReplace).test(name2);
  const regexToKeepInName2 = new RegExp(regexPresentInOtherWord).test(name2);

  // Replaces if and only if the one statement is within one, and the other is within the other
  if (regexToReplaceInName1 && regexToKeepInName2 && !regexToKeepInName1 && !regexToReplaceInName2) {
    name1 = name1.replace(new RegExp(regexToReplace, "g"), replacement);
  }
  if (regexToReplaceInName2 && regexToKeepInName1 && !regexToKeepInName2 && !regexToReplaceInName1) {
    name2 = name2.replace(new RegExp(regexToReplace, "g"), replacement);
  }

  // Cleans up space
  if (name1.endsWith(" ")) {
    name1 = name1.slice(0, -1); // Removes space at the end
  }
  if (name1.startsWith(" ")) {
    name1 = name1.substring(1); // Removes space at the beginning
  }
  if (name2.endsWith(" ")) {
    name2 = name2.slice(0, -1); // Removes space at the end
  }
  if (name2.startsWith(" ")) {
    name2 = name2.substring(1); // Removes space at the beginning
  }
  name1 = name1.replace(/ +/g, " "); // Removes more than one space
  name2 = name2.replace(/ +/g, " "); // Removes more than one space

  // Returns the names with the spellings now fixed
  return [name1, name2];
}




















function replaceSubstringSandwichMiddleIfMatchingBread(string1, string2, middle_option_1, middle_option_2, bread_1, bread_2) {
  if ((!string1.includes(middle_option_1) && !string1.includes(middle_option_2)) || (!string2.includes(middle_option_1) && !string2.includes(middle_option_2))) {
      return [string1, string2];
  }

  var word_combo = findWhichWordsMatchAndHowWell(string1, string2);
  var final_string_1 = string1.split(" ");
  var final_string_2 = string2.split(" ");

  for (var match of word_combo) {
      var match_index_string1 = parseInt(match[0]);
      var match_index_string2 = parseInt(match[1]);
      var word_in_string1 = final_string_1[match_index_string1];
      var word_in_string2 = final_string_2[match_index_string2];

      word_in_string1 = "-" + word_in_string1 + "-";
      word_in_string2 = "-" + word_in_string2 + "-";

      var vowels_regex = "(" + middle_option_1 + "|" + middle_option_2 + ")";

      for (var i = 0; i < bread_1.length; i++) {
          var cons1 = bread_1[i];
          if (!word_in_string1.includes(cons1) || !word_in_string2.includes(cons1)) {
              continue;
          }
          for (var j = 0; j < bread_2.length; j++) {
              var cons2 = bread_2[j];
              if (!word_in_string1.includes(cons2) || !word_in_string2.includes(cons2)) {
                  continue;
              }

              var regex_to_find = cons1 + vowels_regex + cons2;
              var results1 = word_in_string1.match(regex_to_find);
              var results2 = word_in_string2.match(regex_to_find);
              if (!results1 || !results2) {
                  continue;
              }
              var spanA1 = results1.index;
              var spanB1 = spanA1 + results1[0].length;
              var spanA2 = results2.index;
              var spanB2 = spanA2 + results2[0].length;
              if (Math.abs(spanA1 - spanA2) <= 2 && Math.abs(spanB1 - spanB2) <= 2) {
                  if (results1[0] !== results2[0]) {
                      word_in_string1 = word_in_string1.replace(results1[0], results2[0]);
                  }
              }
          }
      }

      word_in_string1 = word_in_string1.replace(/-/g, "");
      word_in_string2 = word_in_string2.replace(/-/g, "");

      final_string_1[match_index_string1] = word_in_string1;
      final_string_2[match_index_string2] = word_in_string2;
  }

  return [final_string_1.join(" "), final_string_2.join(" ")];
}




















function eitherNameTooShort(name1, name2) {
  // Finds the length of the shortest of the two words
  var combo = findWhichWordsMatchAndHowWell(name1, name2);
  var shortestWordCount = combo.length;

  // Rejects if either name is less than two words in length
  if (shortestWordCount < 2) {
    return [true, combo];
  } else {
    return [false, combo];
  }
}




















function isGenericName(name1, name2) {
  // Finds the length of the shortest of the two words
  const combo = findWhichWordsMatchAndHowWell(name1, name2);
  const shortestWordCount = combo.length;

  // If both last names are very rare, returns false
  if (hasRareSurname(name1) && hasRareSurname(name2)) {
    return false;
  }

  // Checks if the initials between the two names makes a match too uncertain
  const name1Words = name1.split(' ');
  const name2Words = name2.split(' ');
  let nonInitialMatchCount = 0;
  for (const match of combo) {
    const [index1, index2, score] = match;
    const word1 = name1Words[index1];
    const word2 = name2Words[index2];
    const initialInWord1 = word1.length === 1;
    const initialInWord2 = word2.length === 1;
    if (initialInWord1 || initialInWord2) {
      nonInitialMatchCount++;
    }
  }

  if (shortestWordCount <= nonInitialMatchCount + 1) {
    return true;
  } else {
    return false;
  }
}




















function hasRareSurname(name) {
  // Isolates the last name
  const nameLower = name.toLowerCase();
  const lastName = nameLower.split(' ').pop();

  // If the last name is not in the list of surnames, returns true
  const surnames = surnamesList.map(tup => tup[0]);
  if (!surnames.includes(lastName)) {
    return true;
  } else {
    return false;
  }
}




















function spellingComparison(name1, name2) {
  // Compares the combination of words that match the best, and to what extent
  const wordCombo = findWhichWordsMatchAndHowWell(name1, name2);

  // Loops through the tuples and counts the number of times the score is greater than 80
  const count = wordCombo.reduce((acc, tup) => (tup[2] > 80 ? acc + 1 : acc), 0);

  // If at least three of the scores are greater than 80, or,
  // if the shortest name is only two words in length and both scores are greater than 80,
  // it's a match
  const minLength = Math.min(name1.split(" ").length, name2.split(" ").length);
  if (count >= 3 || (count === minLength && minLength === 2)) {
      return [true, wordCombo];
  }

  // Otherwise, spelling check returns false
  return [false, wordCombo];
}




















function pronunciationComparison(name1, name2, namePairs) {
  // Gets Ipas
  let ipaOfName1 = getPronunciation(name1);
  let ipaOfName2 = getPronunciation(name2);

  // Cleans Ipas
  ipaOfName1 = cleanIpaByItself(ipaOfName1);
  ipaOfName2 = cleanIpaByItself(ipaOfName2);
  [ipaOfName1, ipaOfName2] = cleanIpasTogether(ipaOfName1, ipaOfName2);

  // Matches the ipa words within the two names
  // Splits strings into lists of words
  const ipaWords1 = ipaOfName1.split(" ");
  const ipaWords2 = ipaOfName2.split(" ");

  // Initializes empty list to store scores
  const scores = [];

  // Loop through each word in words1 and compare to each word in words2
  for (let i = 0; i < ipaWords1.length; i++) {
      const ipaWord1 = ipaWords1[i];
      for (let j = 0; j < ipaWords2.length; j++) {
          const ipaWord2 = ipaWords2[j];

          // Use fuzz.ratio to compare the words and store the score
          let score = ratio(ipaWord1, ipaWord2);

          // Updates the score if one of the words was an initial
          for (let k = 0; k < namePairs.length; k++) {
              const [index1, index2, initialScore] = namePairs[k];
              if (i === parseInt(index1) && j === parseInt(index2) && (initialScore === 100 || initialScore === 0)) {
                  score = initialScore;
              }
          }

          // Add the score to scores
          scores.push([`${i} ipaWords1`, `${j} ipaWords2`, score]);
      }
  }

  // Gets the length of the shortest word
  const minLength = Math.min(ipaWords1.length, ipaWords2.length);

  // Generate all combinations of tuples with length equal to the number of words in string2
  let validCombinations = generateCombinations(scores, minLength)

  // Finds the combination with the maximum sum
  const maxCombination = validCombinations.reduce((max, combination) => {
      const sum = combination.reduce((total, tuple) => total + tuple[2], 0);
      return sum > max.sum ? { combination, sum } : max;
  }, { combination: null, sum: -Infinity }).combination;

  // Cleans the max combo
  const cleanedMaxCombination = maxCombination.map((tuple) => {
      const cleanedTuple = [tuple[0].replace(" ipaWords1", "").replace(" ipaWords2", ""), tuple[1].replace(" ipaWords1", "").replace(" ipaWords2", ""), tuple[2]];
      return cleanedTuple;
  });

  // Gets the smallest score in the max combination
  const lowestScore = Math.min(...cleanedMaxCombination.map((tuple) => tuple[2]));

  // If the shortest name is two words in length
  if (minLength === 2) {
      // If the lowest score match is greater than or equal to 80, it's a good pronunciation match
      if (lowestScore >= 80) {
          return [true, cleanedMaxCombination];
      }
      // Otherwise, it's probably not a match
      return [false, cleanedMaxCombination];
  }

  // If the shortest name is more than two words
  if (minLength > 2) {
      // If the lowest score match is greater than 75, it's a good pronunciation match
      if (lowestScore > 75) {
          return [true, cleanedMaxCombination];
      }
      // Otherwise, it's probably not a match
      return [false, cleanedMaxCombination];
  }
}




















export function getPronunciation(fullname) {
  const pList = [];
  for (const word of fullname.split(" ")) {
      pList.push(getIpaOfOneWord(word));
  }
  const pronunciationOfFullname = pList.join(" ");
  return pronunciationOfFullname;
}




















export function getIpaOfOneWord(word) {
  // Setup
  word = word.replace(/ /g, "");
  word = unidecode(word);
  word = word.toLowerCase();
  const pronunciationList = Array(word.length).fill("");

  // Tries to get the ipa from the plain word
  const firstAttempt = hailMary(word);
  if (!firstAttempt.includes("*")) {
      return firstAttempt;
  }

  // While there are still letters in the word
  let substringAdded = true;
  while (substringAdded) {
      // Initialize variables to store the largest matching substring and its length
      substringAdded = false;
      let largestSubstring = "";
      let largestSubstringPronunciation = "";
      let largestSubstringLen = 0;
      let beginningIndexOfSubstring = 0;
      let endIndexOfSubstring = 0;

      // Iterate over every possible substring
      for (let i = 0; i < word.length; i++) {
          for (let j = i + 1; j <= word.length; j++) {
              const substring = word.substring(i, j);

              if (substring.length <= largestSubstringLen) {
                  continue;
              }
              if (substring.includes(" ")) {
                  continue;
              }
              if (substring.length > 1) {
                  const substringIpa = convert(substring);
                  if (substringIpa.includes("*") || substringIpa.length >= substring.length * 2) {
                      continue;
                  } else {
                      largestSubstringPronunciation = substringIpa;
                  }
              } else if (substring.length === 1) {
                  const letterToPronunciation = {
                      a: "æ", b: "b", c: "k", d: "d", e: "ɛ", f: "f", g: "g", h: "h", i: "ɪ", j: "ʤ", k: "k", l: "l",
                      m: "m", n: "n", o: "o", p: "p", q: "k", r: "r", s: "s", t: "t", u: "u", v: "v", w: "w", x: "ks",
                      y: "j", z: "z"
                  };
                  largestSubstringPronunciation = letterToPronunciation[substring] || largestSubstring;
              }

              largestSubstring = substring;
              substringAdded = true;
              largestSubstringLen = substring.length;
              beginningIndexOfSubstring = i;
              endIndexOfSubstring = j;
          }
      }

      // Adds the substring to the list
      if (substringAdded) {
          pronunciationList[beginningIndexOfSubstring] = largestSubstringPronunciation;
      }
      const spaces = " ".repeat(largestSubstringLen);
      word = word.replace(/ +$/, " ");
      word = word.substring(0, beginningIndexOfSubstring) + spaces + word.substring(endIndexOfSubstring);
  }

  // Concatonates the list together at the end to get the pronunciation
  const pronunciation = pronunciationList.join("");
  return pronunciation;
}




















function hailMary(word){
  // Example: querying for a word and getting the pronunciation

  for (const entry of ipa_all_names) {
    if (entry[0] === word) {
      const pronunciation = entry[1];
      return pronunciation;
    }
  }
  return word + "*"
}




















function convert(word){
  // Example: querying for a word and getting the pronunciation
  for (const entry of ipa_one_syllable) {
    if (entry[0] === word) {
      const pronunciation = entry[1];
      return pronunciation;
    }
  }
  return word + "*"
}




















export function cleanIpaByItself(nameIPA) {
  const allIPAConsonants = ['l', 'd', 'z', 'b', 't', 'k', 'n', 's', 'w', 'v', 'ð', 'ʒ', 'ʧ', 'θ', 'h', 'g', 'ʤ', 'ŋ', 'p', 'm', 'ʃ', 'f', 'j', 'r'];
  for (const consonant of allIPAConsonants) {
    let doubleConsonant = consonant + consonant;
    if (nameIPA.includes(doubleConsonant)) {
      nameIPA = nameIPA.replace(doubleConsonant, consonant);
    }
  }
  nameIPA = nameIPA.replace("ɛɛ", "i");
  nameIPA = nameIPA.replace("ɪɪ", "ɪ");
  nameIPA = nameIPA.replace(",","")
  return nameIPA;
}




















export function cleanIpasTogether(ipa1, ipa2) {
  const allIPAConsonants = ['l', 'd', 'z', 'b', 't', 'k', 'n', 's', 'w', 'v', 'ð', 'ʒ', 'ʧ', 'θ', 'h', 'g', 'ʤ', 'ŋ', 'p', 'm', 'ʃ', 'f', 'j', 'r'];
  const dashAndAllIPACons = [...allIPAConsonants, '-'];
  const allIPAVowels = ['ɑ', 'a', 'æ', 'ɪ', 'i', 'ɛ', 'e', 'ə', 'ɔ', 'ʊ', 'u', 'o'];
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɑ", "aɪ", dashAndAllIPACons, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "eɪ", "ɑ", dashAndAllIPACons, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "eɪ", "aɪ", dashAndAllIPACons, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "eɪ", "j", ['k'], ['s']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "aɪ", allIPAConsonants, ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "j", allIPAConsonants, ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ɪɛ", allIPAConsonants, ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ɪ", ["l"], ["l"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ɪ", ["l", "r"], ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ɪ", ['r'], ['k']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ə", ["m"], ["l"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ɪ", ["m"], ["l"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "aɪ", ['v'], ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ɛ", ["h"], ["l"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "eɪ", ["z"], ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "i", "ə", ["k"], ["r-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "j", ["l"], ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "i", ["l"], ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "ɪ", dashAndAllIPACons, ['ld']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "ɪ", ['l'], ['t']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "ɪ", allIPAConsonants, ['d']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "ɑ", allIPAConsonants, ["r"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "æ", allIPAConsonants, ["r"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "ə", dashAndAllIPACons, ["r"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɛ", "aɪ", ["ʤ"], ["l"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɪ", "j", allIPAConsonants, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "eɪ", ["-"], allIPAConsonants);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "ɑ", ["k"], ["k"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "ɑ", ["g"], ["r"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "ɑ", ['b'], ['k-']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "ɑ", ["r"], ["m"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "ɑ", ["r"], ["b"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "ə", ["m"], ["n-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "a", ["m"], ["n-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æ", "ɑh", allIPAConsonants, allIPAConsonants);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "r", "ər", allIPAConsonants, ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "z", "st", allIPAConsonants, ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "z", "ɛs", allIPAConsonants, ["-"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "z", "s", allIPAConsonants, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ə", "ɪ", allIPAConsonants, allIPAConsonants);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ə", "eɪ", ['z'], ['l']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ə", "ɔ", allIPAConsonants, ["n"]);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ʊ", "ɔ", allIPAConsonants, allIPAConsonants);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "uə", "ɔ", allIPAConsonants, ['r']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "oʊ", "ɔ", dashAndAllIPACons, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "oʊ", "aʊə", dashAndAllIPACons, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "oʊ", "u", dashAndAllIPACons, ['r']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "oʊ", "oʊw", allIPAConsonants, ['-']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "u", "au", ['n'], ['m']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "u", "aʊ", ['n'], ['m']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "aʊ", "oʊuə", dashAndAllIPACons, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "s", "z", allIPAVowels, ['-']);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "æŋ", "ɛng", allIPAConsonants, dashAndAllIPACons);
  [ipa1, ipa2] = replaceSubstringSandwichMiddleIfMatchingBread(ipa1, ipa2, "ɪs", "iz", ['n'], ['-']);
  return [ipa1, ipa2];
}














