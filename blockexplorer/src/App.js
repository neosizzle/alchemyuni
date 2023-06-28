import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [block, setBlock] = useState()

  useEffect(() => {
    async function getBlockNumber() {
      const blockNum = await alchemy.core.getBlockNumber()
      const blocks = await alchemy.core.getBlockWithTransactions(blockNum)
      setBlockNumber(blockNum);
      setBlock(blocks);
      console.log(blocks)
    }

    getBlockNumber();
  } , []);

   if (!block) return <div className="App"> loading .. </div>

  return <div className="App">
        <div>
          Block Number: {blockNumber} Hash: {block?.hash}
        </div>
        <div>
          Transactions
          {
            block.transactions.map((transaction) => {
              return <div style={{border : "1px black solid"}}>
                  <div>
                    hash {transaction.hash}
                  </div>
                  <div>
                    to {transaction.to}
                  </div>
                  <div>
                    from {transaction.from}
                  </div>
                </div>
            })
          }
        </div>
     </div>;
}

export default App;
