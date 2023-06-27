const axios = require('axios');
const niceList = require('../utils/niceList.json');
const MerkleTree = require('../utils/MerkleTree');

const serverUrl = 'http://localhost:1225';
const tree = new MerkleTree(niceList);

async function main() {
  const name = "Sheryl Lowe"

  const { data: gift } = await axios.post(`${serverUrl}/gift`, {
    proof: tree.getProof(niceList.findIndex(e => e == name)),
    leaf: name
  });

  console.log({ gift });
}

main();