const BEST_KEYWORDS = ["best", "spot"];
const CALL_KEYWORDS = ["call", "bs", "bullshit", "bullcrap", "bull"];

const QTY_REV_MAP = {
  1: ["one", "uno", "1"],
  2: ["two", "dos", "2"],
  3: ["three", "tres", "3"],
  4: ["four", "cuatro", "4"],
  5: ["five", "cinco", "5"],
  6: ["six", "seis", "6"],
  7: ["seven", "siete", "7"],
  8: ["eight", "ocho", "8"],
  9: ["nine", "nueve", "9"],
  10: ["ten", "diez", "10"],
  11: ["eleven", "once", "11"],
  12: ["twelve", "doce", "12"],
  13: ["thirteen", "trece", "13"],
  14: ["fourteen", "catorce", "14"],
  15: ["fifteen", "quince", "15"],
  16: ["sixteen", "dieciséis", "16"],
  17: ["seventeen", "diecisiete", "17"],
  18: ["eighteen", "dieciocho", "18"],
  19: ["nineteen", "diecinueve", "19"],
  20: ["twenty", "veinte", "20"],
};

const CARD_REV_MAP = {
  "3": [
    "three",
    "tres",
    "threes",
    "treses",
    "3",
    "3s",
    "thriggity",
    "thriggities",
  ],
  "4": ["four", "cuatro", "fours", "cuatros", "4", "4s"],
  "5": ["five", "cinco", "fives", "cincos", "5", "5s"],
  "6": ["six", "seis", "sixes", "seises", "6", "6s"],
  "7": ["seven", "siete", "sevens", "sietes", "7", "7s"],
  "8": ["eight", "ocho", "eights", "ochos", "8", "8s"],
  "9": ["nine", "nueve", "nines", "nueves", "9", "9s", "niggity", "niggities"],
  T: [
    "ten",
    "diez",
    "tens",
    "diezes",
    "10",
    "t",
    "10s",
    "ts",
    "tiggity",
    "tiggities",
  ],
  J: [
    "jack",
    "jacks",
    "j",
    "js",
    "jiggity",
    "jiggities",
    "mcjiggity",
    "mcjiggities",
    "hook",
    "hooks",
    "knave",
    "sota",
    "sotas",
  ],
  Q: ["queen", "queens", "q", "qs", "lady", "ladies", "reina", "reinas"],
  K: ["king", "kings", "k", "ks", "cowboy", "cowboys", "rey", "reyes"],
  A: [
    "ace",
    "aces",
    "a",
    "as",
    "rocket",
    "rockets",
    "bullet",
    "bullets",
    "ases",
  ],
};

const reverseObject = (originalObject: { [key: string]: string[] }) => {
  const reversedObject: { [key: string]: string } = {};
  for (const [key, valueList] of Object.entries(originalObject)) {
    valueList.forEach((value: string) => {
      reversedObject[value] = key;
    });
  }
  return reversedObject;
};

const QTY_MAP = reverseObject(QTY_REV_MAP);
const CARD_MAP = reverseObject(CARD_REV_MAP);

const lookup = (
  input: string,
  mapping: { [key: string]: string }
): string | undefined => {
  return mapping.hasOwnProperty(input) ? mapping[input] : undefined;
};

enum ResponseType {
  Hand,
  Call,
  Best,
  Improper,
}

enum ImproperMessage {
  CallFirstHand = "Start the game by naming a hand.",
  NotTwoItems = "Separate quantity and card by a space.",
  Quantity = "Quantity must be like '3', 'three'",
  Card = "Card must be like '7', 'aces'",
}

const interpretInput = (
  rawInput: string,
  isFirstHand: boolean
): [ResponseType, string] => {
  const input = rawInput.trim().toLowerCase();
  const namedBest = BEST_KEYWORDS.includes(input);
  const namedCall = CALL_KEYWORDS.includes(input);
  if (namedBest || namedCall) {
    if (isFirstHand)
      return [ResponseType.Improper, ImproperMessage.CallFirstHand];
    else if (namedBest) return [ResponseType.Best, "best"];
    else return [ResponseType.Call, "call"];
  }
  const splitStr = input.split(" ");
  if (splitStr.length !== 2)
    return [ResponseType.Improper, ImproperMessage.NotTwoItems];
  const [qtyStr, cardStr] = splitStr;
  const qty = lookup(qtyStr, QTY_MAP);
  const card = lookup(cardStr, CARD_MAP);
  if (qty === undefined)
    return [ResponseType.Improper, ImproperMessage.Quantity];
  else if (card === undefined)
    return [ResponseType.Improper, ImproperMessage.Card];
  return [ResponseType.Hand, `${qty} ${card}`];
};

export { ResponseType, ImproperMessage, interpretInput };
