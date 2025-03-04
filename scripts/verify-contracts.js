const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const EXPLORER_API = 'https://blockexplorer.electroneum.com/api/v2';
const contracts = [
  {
    name: 'BettingPool',
    address: '0x18E0773B47b5Cb70c4179f4510f2b8Cd722BccA0',
    constructorArgs: ''
  },
  {
    name: 'CommentHub',
    address: '0xfBc307eabd9F50cc903f9569A3B92C9491eBaB3C',
    constructorArgs: ''
  },
  {
    name: 'SpecificBet',
    address: '0xeAc5dC76Ee0f8AFb7B0C2bc3a91aE6bf37A62623',
    constructorArgs: ''
  }
];

async function verifyContract(contract) {
  try {
    const sourceCode = fs.readFileSync(`flattened/${contract.name}.sol`, 'utf8');
    const md5Hash = crypto.createHash('md5').update(sourceCode).digest('hex');
    
    const formData = new URLSearchParams();
    formData.append('smart_contract[address_hash]', contract.address);
    formData.append('smart_contract[name]', contract.name);
    formData.append('smart_contract[compiler_version]', 'v0.8.19+commit.7dd6d404');
    formData.append('smart_contract[optimization]', 'true');
    formData.append('smart_contract[optimization_runs]', '200');
    formData.append('smart_contract[contract_source_code]', sourceCode);
    formData.append('smart_contract[autodetect_constructor_args]', 'true');
    formData.append('smart_contract[constructor_arguments]', contract.constructorArgs);
    formData.append('smart_contract[contract_code_md5]', md5Hash);

    console.log(`Verifying ${contract.name} at ${contract.address}...`);
    const response = await axios.post(`${EXPLORER_API}/smart-contracts`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log(`Response for ${contract.name}:`, response.data);
    
    // Check verification status
    console.log(`Checking verification status for ${contract.name}...`);
    await checkVerificationStatus(contract.address);
    
  } catch (error) {
    console.error(`Error verifying ${contract.name}:`, error.response?.data || error.message);
  }
}

async function checkVerificationStatus(address) {
  try {
    const response = await axios.get(`${EXPLORER_API}/smart-contracts/${address}`);
    console.log(`Verification status:`, response.data);
  } catch (error) {
    console.error('Error checking status:', error.response?.data || error.message);
  }
}

async function main() {
  for (const contract of contracts) {
    await verifyContract(contract);
    // Wait between verifications
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
