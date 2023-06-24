import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { sha256 } from "ethereum-cryptography/sha256.js";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";
import { bytesToHex } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey, publicKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const payload = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    }

    const hashedBytes = sha256(utf8ToBytes(JSON.stringify(payload)))
    const signed = secp256k1.sign(hashedBytes, privateKey)
    
    payload.signed = signed.toCompactHex();
    payload.hashedBytes = bytesToHex(hashedBytes);
    payload.publicKey = bytesToHex(publicKey);
    try {
      const {
        data: { balance },
      } = await server.post(`send`, payload);
      setBalance(balance);
    } catch (ex) {
      console.log(ex)
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
