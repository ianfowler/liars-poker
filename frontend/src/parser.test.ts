import { ResponseType, interpretInput, ImproperMessage } from "./parser";

describe("interpretInput", () => {
  it("should return Hand with proper quantity and card", () => {
    expect(interpretInput("three jacks", true)).toEqual([
      ResponseType.Hand,
      "3 J",
    ]);
    expect(interpretInput("tres jiggities", false)).toEqual([
      ResponseType.Hand,
      "3 J",
    ]);
    expect(interpretInput("20 A", false)).toEqual([ResponseType.Hand, "20 A"]);
  });

  it("should return Improper when starting game with best or call keyword", () => {
    expect(interpretInput("best", true)).toEqual([
      ResponseType.Improper,
      ImproperMessage.CallFirstHand,
    ]);
    expect(interpretInput("call", true)).toEqual([
      ResponseType.Improper,
      ImproperMessage.CallFirstHand,
    ]);
  });

  it("should return Best when best keyword is used after the first hand", () => {
    expect(interpretInput("best", false)).toEqual([ResponseType.Best, "best"]);
    expect(interpretInput("spot", false)).toEqual([ResponseType.Best, "best"]);
  });

  it("should return Call when call keyword is used after the first hand", () => {
    expect(interpretInput("call", false)).toEqual([ResponseType.Call, "call"]);
    expect(interpretInput("bs", false)).toEqual([ResponseType.Call, "call"]);
    expect(interpretInput("bullshit", false)).toEqual([
      ResponseType.Call,
      "call",
    ]);
  });

  it("should return Improper when input does not contain exactly two items", () => {
    expect(interpretInput("three", true)).toEqual([
      ResponseType.Improper,
      ImproperMessage.NotTwoItems,
    ]);
    expect(interpretInput("three jacks ace", true)).toEqual([
      ResponseType.Improper,
      ImproperMessage.NotTwoItems,
    ]);
  });

  it("should return Improper when quantity is invalid", () => {
    expect(interpretInput("invalid jacks", true)).toEqual([
      ResponseType.Improper,
      ImproperMessage.Quantity,
    ]);
  });

  it("should return Improper when card is invalid", () => {
    expect(interpretInput("three invalid", true)).toEqual([
      ResponseType.Improper,
      ImproperMessage.Card,
    ]);
  });

  it("should handle various quantities correctly", () => {
    expect(interpretInput("one jacks", true)).toEqual([
      ResponseType.Hand,
      "1 J",
    ]);
    expect(interpretInput("dos ten", false)).toEqual([
      ResponseType.Hand,
      "2 T",
    ]);
    expect(interpretInput("2 K", false)).toEqual([ResponseType.Hand, "2 K"]);
  });

  it("should handle various cards correctly", () => {
    expect(interpretInput("three ladies", true)).toEqual([
      ResponseType.Hand,
      "3 Q",
    ]);
    expect(interpretInput("cuatro kings", false)).toEqual([
      ResponseType.Hand,
      "4 K",
    ]);
    expect(interpretInput("5 ace", false)).toEqual([ResponseType.Hand, "5 A"]);
  });

  it("should trim input and make it lowercase", () => {
    expect(interpretInput("  Three Jacks  ", true)).toEqual([
      ResponseType.Hand,
      "3 J",
    ]);
    expect(interpretInput("  TRES J  ", false)).toEqual([
      ResponseType.Hand,
      "3 J",
    ]);
    expect(interpretInput("  3 J  ", false)).toEqual([
      ResponseType.Hand,
      "3 J",
    ]);
    expect(interpretInput("  BEST  ", false)).toEqual([
      ResponseType.Best,
      "best",
    ]);
    expect(interpretInput("  CALL  ", false)).toEqual([
      ResponseType.Call,
      "call",
    ]);
    expect(interpretInput("  bull  ", false)).toEqual([
      ResponseType.Call,
      "call",
    ]);
    expect(interpretInput("  bs  ", false)).toEqual([
      ResponseType.Call,
      "call",
    ]);
    expect(interpretInput("  Bullcrap  ", false)).toEqual([
      ResponseType.Call,
      "call",
    ]);
  });
});
