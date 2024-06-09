import { useEffect, useState } from "react";
import useSound from "use-sound";

import './App.css';
import { Market, MarketButton } from "./components/Market.js";

// Import data
import { getRandomFishableItem } from "./data/Database";
import { getRandomNumber } from "./utils/Randomness";
import { savePlayerData, PlayerBalanceContainer, getPlayerData, checkPlayerItemsCleanup } from "./data/Player.js";

// Audio
import uiClickSoundSfx from "./sounds/click-01.mp3";
import fishSplooshSfx from "./sounds/fish-01.mp3";
import dunkSoundSfx from "./sounds/dunk-01.mp3";
import reelInSoundSfx from "./sounds/reelin-01.mp3";
import caughtSoundSfx from "./sounds/caught-01.mp3";

// App
export default function App() {
	// Player Data
	const [playerData, setPlayerData] = useState(getPlayerData());

	// States
	const [isRodCasted, setRodCasted] = useState(false);
	const [isCatchingFish, setCatchingFish] = useState(false);
	const [caughtItem, setCaughtItem] = useState(null);

	// Displays
	const [showMarket, setShowMarket] = useState(false);

	// Audio
	const [uiClickSound] = useSound(uiClickSoundSfx, { volume: 0.5 });
	const [fishSploosh] = useSound(fishSplooshSfx);
	const [dunkSound] = useSound(dunkSoundSfx);
	const [reelInSound] = useSound(reelInSoundSfx);
	const [caughtSound] = useSound(caughtSoundSfx, { volume: 0.3 });

	// Toggle between showing and hiding market view
	function toggleShowMarket() {
		// Play click sound effect
		uiClickSound();

		// Show the market
		setShowMarket((showMarket) => !showMarket);
	}

	// Constantly save the player data when it changes
    useEffect(() => {
		// Check if player's inventory expired
		checkPlayerItemsCleanup(playerData.inventoryExpiration, setPlayerData);

        // Save the player's data to storage
        savePlayerData(playerData);

    }, [playerData]);

	// Handling functions
	function handleRodAction(action) {
		// Handle casting
		if (action === "casted") {
			setRodCasted(true);

			// Play sound effect
			fishSploosh();

			// Set delay
			setTimeout(() => {
				// This is the small window to catch the fish!

				// Sound effect
				dunkSound();

				// Set the catch fish flag!
				setCatchingFish(true);

				// Start a countdown until the button hides!
				setTimeout(() => {
					setCatchingFish(false);
				}, getRandomNumber(600, 3000));

				// Reset the rod state
				setRodCasted(false);
			}, getRandomNumber(1500, 20000));
		}

		// Handle catching fish
		else if (action === "catch-fish") {
			// Play reel in sound effect
			reelInSound();

			// Disable the catching fish flag by setting it to false
			setCatchingFish(false);

			// Disable the fishing rod
			setRodCasted(true);

			setTimeout(() => {
				// Play the successfully caught sound effect
				caughtSound();

				// Randomly "fish" up a fish from the database
				setCaughtItem(getRandomFishableItem());

				// Re-enable the fishing rod
				setRodCasted(false);
			}, 3000); // Use the delay of the sound effect
		}
	}

	// Return call
	return (
		<div className="App">

			{true && (
				<div className="fade-in-loading-animation">
					<img className="icon" src="./images/fishables/Achorn.png" alt="loading icon" />
					<h5 className="version-label">v1.2.0</h5>
				</div>
			)}

			{showMarket && <Market toggleShowMarket={toggleShowMarket} playerData={playerData} setPlayerData={setPlayerData} />}

			<h1 className="current-location" onClick={() => setCaughtItem(getRandomFishableItem())}>
                <img className="icon" src="./images/icons/boat-black.svg" alt="boat icon" />
                {playerData.location.name}
            </h1>

			<div style={{ marginTop: 20 }}>
				<PlayerBalanceContainer balance={playerData.coins} />
			</div>

			<PlayerAnimation />

			{caughtItem && <CaughtItem caughtItem={caughtItem} setCaughtItem={setCaughtItem} playerData={playerData} setPlayerData={setPlayerData} />}

			<nav className="bottom-nav">
				<MarketButton toggleShowMarket={toggleShowMarket} />
				
				{ isCatchingFish ? (
					<CatchFish onRodAction={handleRodAction} />
				) : (
					<CastRod isRodCasted={isRodCasted} onRodAction={handleRodAction} />
				)}
			</nav>
		</div>
	);
}

function PlayerAnimation() {
	return (
		<div className="player-boat-container">
			<div className="player-boat">
				<img style={{width:"180px", height: "auto"}} src="./images/boat.png" alt="player's boat" />
			</div>
			<img className="animated-wave-svg" src="./images/animated-wave-01.svg" />
			<div className="animated-wave-filler" />
		</div>
	);
}

function CaughtItem({ caughtItem, setCaughtItem, playerData, setPlayerData }) {
	function givePlayerItem() {
		// Check if the player already has this item in their inventory
		const itemIndex = playerData.inventory.findIndex((item) => item.id === caughtItem.id);

		if (itemIndex !== -1) {
			// Item was found! Just increment the quantity!
			const updatedInventory = [...playerData.inventory];
			updatedInventory[itemIndex].quantity += 1;

			setPlayerData((playerData) => ({
				...playerData,
				inventory: updatedInventory
			}));

		} else {
			// Item wasn't found! Yay, the player just discovered this item!
			setPlayerData((playerData) => ({
				...playerData,
				inventory: [
					...playerData.inventory,
					{
						id: caughtItem.id,
						quantity: 1
					}
				]
			}));

		}

	}

	useEffect(function() {
		// Give the player the new item
		givePlayerItem();

	}, []);

	return (
		<div className="caught-item-container" onClick={() => setCaughtItem(null)}>
			<div className="caught-item">
				<div style={{padding: 20}}>
					<h2>Nice Catch!</h2>
					<img src={`./images/fishables/${caughtItem.image}`} alt="nice catch" />
					<h3>{caughtItem.name}</h3>
					<h4>{caughtItem.note}</h4>
				</div>
			</div>
		</div>
	);
}

function CatchFish({ onRodAction }) {
	return (
		<button className="reel-in" onClick={() => onRodAction("catch-fish")}>
			reel in!
		</button>
	);
}

function CastRod({ isRodCasted, onRodAction }) {
	return (
		<button disabled={isRodCasted} onClick={() => onRodAction("casted")}>
			cast rod
		</button>
	);
}
