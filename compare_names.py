from fuzzywuzzy import fuzz
import re
from unidecode import unidecode
import itertools
import json
from eng_to_ipa import convert
from typing import List

def compare_two_names(full_name1:str, full_name2:str) -> tuple[bool, int, list]:
    # Cleans the names by making them lowercase, removing punctiation, and removing titles
    full_name1 = clean_name_by_itself(full_name1)
    full_name2 = clean_name_by_itself(full_name2)
    full_name1, full_name2 = clean_names_together(full_name1, full_name2)

    # Rejects if either name is less than two words in length
    name_too_short, word_combo = either_name_too_short(full_name1, full_name2)
    if name_too_short:
        reasoning = -2
        return False, reasoning, word_combo

    # Used later on to reject names that matched by spelling or pronunciation, but were too generic
    generic_name = is_generic_name(full_name1, full_name2)

    # If the names are a solid match by a spelling check, returns true (very likely a match)
    names_match, word_combo = spelling_comparison(full_name1, full_name2)
    if names_match:
        if generic_name:
            reasoning = 0
            return False, reasoning, word_combo
        else:
            reasoning = 1
            return True, reasoning, word_combo
    
    # If the names are a solid match by a pronunciation check, returns true (very likely a match)
    names_match, word_combo = pronunciation_comparison(full_name1,full_name2, word_combo)
    if names_match:
        if generic_name:
            reasoning = 0
            return False, reasoning, word_combo
        else:
            reasoning = 2
            return True, reasoning, word_combo

    # Otherwise (given that spelling and pronunciation checks have failed) returns false (likely NOT a match)
    else:
        reasoning = -1
        return False, reasoning, word_combo



































def clean_name_by_itself(name:str) -> str:
    if name == "":
        return ""
    name = name.lower() # Makes all letters lowercase
    name = re.sub(' +', ' ', name) #Removes more than one space
    if name[-1] == ' ': #Removes space at end
        name = name[:-1]
    if name[0] == ' ': #Removes space at beginning
        name = name[1:]
    name = unidecode(name) #standardizes name into english alphabet
    name = ((((name.lower()).replace(".","")).replace(",","")).replace("?", "")).replace("*","") #Removes Punctuation
    name = name.replace("-"," ") #Replaces "-" with " "
    name = (name.replace("jr","")).replace("junior", "") #Removes jr
    name = (name.replace("sr","")).replace("senior", "") #Removes sr
    name = (name.replace("\"","")).replace("\'", "") #Removes ' and "
    name = ((re.sub("^prof ", "", name)).replace(" prof"," ")).replace("professor", "") #Removes professor
    name = ((re.sub("^mr ", " ", name)).replace(" mr"," ")).replace("mister ", "") #Removes mister
    name = ((re.sub("^mrs ", " ", name)).replace(" mrs"," ")).replace("missus ", "") #Removes missus
    name = ((re.sub("^ms ", " ", name)).replace(" ms"," ")).replace(" miss ", " ") #Removes missus
    name = ((re.sub( " dr$", " ",(re.sub("^dr ", "", name)))).replace("doctor", "")).replace(" dr ", "") #Removes doctor
    name = name.replace("student", "") #Removes student
    name = name.replace("sister", "") #Removes sister
    name = name.replace("brother", "") #Removes brother
    name = name.replace("mother", "") #Removes mother
    name = name.replace("mother", "") #Removes father
    name = name.replace(" in law", " ") #Removes in law
    name = re.sub(' +', ' ', name) #Removes more than one space
    name = (re.sub("[1-9][a-z]{2,6}", "", name)).replace(" the ", "") #Removes stuff like "the 3rd"
    name = name.replace("no suffix", "") #Removes "no suffix"
    name = re.sub(" rev$","", name) #Removes " rev" at the end
    name = re.sub("^rev ", "", name) #Removes "rev " at the beginning
    name = name.replace("reverend", "") #Removes "reverend" everywhere
    name = name.replace("head of household", "") #Removes "head of household"
    name = re.sub(" mc ", " mc", name) #Removes spaces between mc last names
    name = re.sub("^mc ", "mc", name)
    name = re.sub(" mac ", " mac", name) #Removes spaces between mac last names
    name = re.sub("^mac ", "mac", name)
    name = re.sub(" vander ", " vander", name) #Removes spaces between vander last names
    name = re.sub("^vander ", "vander", name)
    name = re.sub(" del ", " de ", name) #Bandaid fix
    name = re.sub(' +', ' ', name) #Removes more than one space
    return name











def clean_names_together(full_name1:str, full_name2:str) -> tuple[str, str]:
    # Returns if either name is blank
    if full_name1 == "" or full_name2 == "":
        return full_name1, full_name2
    
    # Add space
    full_name1 = full_name1 + " "
    full_name2 = full_name2 + " "

    # Fix when records are indexed with " or " in the name
    full_name1, full_name2 = remove_or_in_names(full_name1,full_name2)

    # Replaces ie endings with y endings
    full_name1 = re.sub('ie ', 'y ', full_name1)
    full_name2 = re.sub('ie ', 'y ', full_name2)

    # Replace nicknames with the standard name
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "abram", "abraham")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "burt", "albert")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "alby", "albert")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "abby","abigail")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "aggy","agnes")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "alexander", "alex")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "antoine", "anthony")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "auston", "austen")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "andy", "andrew")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bagg", "bogue")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "berty", "bert")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "berny", "bernard")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bruine", "brown")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "carle", "carlo")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "carl", "carlo")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "callidge", "coolidge")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "claire", "clara")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "chas", "charles")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "chuck", "charles")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "koch", "cox")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "xper", "christopher")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "xr", "christopher")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "danil", "daniel")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "deitz", "dietz")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "diel", "dill")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "dietrich", "deatrick")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "emilo", "emile")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "edythe", "edith")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "evert", "everette")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "evert", "everett")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "evert", "everet")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "evert", "evret")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "dorothea", "dorothy")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "dorotha", "dorothea")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "francois", "frank")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "francis", "frank")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "frances", "frank")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "friedrich", "fred")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "fritz", "fred")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "frederich", "frederic")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "friedrich", "frederick")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "fritz", "frederick")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "fritz", "friedrich")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "firts","frits")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "geo", "george")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "gorge", "george")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "geroge", "george")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "geo", "geroge")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "gerty", "gertrude")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "julia", "giuliana")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "trudy", "gertrude")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "hass", "haas")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "harl", "harold")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "harry", "harold")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "harry", "henry")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "harry", "henri")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "hatty", "harriett")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "hatty", "harriet")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "heinrich", "henry")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "hank", "henry")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "heinrichs", "heinricks")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "heinrich", "heinrick")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "holy", "holly")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "isb", "isabella")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "isb", "isabelle")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "inza", "inga")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "ira", "irene")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "issac", "isaac")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "izaak", "isaac")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "isac", "isaac")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "jas", "james")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "jerimah", "jeremiah")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "jean", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "jean", "johnny")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "jack", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "johnny", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "johannes", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "johanne", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "johann", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "johan", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "hans", "john")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "joseph", "joe")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "joseph", "jose")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "joseh", "joseph")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "josy", "josephine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "josh", "josiah")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "jro", "jerome")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "juddy", "judy")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "julia", "juliette")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "julia", "juliet")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "julio", "julius")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "kit", "christopher")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "kit", "catherine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "kit", "Katherine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "kit", "Katharine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "kate", "katherine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "katharine", "katherine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "kath", "katherine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "katy", "katherine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "leo", "leon")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "leonhard", "leonard")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "llyod", "lloyd")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "louis", "lewis")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "luis", "louis")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "lewis", "louisa")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "louis", "louisa")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "louise", "louisa")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "lk", "luke")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "luca", "lucy")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "ma", "maria")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "mary", "maria")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "molly", "mary")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "mary", "marin")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "mab", "mabel")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "matty", "martha")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "mat", "martha")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "masson", "mason")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "matty", "matilda")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "madge", "margaret")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "maggy", "margaret")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "marguerite", "margaret")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "marguerite", "marjory")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "maggy", "magdalena")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "maggy", "magnolia")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "maher", "maire")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "mary", "miriam")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "micheal", "michell")    
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "polly", "mary")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "marty", "martin")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "matt", "matthew")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "matt", "mathew")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "mgy", "margery")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nickolaus", "nicholas")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nicholis", "nicholas")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nicols", "nicholas")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "ellen", "eleanor")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "ellen", "eleanore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "ellen", "eleanora")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nora", "eleanor")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nora", "eleanore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "eleanor", "eleanora")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nora", "eleanora")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nora", "elinore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "nell", "eleanore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "lenora", "eleanore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "lenora", "elinore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "lenora", "elinor")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "lenora", "elinor")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "olly", "olive")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "oskar", "oscar")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "pierre", "peter")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "piere", "peter")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "philippe", "philip")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "ross", "rose")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "dick", "richard")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "rolin", "ryland")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bob", "robert")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bobby", "robert")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bob", "rob")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bobby", "rob")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bob", "rbt")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bobby", "rbt")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bob", "rb")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bobby", "rb")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "rb", "robert")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "rbt", "robert")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "sal", "sarah")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "sally", "sarah")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "sal", "sara")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "sally", "sara")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "samul", "samuel")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "saint", "st")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "theo", "theodor")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "theo", "theodore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "theodre", "theodore")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "thos", "thomas")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "thomis", "thomas")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "thomis", "tom")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "thos", "tom")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "valentin", "valentine")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "waller", "walter")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wese", "wise")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wese", "weise")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "mena", "mina")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wilhemina", "wilhelmina")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "minny", "wilhelmina")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "williard", "willard")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "williard", "wilard")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wm", "william")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "willlam", "william")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wilhelm", "william")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "willis", "wilhelm")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wm", "wilhelm")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wm", "willis")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "bill", "william")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "billy", "william")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "wise", "weiss")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoy", "zoey")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoe", "zoey")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoy", "zowy")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoe", "zowy")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoey", "zoja")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoy", "zoja")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zowy", "zoja")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoe", "zoja")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoya", "zoja")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoey", "zoya")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoy", "zoya")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zowy", "zoya")
    full_name1, full_name2 = clean_away_nickname(full_name1,full_name2, "zoe", "zoya")

    #Remove articles
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "de")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "la")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "le")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "du")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "dela")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "los")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "der")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "den")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "von")
    full_name1, full_name2 = remove_articles(full_name1, full_name2, "van")

    # Take care of weird spellings by comparing to the other name
    full_name1, full_name2 = fix_both_names_spelling_with_regex(full_name1, full_name2, "ij |ij$", "y |y$", "y ")
    full_name1, full_name2 = fix_both_names_spelling_with_regex(full_name1, full_name2, "ow", "au", "au")
    full_name1, full_name2 = fix_both_names_spelling_with_regex(full_name1, full_name2, "owlk", "olk", "olk")
    
    consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']
    all_letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "c", "cc", all_letters, all_letters)
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "c", "s", ['t'], ['h'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "y", "ey", consonants, ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "i", "y", consonants, ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "ce", "sa", consonants, consonants)
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "ou", "oe", consonants, consonants)
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "a", "o", ['n'], ['n'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "a", "ai", consonants, ['th-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "a", "ay", consonants, consonants)
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "ron", "an", ['f'], ['t'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "sc", "s", ['-'], ['h'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "s", "z", ['t'], ['e'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "e", "z", ['s'], ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "s", "c", ['a'], ['e'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "ee", "ea", ['-r'], ['d-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "a", "e", ['h'], ['lm'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "a", "e", ['r'], ['n-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "a", "ai", ['b'], ['t'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "tt", "d", ['a'], ['el'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "tt", "dd", ['a'], ['el'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "le", "el", consonants, ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "asure", "azer", consonants, ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "toun", "town", ['-'], consonants)
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "ee", "y", consonants, ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "k", "c", ['-'], ['oh'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "d", "t", ['r'], ['el'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "kow", "cow", consonants, ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "kow", "cowe", consonants, ['-'])
    full_name1, full_name2 = replace_substring_sandwich_middle_if_matching_bread(full_name1, full_name2, "ow", "ou", consonants, consonants)
    
    # Remove extra spaces
    full_name1 = re.sub(" +$", "", full_name1)
    full_name2 = re.sub(" +$", "", full_name2)
    full_name1 = re.sub(" +", " ", full_name1)
    full_name2 = re.sub(" +", " ", full_name2)

    #Return
    return full_name1, full_name2






def remove_or_in_names(name1:str, name2:str) -> str:
    name1, name2 = name1.lower(), name2.lower()
    if (" or " in name1) and (" or " in name2):
        return name1, name2
    elif " or " in name1:
        # Gets the score for if the word before 'or' is removed
        name1_edited_A = re.sub("[a-z]+ or ", " ", name1)
        word_combo_A = find_which_words_match_and_how_well(name1_edited_A, name2)
        average_score_A = sum(tup[2] for tup in word_combo_A) / len(word_combo_A)

        # Gets the score for if the word after 'or' is removed
        name1_edited_B = re.sub(" or [a-z]+", " ", name1)
        word_combo_B =  find_which_words_match_and_how_well(name1_edited_B, name2)
        average_score_B = sum(tup[2] for tup in word_combo_B) / len(word_combo_B)

        # If the before score is greater, returns A
        if average_score_A >= average_score_B:
            return name1_edited_A, name2
        # Otherwise returns B
        else:
            return name1_edited_B, name2
        
    elif " or " in name2:
        name2_edited_A = re.sub("[a-z]+ or ", " ", name2)
        word_combo_A = find_which_words_match_and_how_well(name2_edited_A, name1)
        average_score_A = sum(tup[2] for tup in word_combo_A) / len(word_combo_A)

        # Gets the score for if the word after 'or' is removed
        name2_edited_B = re.sub(" or [a-z]+", " ", name2)
        word_combo_B =  find_which_words_match_and_how_well(name2_edited_B, name1)
        average_score_B = sum(tup[2] for tup in word_combo_B) / len(word_combo_B)

        # If the before score is greater, returns A
        if average_score_A >= average_score_B:
            return name1, name2_edited_A
        # Otherwise returns B
        else:
            return name1, name2_edited_B
    else:
        return name1, name2






def clean_away_nickname(full_name1:str, full_name2:str, nickname:str, standard_version:str) -> tuple[str, str]:
    # Check if the standard name is present in one of the names and if the nickname is in the other
    standard_in_one = re.search(rf"\b{standard_version}\b", full_name1, re.IGNORECASE)
    standard_in_two = re.search(rf"\b{standard_version}\b", full_name2, re.IGNORECASE)
    nickname_in_one = re.search(rf"\b{nickname}\b", full_name1, re.IGNORECASE)
    nickname_in_two = re.search(rf"\b{nickname}\b", full_name2, re.IGNORECASE)
    if ((standard_in_one and nickname_in_two) and (not nickname_in_one)):
        full_name2 = re.sub(rf"\b{nickname}\b", standard_version, full_name2, flags=re.IGNORECASE)
    if ((standard_in_two and nickname_in_one) and (not nickname_in_two)):
        full_name1 = re.sub(rf"\b{nickname}\b", standard_version, full_name1, flags=re.IGNORECASE)
    return full_name1, full_name2






def remove_articles(name1:str, name2:str, article:str) -> tuple[str, str]:
    # Edit names so that if one name has an article as part of the next word, it will make it that way for the other name
    name1_edited = name1
    name2_edited = name2
    article_surrounded_by_space = f" {article} "
    article_with_beginning_space = f" {article}"
    if (article_surrounded_by_space in name1_edited) and (article_surrounded_by_space in name2_edited):
        pass
    elif (article_surrounded_by_space in name1_edited) and (article_with_beginning_space in name2_edited):
        name1_edited = name1_edited.replace(article_surrounded_by_space, article_with_beginning_space)
    elif (article_with_beginning_space in name1_edited) and (article_surrounded_by_space in name2_edited):
        name2_edited = name2_edited.replace(article_surrounded_by_space, article_with_beginning_space)
    name1_edited = name1_edited.replace(article_surrounded_by_space, " ")
    name2_edited = name2_edited.replace(article_surrounded_by_space, " ")
    name1_edited = re.sub(' +', ' ', name1_edited) #Removes more than one space
    name2_edited = re.sub(' +', ' ', name2_edited) #Removes more than one space

    # Return without articles if no edits were made
    if (name1 == name1_edited) and (name2 == name2_edited):
        return name1.replace(article_surrounded_by_space, " "), name2.replace(article_surrounded_by_space, " ")

    # If edits were made, check if the edits were benficial to the score
    scores_original_names = find_which_words_match_and_how_well(name1.replace(article_surrounded_by_space, " "), name2.replace(article_surrounded_by_space, " "))
    average_score_original_names = sum(tup[2] for tup in scores_original_names) / len(scores_original_names)
    scores_edited_names = find_which_words_match_and_how_well(name1_edited,name2_edited)
    average_score_edited_names = sum(tup[2] for tup in scores_edited_names) / len(scores_edited_names)

    # If the edits were beneficial to the score, returns the new strings
    if average_score_original_names <= average_score_edited_names:
        return name1_edited, name2_edited

    # Otherwise returns again without articles
    return name1.replace(article_surrounded_by_space, " "), name2.replace(article_surrounded_by_space, " ")







def fix_both_names_spelling_with_regex(name1:str, name2:str, regex_to_replace:str, regex_present_in_other_word:str, replacement:str) -> tuple[str, str]:
    # Finds if the regex statements are within the names
    regex_to_replace_in_name1 = re.search(regex_to_replace, name1)
    regex_to_keep_in_name1 = re.search(regex_present_in_other_word, name1)
    regex_to_replace_in_name2 = re.search(regex_to_replace, name2)
    regex_to_keep_in_name2 = re.search(regex_present_in_other_word, name2)

    # Replaces if and only if the one statement is within one, and the other is within the other
    if (regex_to_replace_in_name1 and regex_to_keep_in_name2 and not regex_to_keep_in_name1 and not regex_to_replace_in_name2):
        name1 = re.sub(regex_to_replace, replacement, name1)
    if (regex_to_replace_in_name2 and regex_to_keep_in_name1 and not regex_to_keep_in_name2 and not regex_to_replace_in_name1):
        name2 = re.sub(regex_to_replace, replacement, name2)

    # Cleans up space
    if name1[-1] == ' ': #Removes space at end
        name1 = name1[:-1]
    if name1[0] == ' ': #Removes space at beginning
        name1 = name1[1:]
    if name2[-1] == ' ': #Removes space at end
        name2 = name2[:-1]
    if name2[0] == ' ': #Removes space at beginning
        name2 = name2[1:]
    name1 = re.sub(' +', ' ', name1) #Removes more than one space
    name2 = re.sub(' +', ' ', name2) #Removes more than one space

    # Returns the names with the spellings now fixed
    return name1, name2










def replace_substring_sandwich_middle_if_matching_bread(string1:str, string2:str, middle_option_1:str, middle_option_2:str, bread_1:List[str], bread_2:List[str]) -> tuple[str, str]:
    if ((middle_option_1 not in string1) and (middle_option_2 not in string1)) or ((middle_option_1 not in string2) and (middle_option_2 not in string2)):
        return string1, string2
    
    word_combo = find_which_words_match_and_how_well(string1, string2)
    final_string_1 = string1.split()
    final_string_2 = string2.split()

    for match in word_combo:
        match_index_string1 = int(match[0])
        match_index_string2 = int(match[1])
        word_in_string1 = string1.split()[match_index_string1]
        word_in_string2 = string2.split()[match_index_string2]
    
        word_in_string1 = "-" + word_in_string1 + '-'
        word_in_string2 = "-" + word_in_string2 + '-'

        vowels_regex = f"({middle_option_1}|{middle_option_2})"

        for cons1 in bread_1:
            if (cons1 not in word_in_string1) or (cons1 not in word_in_string2):
                continue
            for cons2 in bread_2:
                if (cons2 not in word_in_string1) or (cons2 not in word_in_string2):
                    continue

                regex_to_find = f"{cons1}{vowels_regex}{cons2}"
                results1 = re.search(regex_to_find, word_in_string1)
                results2 = re.search(regex_to_find, word_in_string2)
                if (not results1) or (not results2):
                    continue
                spanA1, spanB1 = results1.span()
                spanA2, spanB2 = results2.span()
                if (abs(spanA1 - spanA2) <= 2) and (abs(spanB1 - spanB2) <= 2):
                    if results1.group(0) != results2.group(0):
                        word_in_string1 = re.sub(results1.group(0), results2.group(0), word_in_string1, count=1)

        word_in_string1 = word_in_string1.replace("-", "")
        word_in_string2 = word_in_string2.replace("-", "")

        final_string_1[match_index_string1] = word_in_string1
        final_string_2[match_index_string2] = word_in_string2

    return (" ".join(final_string_1), " ".join(final_string_2))
































def either_name_too_short(name1:str, name2:str) -> tuple[bool, list]:
    # Finds the length of the shortest of the two words
    combo = find_which_words_match_and_how_well(name1, name2)
    shortest_word_count = len(combo)

    # Rejects if either name is less than two words in length
    if shortest_word_count < 2:
        return True, combo
    else:
        return False, combo







































def is_generic_name(name1:str, name2:str) -> bool:
    # Finds the length of the shortest of the two words
    combo = find_which_words_match_and_how_well(name1, name2)
    shortest_word_count = len(combo)

    # If both last names are very rare, returns false
    if has_rare_surname(name1) and has_rare_surname(name2):
        return False

    # Checks if the initials between the two names makes a match too uncertain
    name1_words = name1.split()
    name2_words = name2.split()
    non_initial_match_count = 0
    for match in combo:
        index1, index2, score = match
        index1, index2 = int(index1), int(index2)
        initial_in_word1 = True if len(name1_words[index1]) == 1 else False
        initial_in_word2 = True if len(name2_words[index2]) == 1 else False
        if initial_in_word1 or initial_in_word2:
            non_initial_match_count += 1

    if (shortest_word_count <= non_initial_match_count + 1):
        return True 
    else:
        return False
    




# TODO : Fix me
def put_lastname_last(fullname:str) -> str:
    name_split = fullname.split()
    words_to_popularity = []

    #Gets the each word's popularity as a first name
    for word in name_split:
        score = lastname_likeliness(word)
        tup = (word,  score)
        words_to_popularity.append(tup)

    # Make a new string where the last name should come last
    sorted_list = sorted(words_to_popularity, key=lambda x: x[1])
    name_split = [tup[0] for tup in sorted_list]
    result = " ".join(name_split)
    return result

    





def lastname_likeliness(word:str) -> int:
    # Initialize score as very likely lastname (score of 999)
    score = 999

    # If word is a known first name, score = 0
    with open('_us_firstnames.json', 'r') as f:
        firstname_list = json.load(f)
    for firstname in firstname_list:
        if word == firstname:
            score = 0
            break

    # If word could be a surname OR a firstname, score = 500
    with open('_firstnames_as_surnames.json', 'r') as f:
        both_first_and_last = json.load(f)
    for name in both_first_and_last:
        if word == name:
            score = 500
            break

    # If word is an initial, score = 300
    if len(word) == 1:
        score = 300    

    # returns
    return score








def has_rare_surname(name:str) -> bool:
    # Import from json
    with open('_top_surnames.json', 'r') as f:
        surnames_list = json.load(f)

    # Isolates the last name
    name = name.lower()
    last_name = name.split()[-1]

    # If the last name is not in the list of surnames, returns true
    if last_name not in [str(tup[0]) for tup in surnames_list]:
        return True
    else:
        return False





def has_rare_given_names(name:str) -> bool:
    # Import from json
    with open('_top_firstnames.json', 'r') as f:
        firstname_list = json.load(f)
    
    # Isolates the given names as a list
    name = name.lower()
    last_name = name.split()[-1]
    given_names = name.replace(last_name,"").split()

    # If one of the given names is rare, returns true
    for word in given_names:
        if word not in [str(tup[0]) for tup in firstname_list]:
            return True
    return False








def find_which_words_match_and_how_well(name1:str, name2:str) -> list:
    # Split strings into lists of words
    words1 = name1.split()
    words2 = name2.split()

    # Initialize empty list to store scores
    scores = []

    # Loops through each word in words1 and compare to each word in words2
    for i, word1 in enumerate(words1):
        for j, word2 in enumerate(words2):
            # Gets the score for how well the words match by using fuzz.ratio
            score = fuzz.partial_ratio(word1, word2)

            # Unless word1 or word2 is only an initial, 
            if (len(word1) == 1) or (len(word2) == 1):
                # If the initial matches the first letter of the other word, give it a perfect score
                if (word1[0] == word2[0]):
                    score = 100
                # Otherwise the score is 0
                else:
                    score = 0
                
            # Add the score to scores
            scores.append((f"{i} words1", f"{j} words2", score))

    # Gets the length of the shortest word
    min_length = min(len(words1), len(words2))

    # Generate all combinations of tuples with length equal to the number of words in string2
    combinations = itertools.combinations(scores, min_length)

    # Filter the combinations to include only valid combinations
    valid_combinations = [c for c in combinations if len(set(x[0] for x in c)) == len(c) and len(set(x[1] for x in c)) == len(c)]

    # Cleans the valid combinations
    cleaned_valid_combinations = []
    for valid_combo in valid_combinations:
        cleaned_valid_combo = []
        for tup in valid_combo:
            cleaned_tup = tuple([s.replace(' words1', '').replace(' words2', '') for s in tup[:2]] + [tup[2]])
            cleaned_valid_combo.append(cleaned_tup)
        cleaned_valid_combinations.append(cleaned_valid_combo)

    # Find the combination(s) with the maximum sum
    max_sum = sum(y[2] for y in max(cleaned_valid_combinations, key=lambda x: sum(y[2] for y in x)))
    max_combinations = []
    for combo in cleaned_valid_combinations:
        if (sum(y[2] for y in combo)) == max_sum:
            max_combinations.append(combo)

    # Assigns the max score combination with the most letters to be best_combo
    best_combo = []
    max_letter_count = 0
    for combo in max_combinations:
        letter_count = 0
        for tup in combo:
            x, y, z = map(int, (tup[0], tup[1], tup[2]))
            letter_count += len(words1[x]) + len(words2[y])
        if letter_count > max_letter_count:
            max_letter_count = letter_count
            best_combo = combo

    # Returns the combination of word matches that are the closest match
    return best_combo
































def spelling_comparison(name1:str, name2:str) -> tuple[bool, list]:
    print(name1)
    print(name2)
    # Compares the combination of words that match the best, and to what extent
    word_combo = find_which_words_match_and_how_well(name1, name2)
    print(word_combo)

    # Loops through the tuples and counts the number of times the score is greater than 80
    count = sum(1 for tup in word_combo if tup[2] > 80)

    # If at least three of the scores are greater than 80, or, 
    # if the shortest name is only two words in length and both scores are greater than 80,
    # it's a match
    min_length = min(len(name1.split()), len(name2.split()))
    if (count >= 3) or (count == min_length):
        return True, word_combo
    
    # Otherwise, spelling check returns false
    return False, word_combo






























def pronunciation_comparison(name1:str, name2:str, name_pairs:list) -> tuple[bool, list]:
    ### Gets Ipas
    ipa_of_name1 = get_pronunciation(name1)
    ipa_of_name2 = get_pronunciation(name2)

    ### Cleans Ipas
    ipa_of_name1 = clean_ipa_by_itself(ipa_of_name1)
    ipa_of_name2 = clean_ipa_by_itself(ipa_of_name2)
    ipa_of_name1, ipa_of_name2 = clean_ipas_together(ipa_of_name1, ipa_of_name2)
    print(ipa_of_name1)
    print(ipa_of_name2)

    ### Matches the ipa words within the two names
    # Splits strings into lists of words
    ipa_words1 = ipa_of_name1.split()
    ipa_words2 = ipa_of_name2.split()

    # Initializes empty list to store scores
    scores = []

    # Loop through each word in words1 and compare to each word in words2
    for i, ipa_word1 in enumerate(ipa_words1):
        for j, ipa_word2 in enumerate(ipa_words2):

            # Use fuzz.ratio to compare the words and store the score
            score = fuzz.ratio(ipa_word1, ipa_word2)

            # Updates the score if one of the words was an initial
            for tup in name_pairs:
                if (i == int(tup[0]) and j == int(tup[1]) and ((tup[2] == 100) or (tup[2] == 0))):
                    score = tup[2]
                
            # Add the score to scores
            scores.append((f"{i} ipaWords1", f"{j} ipaWords2", score))


    # Gets the length of the shortest word
    min_length = min(len(ipa_words1), len(ipa_words2))

    # Generates all combinations of tuples with length equal to the number of words in string2
    combinations = itertools.combinations(scores, min_length)

    # Filters the combinations to include only valid combinations
    valid_combinations = [c for c in combinations if len(set(x[0] for x in c)) == len(c) and len(set(x[1] for x in c)) == len(c)]

    # Finds the combination with the maximum sum
    max_combination = max(valid_combinations, key=lambda x: sum(y[2] for y in x))

    # Cleans the max combo
    cleaned_max_combination = []
    for tup in max_combination:
        cleaned_tup = tuple([s.replace(' ipaWords1', '').replace(' ipaWords2', '') for s in tup[:2]] + [tup[2]])
        cleaned_max_combination.append(cleaned_tup)

    # Gets the smallest score in the max combination
    lowest_score = min(tuple[2] for tuple in cleaned_max_combination)
    
    ### If the shortest name is two words in length
    if min_length == 2:
        # If the lowest score match is greater than or equal to 80, it's a good pronunciation match
        if lowest_score >= 80:
            return True, cleaned_max_combination
        # Otherwise it's probably not a match   
        return False, cleaned_max_combination
    
    ### If the shortest name is more than two words
    if min_length > 2:
        # If the lowest score match is greater than 75, it's a good pronunciation match
        if lowest_score > 75:
            return True, cleaned_max_combination
        # Otherwise it's probably not a match    
        return False, cleaned_max_combination





def get_pronunciation(fullname:str):
    p_list = []
    for word in fullname.split():
        p_list.append(get_ipa_of_one_word(word))
    pronunciation_of_fullname = " ".join(p_list)
    return pronunciation_of_fullname





def get_ipa_of_one_word(word:str):
    # Setup
    word = word.replace(" ", "")
    word = unidecode(word)
    word = word.lower()
    pronunciation_list = ["" for char in word]

    # Tries to get the ipa from the plain word
    first_attempt = convert(word)
    if "*" not in first_attempt:
        return first_attempt

    # While there are still letters in the word
    substring_added = True
    while(substring_added):
        # Initialize variables to store the largest matching substring and its length
        substring_added = False
        largest_substring = ""
        largest_substring_len = 0
        beginning_index_of_substring = 0
        end_index_of_substring = 0

        # Iterate over every possible substring
        for i in range(len(word)):
            for j in range(i + 1, len(word) + 1):
                substring = word[i:j]

                if len(substring) <= largest_substring_len:
                    continue
                if " " in substring:
                    continue
                if len(substring) > 1:
                    substring_ipa = convert(substring)
                    if ('*' in substring_ipa) or (len(substring_ipa) >= len(substring) * 2):
                        continue
                    else:
                        largest_substring_pronunciation = substring_ipa
                elif len(substring) == 1:
                    letter_to_pronunciation = {'a':'æ', 'b':'b', 'c':'k', 'd':'d', 'e':'ɛ', 'f':'f', 'g':'g', 'h':'h', 'i':'ɪ', 
                        'j':'ʤ', 'k':'k', 'l':'l', 'm':'m', 'n':'n', 'o':'o', 'p':'p', 'q':'k', 'r':'r', 's':'s', 't':'t', 'u':'u', 
                        'v':'v', 'w':'w', 'x':'ks', 'y':'j', 'z':'z'}
                    largest_substring_pronunciation = letter_to_pronunciation.get(substring, largest_substring)

                largest_substring = substring
                substring_added = True
                largest_substring_len = len(substring)
                beginning_index_of_substring = i
                end_index_of_substring = j

        # Adds the substring to the list
        if substring_added:
            pronunciation_list[beginning_index_of_substring] = largest_substring_pronunciation
        spaces = " " * largest_substring_len
        word = re.sub(" +$", " ", word)
        word = word[:beginning_index_of_substring] + spaces + word[end_index_of_substring:]

    # Concatonates the list together at the end to get the pronunciation
    pronunciation = "".join(pronunciation_list)
    return pronunciation










def clean_ipa_by_itself(name_ipa:str) -> str:
    name_ipa = name_ipa.replace("ˌ","")
    name_ipa = name_ipa.replace("ˈ","")
    name_ipa = name_ipa.replace("ː","")
    all_ipa_consonants = ['l', 'd', 'z', 'b', 't', 'k', 'n', 's', 'w', 'v', 'ð', 'ʒ', 'ʧ', 'θ', 'h', 'g', 'ʤ', 'ŋ', 'p', 'm', 'ʃ', 'f', 'j', 'r']
    for consonant in all_ipa_consonants:
        if f"{consonant}{consonant}" in name_ipa:
            name_ipa = name_ipa.replace(f"{consonant}{consonant}", consonant)
    name_ipa = name_ipa.replace("ɛɛ", "i")
    return name_ipa










def clean_ipas_together(ipa1:str, ipa2:str) -> tuple[str,str]:
    all_ipa_consonants = ['l', 'd', 'z', 'b', 't', 'k', 'n', 's', 'w', 'v', 'ð', 'ʒ', 'ʧ', 'θ', 'h', 'g', 'ʤ', 'ŋ', 'p', 'm', 'ʃ', 'f', 'j', 'r']
    dash_and_all_ipa_cons = all_ipa_consonants + ['-']
    all_ipa_vowels = ['ɑ', 'a', 'æ', 'ɪ', 'i', 'ɛ', 'e', 'ə', 'ɔ', 'ʊ', 'u', 'o']
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɑ", "aɪ", dash_and_all_ipa_cons, dash_and_all_ipa_cons)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "eɪ", "ɑ", dash_and_all_ipa_cons, dash_and_all_ipa_cons)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "eɪ", "aɪ", dash_and_all_ipa_cons, dash_and_all_ipa_cons)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "aɪ", all_ipa_consonants, ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "j", all_ipa_consonants, ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ɪɛ", all_ipa_consonants, ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ɪ", ["l"], ["l"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ɪ", ["l", "r"], ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ɪ", ['r'], ['k'])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ə", ["m"], ["l"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ɪ", ["m"], ["l"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "aɪ", ['v'], ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ɛ", ["h"], ["l"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "eɪ", ["z"], ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "i", "ə", ["k"], ["r-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "j", ["l"], ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "i", ["l"], ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "ɪ", dash_and_all_ipa_cons, ['ld'])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "ɪ", ['l'], ['t'])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "ɑ", all_ipa_consonants, ["r"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "æ", all_ipa_consonants, ["r"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "ə", dash_and_all_ipa_cons, ["r"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɛ", "aɪ", ["ʤ"], ["l"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ɪ", "j", all_ipa_consonants, dash_and_all_ipa_cons)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "æ", "eɪ", ["-"], all_ipa_consonants)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "æ", "ɑ", ["k"], ["k"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "æ", "ɑ", ["g"], ["r"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "æ", "ɑ", ['b'], ['k-'])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "æ", "ɑ", ["r"], ["m"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "æ", "ɑh", all_ipa_consonants, all_ipa_consonants)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "r", "ər", all_ipa_consonants, ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "z", "st", all_ipa_consonants, ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "z", "ɛs", all_ipa_consonants, ["-"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "z", "s", all_ipa_consonants, dash_and_all_ipa_cons)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ə", "ɪ", all_ipa_consonants, all_ipa_consonants)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ə", "eɪ", ['z'], ['l'])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ə", "ɔ", all_ipa_consonants, ["n"])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "ʊ", "ɔ", all_ipa_consonants, all_ipa_consonants)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "uə", "ɔ", all_ipa_consonants, ['r'])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "oʊ", "ɔ", dash_and_all_ipa_cons, dash_and_all_ipa_cons)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "oʊ", "aʊə", dash_and_all_ipa_cons, dash_and_all_ipa_cons)
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "oʊ", "u", dash_and_all_ipa_cons, ['r'])
    ipa1, ipa2 = replace_substring_sandwich_middle_if_matching_bread(ipa1, ipa2, "s", "z", all_ipa_vowels, ['-'])
    return ipa1, ipa2





print(clean_names_together("Johnny Weymouth", "Weymouth, john or iohn"))