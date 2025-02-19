from internal.database import SessionLocal
from internal.models import Bot
import logging
import time, random
from mexc_sdk import Spot

TEST = False


class TradeExecutor:
    
    def __init__(self):
        self.client = None
        
    def is_connected(self):
        if self.client:
            return True
        return False
    
    def connect(self,api_key, api_secret):
        self.client = Spot(api_key=api_key, api_secret=api_secret)
        return self.client.account_info(), self.client.exchange_info()
    
    
    def disconnect(self):
        self.client = None
        
    
    def execute_trade(self, bot_id: int):

        db = SessionLocal()
        bot = db.query(Bot).filter(Bot.id == bot_id).first()

        if bot is None or self.client is None:
            logging.error(f"Bot {bot_id} not found or API client is disconnected.")
            db.close()
            return

        while True:
            db.refresh(bot)  # Refresh bot instance to check `is_active`
            if not bot.is_active:
                logging.info(f"Bot {bot_id} stopped.")
                break

            logging.info(f"Bot {bot_id} is running... Checking order book.")

            try:
                order_book = self.client.depth(symbol=bot.trading_pair)
                if not order_book or not order_book.get('bids'):
                    logging.warning("No valid order book data.")
                    time.sleep(5)
                    continue

                top_bid_price = float(order_book['bids'][0][0])
                top_bid_quantity = float(order_book['bids'][0][1])
                order_value = top_bid_price * top_bid_quantity

                if order_value >= bot.min_order_value:
                    wait_time = random.randint(bot.min_interval, bot.max_interval)
                    logging.info(f"Waiting for {wait_time} seconds before executing order...")
                    time.sleep(wait_time)

                    sell_percentage = random.uniform(bot.order_percentage_min, bot.order_percentage_max) / 100
                    sell_quantity = round(top_bid_quantity * sell_percentage, 6)

                    logging.info(f"Placing order: Sell {sell_quantity} {bot.trading_pair} at {top_bid_price}")

                    if TEST:
                        response = self.client.new_order_test(
                            symbol=bot.trading_pair,
                            side="SELL",
                            order_type="LIMIT",
                            options={"quantity" : sell_quantity, "price" : top_bid_price}
                        )
                    else:
                        response = self.client.new_order(
                            symbol=bot.trading_pair,
                            side="SELL",
                            order_type="LIMIT",
                            options={"quantity" : sell_quantity, "price" : top_bid_price}
                        )
                    
                    logging.info(f"Order Response: {response}")

                else:
                    logging.warning("Top order value is below minimum requirement.")

                time.sleep(random.randint(bot.min_interval, bot.max_interval))

            except Exception as e:
                logging.error(f"Error in bot {bot_id}: {str(e)}")
                time.sleep(5)

        db.close()


executor = TradeExecutor()

