import { useState } from 'react';
import Inventory from '../components/Inventory';
import BridgeAssets from '../components/BridgeAssets';
import backgroundImage from '../assets/background.png';

const MainSection = () => {
    const [fromChain, setFromChain] = useState<string>('');

    return (
        <>
            <div className="w-full absolute top-0 left-0 h-screen" style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
            </div>

            <div
                className="2xl:w-[80%] items-center justify-center mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 h-full mb-3 relative"

            >
                <Inventory fromChain={fromChain} />
                <BridgeAssets onFromChainChange={setFromChain} />
            </div>
        </>
    )
}

export default MainSection