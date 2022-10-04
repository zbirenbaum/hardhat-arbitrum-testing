export type Contract = {
  address: string,
  abi: object,
  contract: object,
}

export type BaseToken<Token> = {
  [Property in keyof Token as Exclude<Property, "underlying">]: Token[Property];
};

export type Token = {
  implementation: string,
  address: string,
  underlying: Token | BaseToken<Token>,
}

export type TokenInfo = {
  [index: string]: Token
}
