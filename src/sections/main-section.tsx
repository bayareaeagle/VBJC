import Inventory from '../components/Inventory';
import BridgeAssets from '../components/BridgeAssets';
import backgroundImage from '../assets/background.png';

const MainSection = () => {
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
                className="3xl:w-[80%] items-center justify-center mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 h-full mb-3 relative"

            >
                <Inventory />
                <BridgeAssets />
            </div>
        </>
    )
}

export default MainSection