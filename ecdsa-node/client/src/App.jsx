import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useEffect, useState } from "react";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const privateKey = secp256k1.utils.randomPrivateKey()
    setPrivateKey(privateKey);
    setPublicKey(secp256k1.getPublicKey(privateKey));
  }, [address])
  

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
        privateKey={privateKey}
        publicKey={publicKey}
      />
      <Transfer
      setBalance={setBalance}
      address={address}
      privateKey={privateKey}
        publicKey={publicKey}
      />
    </div>
  );
}

export default App;
