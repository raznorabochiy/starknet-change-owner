import fs from "fs/promises";
import { CallData, ec, hash, Signer } from "starknet";
import { ARGENT_X_ACCOUNT_CLASS_HASH_V1_0 } from "./constants";

export async function loadFromFile(fileName: string) {
  const file = await fs.readFile(fileName, { encoding: "utf8" });

  return file.split("\n").filter(Boolean).map((item) => item.trim());
}

export function zeroPad(value: string) {
  return "0x" + BigInt(value).toString(16).padStart(64, "0");
}

export function getArgentXAddress(key: string) {
  const { calculateContractAddressFromHash } = hash;
  const starkKey = ec.starkCurve.getStarkKey(key);

  const constructorCallData = CallData.compile({
    owner: starkKey,
    guardian: 0n,
  });

  const result = calculateContractAddressFromHash(
    starkKey,
    ARGENT_X_ACCOUNT_CLASS_HASH_V1_0,
    constructorCallData,
    0,
  );

  return zeroPad(result);
}

export class KeyPair extends Signer {
  constructor(key: string) {
    super(key);
  }

  public get privateKey() {
    return BigInt(this.pk as string);
  }

  public get publicKey() {
    return BigInt(ec.starkCurve.getStarkKey(this.pk));
  }

  public signHash(messageHash: string) {
    const { r, s } = ec.starkCurve.sign(messageHash, this.pk);
    return [r.toString(), s.toString()];
  }
}
