import { useState, useEffect, useRef } from "react";
import { getFishableItemById, getMarketBuyPrice, getMarketSellPrice, testMarketPrice } from "../data/Database";
import { PlayerBalanceContainer, getPlayerData, savePlayerData } from "../data/Player.js";
import { getCurrentDateTime } from "../utils/Time";
import { getDateBeforeToday } from "../utils/Utils";
import useSound from "use-sound";

// CSS
import "../styles/Market.css";
import "../styles/ShopOwner.css";

// Charts
import Chart from 'chart.js/auto';

// Audio
import uiClickSoundSfx from "../sounds/click-01.mp3";
import sellSoundSfx from "../sounds/sell-02.mp3";
import buySoundSfx from "../sounds/buy-01.mp3";

export function Market({ toggleShowMarket, playerData, setPlayerData }) {
    const [tradeItem, setTradeItem] = useState(null);

    // Audio
    const [uiClickSound] = useSound(uiClickSoundSfx, { volume: 0.5 });
    const [sellSound] = useSound(sellSoundSfx);
    const [buySound] = useSound(buySoundSfx);

    // Constantly save the player data when it changes
    useEffect(() => {
        // Save the player's data to storage
        savePlayerData(playerData);

    }, [playerData]);

    function makeTransaction(type, quantity, price, marketItem) {
        // Type should equal either "buy" or "sell"
        if (type === "buy") {
            // Make audio sound effect
            buySound();

            // Buy an item for N price and add it to player's inventory
            setPlayerData((playerData) => ({
                ...playerData,

                // Deduct money from player's balance
                coins: playerData.coins - price,

                // Add more of this item into the player's inventory
                inventory: playerData.inventory.map((item) => (item.id === marketItem.id ? { ...item, quantity: item.quantity + quantity } : item))
            }));
        }
        else if (type === "sell") {
            // Make audio sound effect
            sellSound();

            // Sell item for N price and deduct it from their inventory
            setPlayerData((playerData) => ({
                ...playerData,

                // Deduct money from player's balance
                coins: playerData.coins + price,

                // Add more of this item into the player's inventory
                inventory: playerData.inventory.map((item) => (item.id === marketItem.id ? { ...item, quantity: item.quantity - quantity } : item))
            }));
        }
    }

    return (
        <>
            <TradeItemPopup tradeItem={tradeItem} setTradeItem={setTradeItem} playerData={playerData} makeTransaction={makeTransaction} uiClickSound={uiClickSound} />

            <div className="App market-container">
                <h1 className="current-location">
                    <img className="icon" src="./images/icons/market-black.svg" alt="market" />
                    The Coral Bazaar
                </h1>

                <div style={{ marginTop: 20 }}>
                    <button onClick={() => toggleShowMarket()} style={{ padding: "9px 15px", width: "fit-content" }}>
                        <img style={{ height: 28, width: "auto", marginTop: 0 }} className="icon" src="./images/icons/back-black.svg" alt="go back icon" />
                        Back to boat
                    </button>

                    <div style={{ float: "right" }}>
                        <PlayerBalanceContainer balance={playerData.coins} />
                    </div>
                </div>

                {/* <div className="shop-owner">
                    <div className="owner-image"></div>
                </div> */}

                <h3 className="market-subtitle">Special Items</h3>
                <div className="market-item-list">
                    <div className="market-item disabled">
                        <img src="./images/fishables/Strange_Wooden_Chest.png" />
                        <p>Coming Soon</p>
                    </div>
                    <div className="market-item disabled">
                        <img src="./images/fishables/Paper_Envolope.png" />
                        <p>Coming Soon</p>
                    </div>
                </div>

                <h3 className="market-subtitle">Your Items <span style={{ fontSize: 12, float: "right", marginTop: 5 }}>expire in <ItemExpirationCountdown /></span></h3>
                {playerData.inventory.length === 0 && <p className="text-grey">Didn't you hear? Your item's go bad by midnight, every Friday.</p>}
                <div className="market-item-list">
                    {playerData.inventory.map((inventoryItem) => {
                        // Lookup this item
                        const fishableItem = getFishableItemById(inventoryItem.id);

                        if (!fishableItem)
                            return null;

                        // Get rarity
                        const rarity = fishableItem.id.charAt(0);

                        // Return the item
                        return (
                            <div className={`market-item rarity-${rarity}`} onClick={() => {
                                uiClickSound();
                                setTradeItem({ item: fishableItem, playerQuantity: inventoryItem.quantity });
                            }} key={inventoryItem.id}>
                                <div className="container-bubble">{inventoryItem.quantity}</div>
                                <img src={`./images/fishables/${fishableItem.image}`} alt="market item" />
                                <p>{fishableItem.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function ItemExpirationCountdown() {
    const calculateTimeUntilFriday = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        let daysUntilFriday = 5 - dayOfWeek; // Friday is the 5th day of the week

        if (daysUntilFriday < 0 || (daysUntilFriday === 0 && (currentHour > 23 || (currentHour === 23 && currentMinute >= 59)))) {
            // If today is Friday or later, calculate days until the next Friday
            daysUntilFriday += 7;
        }

        const hoursUntilFriday = daysUntilFriday * 24 - currentHour;
        const minutesUntilFriday = hoursUntilFriday * 60 - currentMinute;

        const days = String(Math.floor(minutesUntilFriday / (24 * 60))).padStart(2, '0');
        const remainingHours = String(Math.floor((minutesUntilFriday % (24 * 60)) / 60)).padStart(2, '0');
        const remainingMinutes = String(minutesUntilFriday % 60).padStart(2, '0');

        return { days, hours: remainingHours, minutes: remainingMinutes };
    }

    const [countdown, setCountdown] = useState(calculateTimeUntilFriday());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdown(calculateTimeUntilFriday());
        }, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, []);

    return (
        <span>{countdown.days}:{countdown.hours}:{countdown.minutes}</span>
    )
}

function TradeItemPopup({ tradeItem, setTradeItem, playerData, makeTransaction, uiClickSound }) {
    const [tradeAmount, setTradeAmount] = useState(1);

    function handleChangeTradeAmount(newAmount) {
        // Play sound effect
        uiClickSound();

        // Number handling
        if (newAmount > 999)
            newAmount = tradeAmount;
        
        // Check if the number is less than 0
        if (newAmount < 0)
            newAmount = 0;

        // Set new trade amount
        setTradeAmount(newAmount);
    }

    function handleClosePopup() {
        // Reset the trade amount
        setTradeAmount(1);

        // Close the popup
        setTradeItem(null);
    }

    if (tradeItem) {
        // Calculate sell and buy prices
        const itemSingularPrice = getMarketBuyPrice(tradeItem.item.id);
        const itemUnavaliable = (itemSingularPrice === -1);
        const itemBuyPrice = itemSingularPrice * tradeAmount;
        const itemSellPrice = getMarketSellPrice(itemSingularPrice) * tradeAmount;

        return (
            <div id="trade-item-modal" className="caught-item-container" onClick={(e) => (e.target.id === "trade-item-modal" ? handleClosePopup() : null)}>
                <div className="trade-item-container caught-item">
                    <div style={{ padding: 20 }}>

                        {!isMarketOpen() && (
                            <div className="market-closed-reminder">
                                Market is closed
                            </div>
                        )}

                        <h2>{tradeItem.item.name}</h2>
                        <img style={{ marginBottom: 0 }} src={`./images/fishables/${tradeItem.item.image}`} />

                        <div style={{width: "100%", overflow: "hidden"}}>
                            <FishableItemPriceChart itemId={tradeItem.item.id} currentPrice={itemSellPrice} />
                        </div>

                        <div className="trade-buttons-container" style={{gap: 10}}>
                            <TradeButton
                                onClick={() => handleChangeTradeAmount(tradeAmount - 1)}
                                disabled={(tradeAmount === 1)}
                            >-</TradeButton>

                            <input className="trade-amount-field" type="number" value={(tradeAmount <= 0 ? "" : tradeAmount)} onChange={(e) => handleChangeTradeAmount(Number(e.target.value))} />

                            <TradeButton
                                onClick={() => handleChangeTradeAmount(tradeAmount + 1)}
                                // If the user can't sell any more && the user cant afford any more
                                disabled={(tradeItem.playerQuantity <= tradeAmount) && (playerData.coins <= (itemBuyPrice + itemSingularPrice))}
                            >+</TradeButton>
                        </div>

                        <div className="trade-buttons-container" style={{ marginTop: 40 }}>
                            <div>
                                <div className="price">
                                    <h4>buy for</h4>
                                    <h1>{itemUnavaliable ? "??" : itemBuyPrice}</h1>
                                </div>
                                <TradeButton onClick={() => {
                                    makeTransaction("buy", tradeAmount, itemBuyPrice, tradeItem.item);
                                    handleClosePopup();
                                }} disabled={itemUnavaliable || (tradeAmount <= 0) || !isMarketOpen() || (playerData.coins >= itemBuyPrice ? false : true)}>buy</TradeButton>
                            </div>
                            <div>
                                <div className="price">
                                    <h4>sell for</h4>
                                    <h1>{itemUnavaliable ? "??" : itemSellPrice}</h1>
                                </div>
                                <TradeButton onClick={() => {
                                    makeTransaction("sell", tradeAmount, itemSellPrice, tradeItem.item);
                                    handleClosePopup();
                                }} disabled={itemUnavaliable || (tradeAmount <= 0) || !isMarketOpen() || ((tradeItem.playerQuantity > 0 && (tradeItem.playerQuantity >= tradeAmount)) ? false : true)}>sell</TradeButton>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

function FishableItemPriceChart({ itemId, currentPrice }) {
    const chartRef = useRef(null);

    useEffect(() => {
        // Sample data
        const labels = ["6", "5", "4", "3", "2", "1", "Current"];
        const data = [
            getMarketSellPrice(getMarketBuyPrice(itemId, false, getDateBeforeToday(-6))),
            getMarketSellPrice(getMarketBuyPrice(itemId, false, getDateBeforeToday(-5))),
            getMarketSellPrice(getMarketBuyPrice(itemId, false, getDateBeforeToday(-4))),
            getMarketSellPrice(getMarketBuyPrice(itemId, false, getDateBeforeToday(-3))),
            getMarketSellPrice(getMarketBuyPrice(itemId, false, getDateBeforeToday(-2))),
            getMarketSellPrice(getMarketBuyPrice(itemId, false, getDateBeforeToday(-1))),
            currentPrice,
        ];

        // Create the chart
        const ctx = chartRef.current.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'price',
                    data: data,
                    borderColor: "#ebbe83",
                    backgroundColor: "#ffd7a3",
                    fill: "start",
                    borderWidth: 4, // Custom line width
                    pointRadius: 0, // Hide points
                    tension: 0.1,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 50,
                        bottom: 10,
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend
                    },
                    tooltip: {
                        enabled: false // Hide tooltip
                    }
                },
                scales: {
                    y: {
                        display: false,
                        beginAtZero: true,
                        grid: {
                            display: false // Hide y-axis grid lines
                        }
                    },
                    x: {
                        display: false, // Hide x-axis labels
                        grid: {
                            display: false // Hide x-axis grid lines
                        }
                    }
                }
            }
        });
    }, []);

    return (
        <div>
            <canvas className="market-item-price-chart" ref={chartRef}></canvas>
            <div className="market-item-price-chart-background"></div>
        </div>
    );
}

function TradeButton({ children, onClick, disabled, onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd }) {
    return (
        <button disabled={disabled} onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} className="trade-button">
            {children}
        </button>
    );
}

export function MarketButton({ toggleShowMarket }) {
    return (
        <button className="market-button" onClick={() => toggleShowMarket()}>

            {!isMarketOpen() ? (
                <div className="container-bubble" style={{ left: -10, top: -10 }}>
                    <img className="icon" style={{ height: 16, margin: 0, marginTop: 5 }} src="./images/icons/moon-black.svg" />
                </div>
            ) : null}

            <img src="./images/icons/market-black.svg" />
        </button>
    );
}

// Function to check if market is open
// Market is open between:
// Weekdays (Monday to Friday):
//  - Open from 6:00 AM to 10:00 PM.

// Weekends (Saturday and Sunday):
//  - Open from 7:00 AM to 11:00 PM.

export function isMarketOpen() {
    const currentTime = getCurrentDateTime();
    const dayOfWeek = currentTime.dayOfWeek;
    const hour = currentTime.hour;

    // Check if it's a weekday
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Check if it's nighttime
        if (hour >= 6 && hour < 22) {
            return true; // Market is open on weekdays from 6:00 AM to 10:00 PM
        }
    } else { // It's the weekend (Saturday or Sunday)
        // Check if it's nighttime
        if (hour >= 7 && hour < 23) {
            return true; // Market is open on weekends from 7:00 AM to 11:00 PM
        }
    }
    return false;
}