import time
import random
from mexc_sdk import Spot

# MEXC API Credentials
API_KEY = "mx0vgl8Z1XjaUVrh1m"
API_SECRET = "8fb3879b00d941e298b09abbb8d24388"
client = Spot(api_key=API_KEY, api_secret=API_SECRET)

# Bot Configuration
TRADING_PAIR = "BTCUSDT"  
MIN_ORDER_VALUE = 30  
MAXIMUM_INTERVAL = 5
MINIMUM_INTERVAL = 2
TIME_RANGE = (MINIMUM_INTERVAL, MAXIMUM_INTERVAL)  
ORDER_PERCENTAGE = (50, 80)
TEST = True

def get_order_book(symbol):
    """Fetch the order book for a given token."""
    orderbook = client.depth(symbol=symbol )
    return [{
        "price": float(bid[0]),
        "qty": float(bid[1])
    } for bid in orderbook['bids']]

def place_sell_order(symbol, price, quantity):
    """Place a limit sell order."""
    if TEST:
        return client.new_order_test(symbol=symbol, side="SELL", order_type="LIMIT", options={"quantity": quantity, "price": price})
    return client.new_order(symbol=symbol, side="SELL", order_type="LIMIT", options={"quantity": quantity, "price": price})


def execute_trade():
    """Execute the trade logic."""
    order_book = get_order_book(TRADING_PAIR)
    if not order_book:
        print("No valid order book data.")
        return
    
    top_bid_price, top_bid_quantity = float(order_book[0]['price']), float(order_book[0]['qty'])
    order_value = top_bid_price * top_bid_quantity
    
    if order_value >= MIN_ORDER_VALUE:
        wait_time = random.randint(*TIME_RANGE)
        print(f"Waiting for {wait_time} seconds before executing the order...")
        time.sleep(wait_time)
        
        sell_percentage = random.uniform(*ORDER_PERCENTAGE) / 100
        sell_quantity = round(top_bid_quantity * sell_percentage, 6)
        
        print(f"Placing order: Sell {sell_quantity} {TRADING_PAIR} at {top_bid_price}")
        response = place_sell_order(TRADING_PAIR, top_bid_price, sell_quantity)
        print("Order Response:", response)
    else:
        print("Top order value is below minimum requirement.")

if __name__ == "__main__":
    while True:
        execute_trade()
        time.sleep(random.randint(*TIME_RANGE))



