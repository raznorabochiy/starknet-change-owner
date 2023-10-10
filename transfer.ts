import { Account, Contract, RpcProvider, uint256 } from "starknet";
import { loadFromFile } from "./utils";
import {
  ERC20_ABI_CONTRACT_ADDRESS,
  ETH_TOKEN_ADDRESS,
  RPC_URL,
} from "./constants";

const provider = new RpcProvider({ nodeUrl: RPC_URL });

async function transfer(key: string) {
  // адрес аккаунта для которого тестируем доступ
  const address =
    "0x0041ae75046c337fcf4b3254bd886771f333fd841032e90bd7376150bd5ad67f";

  const account = new Account(provider, address, key, "1");

  const { abi } = await provider.getClassAt(ERC20_ABI_CONTRACT_ADDRESS);
  const parsedAbi = abi.flatMap((e) => (e.type == "interface" ? e.items : e));
  const ethContract = new Contract(parsedAbi, ETH_TOKEN_ADDRESS, provider);
  ethContract.connect(account);

  const recipient = address;
  const amount = uint256.bnToUint256(1000);

  const { transaction_hash } = await ethContract.transfer(recipient, amount);

  console.log(`https://starkscan.co/tx/${transaction_hash}`);
}

const [originalPrivateKey] = await loadFromFile("original-private-key.txt");
const [newPrivateKey] = await loadFromFile("new-private-key.txt");

console.log("Try original private key");

try {
  await transfer(originalPrivateKey);
} catch (e) {
  console.log(e.message);
}

console.log("=============");

console.log("Try new private key");

try {
  await transfer(newPrivateKey);
} catch (e) {
  console.log(e.message);
}
