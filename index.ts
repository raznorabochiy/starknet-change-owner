import { Account, Contract, hash, RpcProvider } from "starknet";
import { getArgentXAddress, KeyPair, loadFromFile } from "./utils";
import { RPC_URL } from "./constants";

const provider = new RpcProvider({ nodeUrl: RPC_URL });

const [originalPrivateKey] = await loadFromFile("original-private-key.txt");
const [newPrivateKey] = await loadFromFile("new-private-key.txt");

if (!originalPrivateKey || !newPrivateKey) {
  throw new Error("Заполните файлы с ключами");
}

const address = getArgentXAddress(originalPrivateKey);
// нужно заменить на конкретный адрес, если менять у аккаунта, у которого ранее меняли владельца
// const address = "0x0041ae75046c337fcf4b3254bd886771f333fd841032e90bd7376150bd5ad67f"

const originalOwner = new KeyPair(originalPrivateKey);
const newOwner = new KeyPair(newPrivateKey);

console.log({
  address,
  originalOwnerPublicKey: "0x" + originalOwner.publicKey.toString(16),
  newOwnerPublicKey: "0x" + newOwner.publicKey.toString(16),
});

const changeOwnerSelector = hash.getSelectorFromName("change_owner");
const chainId = await provider.getChainId();

const messageHash = hash.computeHashOnElements([
  changeOwnerSelector,
  chainId,
  address,
  originalOwner.publicKey,
]);
const [r, s] = newOwner.signHash(messageHash);

const { abi } = await provider.getClassAt(address);
const parsedAbi = abi.flatMap((e) => (e.type == "interface" ? e.items : e));
const accountContract = new Contract(parsedAbi, address, provider);

const account = new Account(provider, address, originalOwner, "1");

accountContract.connect(account);

const { transaction_hash } = await accountContract.change_owner(
  newOwner.publicKey,
  r,
  s,
);

console.log(`https://starkscan.co/tx/${transaction_hash}`);
