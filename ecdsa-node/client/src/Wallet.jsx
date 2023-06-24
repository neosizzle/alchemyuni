import server from "./server";
import { bytesToHex } from "ethereum-cryptography/utils";

function Wallet({ address, setAddress, balance, setBalance, privateKey, publicKey }) {

  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
      <div className="balance">Priv: 0x{privateKey ? bytesToHex(privateKey) : 0}</div>
      <div className="balance">Pub: 0x{publicKey ? bytesToHex(publicKey) : 0}</div>
    </div>
  );
}

export default Wallet;
