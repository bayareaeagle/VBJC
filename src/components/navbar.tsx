import { useState, useEffect } from "react";
import { useWalletList } from '@meshsdk/react';
import { BrowserWallet } from '@meshsdk/core';
import Modal from './Modal';
import logo from "../assets/vista-logo.png"

const Navbar = () => {
  const wallets = useWalletList();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    setWalletAddress(localStorage.getItem('walletAddress'));
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const connectWallet = async (walletName: string) => {
    try {
      setIsConnecting(true);
      const walletInstance = await BrowserWallet.enable(walletName);
      const walletAddress = await walletInstance.walletInstance.getUsedAddresses();
      localStorage.setItem('walletAddress', walletAddress[0]);
      window.location.reload();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
    return (
      <>
        <div className="flex justify-evenly z-[9999] relative items-center">
            <img src={logo} alt="logo" width={125} height={40} />
            <div className="flex gap-4 font-bold">
              <a href="#">Home</a>
              <a href="#">Bridge</a>
              <a href="#">Earn</a>
            </div>
            <div className="flex gap-4">

            <div className="bg-[#F85858] text-white px-6 py-2 rounded-full font-bold text-sm ">
              <button onClick={openModal} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Launch App'}
              </button>
            </div>

            {walletAddress && (
              <div 
                onClick={() => (localStorage.removeItem('walletAddress'), window.location.reload())} 
                className="bg-[#666666] text-white px-6 py-2 rounded-full font-bold text-sm cursor-pointer hover:bg-[#555555] transition-colors"
              >
                Disconnect Wallet
              </div>
              )}
              </div>
        </div>

        {/* Modal for displaying available wallets */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Available Wallets"
          size="lg"
        >
          <div className="space-y-4">
            {wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.map((wallet, index) => (
                  <div
                    key={index}
                    className="bg-[#1C1C1C] p-4 rounded-lg border border-[#141414] hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                        <h3 className="text-lg font-semibold text-white">{wallet.name}</h3>
                      </div>
                      <button className="bg-[#F85858] text-white px-4 py-2 rounded-full font-bold" onClick={() => connectWallet(wallet.name)}>Connect</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-white mb-2">No wallets detected</p>
                  <p className="text-gray-400">
                    Please install a Cardano wallet like Nami, Eternl, Flint, or Typhon to use this feature.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </>
    )
  }
  
  export default Navbar