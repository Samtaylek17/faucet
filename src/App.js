import { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';

function App() {
	const [web3Api, setWeb3Api] = useState({ provider: null, web3: null, contract: null });
	const [account, setAccount] = useState(null);
	const [balance, setBalance] = useState(null);

	useEffect(() => {
		const loadProvider = async () => {
			// with metamask, we have access to window.ethereum & to window.web3
			// metamask injects a global API into website
			// this allows websites to request users, accounts, read data to blockchain,
			// sign messages and transactions

			const provider = await detectEthereumProvider();
			const contract = await loadContract('Faucet', provider);

			if (provider) {
				setWeb3Api({
					web3: new Web3(provider),
					provider,
					contract,
				});
			} else {
				console.error('Please install metamask');
			}
		};

		loadProvider();
	}, []);

	useEffect(() => {
		const getAccounts = async () => {
			const accounts = await web3Api.web3.eth.getAccounts();
			setAccount(accounts[0]);
		};

		web3Api.web3 && getAccounts();
	}, [web3Api.web3]);

	useEffect(() => {
		const loadBalance = async () => {
			const { contract, web3 } = web3Api;
			const balance = await web3.eth.getBalance(contract.address);
			setBalance(web3.utils.fromWei(balance, 'ether'));
		};

		web3Api.contract && loadBalance();
	}, [web3Api]);

	return (
		<>
			<div className='faucet-wrapper'>
				<div className='faucet'>
					<div className='mb-3 is-flex'>
						<span>
							<strong className='mr-2'>Account: </strong>
							{account ? (
								account
							) : (
								<button
									className='button is-small'
									onClick={() => web3Api.provider.request({ method: 'eth_requestAccounts' })}>
									Connect Wallet
								</button>
							)}
						</span>
					</div>
					<div className='balance-view is-size-2 my-5'>
						Current Balance: <strong>{balance}</strong> ETH
					</div>

					<button className='button is-link mr-2'>Donate</button>
					<button className='button is-primary'>Withdraw</button>
				</div>
			</div>
		</>
	);
}

export default App;
