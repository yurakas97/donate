let connectButton = document.querySelector(".wallet-conect");
let donateButton = document.querySelector("#donateButton")


var timeOutVar;
var requiredNetworkId;
let web3;
let accounts;
var isWalletConnected = false;


// Адрес контракту
const contractAddress = '0x7698f214797cd3657894d4e3891be6cf8a7d000a';  // Замініть на адресу свого контракту
// Або використовуйте абстракцію контракту
const contractABI = [
    {
        "inputs": [],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DonationReceived",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DONATION_AMOUNT",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "donors",
        "outputs": [
            {
                "internalType": "address",
                "name": "donorAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getDonor",
        "outputs": [
            {
                "internalType": "address",
                "name": "donorAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDonorsCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; // Замініть на ваш ABI

var contract;
var contractNFT;

// Smooth scroll on header link click
document.querySelectorAll('.main-header nav a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Parallax effect on scroll with initial offset
const snapContainer = document.querySelector('.snap-container');

// Set initial background offset
document.body.style.backgroundPositionY = "20%";

snapContainer.addEventListener('scroll', () => {
    const scrollPosition = snapContainer.scrollTop;
    const totalHeight = snapContainer.scrollHeight - snapContainer.clientHeight;

    // Calculate background position with middle offset
    const parallaxOffset = 20 + (scrollPosition / totalHeight) * 30; // Середній зсув

    // Apply background position
    document.body.style.backgroundPositionY = `${parallaxOffset}%`;
});

connectButton.addEventListener("click", function () {
    if (!isWalletConnected) walletConnect()
    if (isWalletConnected) walletDisconnect()
});

donateButton.addEventListener("click", () => {
    if (isWalletConnected) donate()
})

async function donate() {
    accounts = await web3.eth.getAccounts();
    //let gasEstimate = await contract.methods.donate().estimateGas({ from: accounts[0] });
    try {
        const result = await contract.methods.donate().send({
            from: accounts[0],
            value: web3.utils.toWei('10000', 'ether'),
            //gas: gasEstimate // Замініть на вашу вартість послуги
        });

        console.log('Transaction successful:', result);
        successDonate()
        //const balance = await contract.methods.getContractBalance().call();
        //console.log(`Баланс контракту: ${web3.utils.fromWei(balance, 'ether')} ETH`);
    } catch (error) {
        console.error('Transaction failed:', error.message);
    }
}

function walletDisconnect() {
    connectButton.textContent = "Connect wallet";
    isWalletConnected = false;
}

async function walletConnect() {
    console.log("wallet")
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        // Використання MetaMask провайдера
        web3 = await new Web3(window.ethereum);
        // Запит на підключення акаунта MetaMask
        await window.ethereum.enable();
        isWalletConnected = true;

    } else {
        console.error('MetaMask not detected');
    }
    contract = await new web3.eth.Contract(contractABI, contractAddress);
    //contractNFT = await new web3.eth.Contract(contractABI_Nft, contractAddress_Nft);
    checkNetwork()
    accounts = await web3.eth.getAccounts();
    let address = accounts[0];
    connectButton.textContent = `${address.slice(-4).toLowerCase()} | Disconnect`;
}

async function getSelectedNetwork() {
    try {
        const networkId = await web3.eth.net.getId();
        return networkId;
    } catch (error) {
        console.error('Error getting network ID:', error.message);
        return 1;
    }
}

// Перевірте, чи обрана мережа відповідає вашим вимогам
function checkNetwork() {
    const requiredNetworkId = 335727; // ID потрібної мережі (1 для mainnet)

    // Спробуйте переключитись на потрібну мережу
    switchToRequiredNetwork(requiredNetworkId).then((success) => {
        if (!success) {
            // Якщо переключення не вдалося, спробуйте додати мережу
            addAndSwitchToNetwork(requiredNetworkId);
        }
    });
    return true
}

// Функція для переключення на задану мережу
function switchToRequiredNetwork(requiredNetworkId) {
    return new Promise((resolve) => {
        getSelectedNetwork().then((networkId) => {
            if (networkId !== null && networkId !== requiredNetworkId) {
                // Запит на переключення мережі
                window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${requiredNetworkId.toString(16)}` }],
                }).then(() => {
                    console.log('Network switched successfully');
                    resolve(true);
                }).catch((error) => {
                    console.error('Error switching network:', error.message);
                    resolve(false);
                });
            } else {
                // Вже на потрібній мережі
                resolve(true);
            }
        });
    });
}

// Функція для додавання та переключення на задану мережу
function addAndSwitchToNetwork(requiredNetworkId) {
    // Отримайте інформацію про мережу для додавання та переключення
    const networkInfo = {
        chainId: `0x${requiredNetworkId.toString(16)}`, // Hex формат ID мережі
        chainName: 'British Humor',
        nativeCurrency: {
            name: 'JKE',
            symbol: 'JKE',
            decimals: 18,
        },
        rpcUrls: ['https://evm.yurakas97.xyz'], // Замініть на свій Infura Project ID
        blockExplorerUrls: null,
    };

    // Додайте та переключіться на мережу
    window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkInfo],
    }).then(() => {
        console.log('Network added successfully');
        // Переключення на додану мережу
        switchToRequiredNetwork(requiredNetworkId);
    }).catch((error) => {
        console.error('Error adding network:', error.message);
    });
}

function successDonate() {
    let userName = prompt("Thank you for supporting Marcel!", "What is your name&?")

    // Add a donor address to the list (for testing)
    const donor = `${userName} - ${accounts[0]}`;
    if (donor) {
        const li = document.createElement('li');
        li.textContent = donor;
        document.getElementById('donorsList').appendChild(li);

        const targetSection = document.getElementById("thank-you");
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }

    //Display a thank - you video
    // const video = document.createElement('video');
    // video.src = 'thank-you-video.mp4';
    // video.controls = true;
    // video.autoplay = true;
    // document.getElementById('videoThanks').appendChild(video);
};

// Викличте перевірку мережі
checkNetwork();

