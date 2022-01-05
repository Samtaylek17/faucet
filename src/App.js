import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';

function App() {
	const [web3Api, setWeb3Api] = useState({ provider: null, isProviderLoaded: false, web3: null, contract: null });
	const [account, setAccount] = useState(null);
	const [balance, setBalance] = useState(null);
	const [shouldReload, setShouldReload] = useState(false);

	const canConnectToContract = account && web3Api.contract;

	const reloadEffect = useCallback(() => setShouldReload(!shouldReload), [shouldReload]);

	const setAccountListener = (provider) => {
		provider.on('accountsChanged', (_) => window.location.reload());
		provider.on('chainChanged', (_) => window.location.reload());
		// provider.on('accountsChanged', (accounts) => setAccount(accounts[0]));

		// provider._jsonRpcConnection.events.on('notification', (payload) => {
		// 	const { method } = payload;
		// 	if (method === 'metamask_unlockStateChanged') {
		// 		setAccount(null);
		// 	}
		// });
	};

	useEffect(() => {
		const loadProvider = async () => {
			// with metamask, we have access to window.ethereum & to window.web3
			// metamask injects a global API into website
			// this allows websites to request users, accounts, read data to blockchain,
			// sign messages and transactions

			const provider = await detectEthereumProvider();

			if (provider) {
				const contract = await loadContract('Faucet', provider);
				setAccountListener(provider);
				setWeb3Api({
					web3: new Web3(provider),
					provider,
					contract,
					isProviderLoaded: true,
				});
			} else {
				setWeb3Api((api) => ({ ...api, isProviderLoaded: true }));
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
	}, [web3Api, shouldReload]);

	const addFunds = useCallback(async () => {
		const { contract, web3 } = web3Api;
		await contract.addFunds({
			from: account,
			value: web3.utils.toWei('1', 'ether'),
		});

		reloadEffect();
	}, [web3Api, account, reloadEffect]);

	const withdraw = async () => {
		const { contract, web3 } = web3Api;
		const withdrawAmount = web3.utils.toWei('0.1', 'ether');
		await contract.withdraw(withdrawAmount, {
			from: account,
		});

		reloadEffect();
	};

	return (
		<>
			<div className='faucet-wrapper'>
				<div className='faucet'>
					{web3Api.isProviderLoaded ? (
						<div className='mb-3 is-flex'>
							<span>
								<strong className='mr-2'>Account: </strong>
							</span>
							{account ? (
								account
							) : !web3Api.provider ? (
								<>
									<div className='notification is-warning is-size-6 is-rounded'>
										Wallet is not detected!{' '}
										<a href='https://docs.metamask.io' target='_blank' rel='noreferrer'>
											Install Metamask
										</a>
									</div>
								</>
							) : (
								<button
									className='button is-small'
									onClick={() => web3Api.provider.request({ method: 'eth_requestAccounts' })}>
									Connect Wallet
								</button>
							)}
						</div>
					) : (
						<span>Looking for Web3...</span>
					)}
					<div className='balance-view is-size-2 my-5'>
						Current Balance: <strong>{balance}</strong> ETH
					</div>
					{!canConnectToContract && (
						<>
							<i className='is-block'>Connect to Ganache! </i>
						</>
					)}
					<button className='button is-link mr-2' onClick={addFunds} disabled={!canConnectToContract}>
						Donate 1 eth
					</button>
					<button className='button is-primary' onClick={withdraw} disabled={!canConnectToContract}>
						Withdraw 0.1 eth
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
