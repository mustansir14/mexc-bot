import time
import random
import threading
import logging
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, Field
from mexc_sdk import Spot

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# Database Configuration
DATABASE_URL = "sqlite:///./bots.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI App
app = FastAPI()

# Global API Client
client = None
bot_threads = {}

# Bot Model (SQLAlchemy)
class Bot(Base):
    __tablename__ = "bots"
    
    id = Column(Integer, primary_key=True, index=True)
    trading_pair = Column(String, index=True)
    min_order_value = Column(Float)
    min_interval = Column(Integer)
    max_interval = Column(Integer)
    order_percentage_min = Column(Float)
    order_percentage_max = Column(Float)
    is_active = Column(Boolean, default=False)

Base.metadata.create_all(bind=engine)

# Pydantic Models
class APIConnectRequest(BaseModel):
    api_key: str = Field(..., title="MEXC API Key")
    api_secret: str = Field(..., title="MEXC API Secret")

class BotCreate(BaseModel):
    trading_pair: str
    min_order_value: float
    min_interval: int
    max_interval: int
    order_percentage_min: float
    order_percentage_max: float
    

# Dependency to Get DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to Get API Client
def get_client():
    global client
    if client is None:
        raise HTTPException(status_code=400, detail="MEXC API not connected")
    return client

# -------------------- API ENDPOINTS --------------------

# Connect to MEXC API
@app.post("/connect")
def connect_to_api(request: APIConnectRequest):
    global client
    client = Spot(api_key=request.api_key, api_secret=request.api_secret)
    try:
        balance = client.account_info()
        return {"message": "Connected to MEXC API", "balances": balance["balances"]}
    except Exception as e:
        client = None
        raise HTTPException(status_code=400, detail=f"Failed to connect: {str(e)}")

# Disconnect from MEXC API
@app.post("/disconnect")
def disconnect_api():
    global client
    client = None
    return {"message": "Disconnected from MEXC API"}

# Add a Trading Bot
@app.post("/bots/add")
def add_bot(bot_data: BotCreate, db: Session = Depends(get_db)):
    bot = Bot(
        trading_pair=bot_data.trading_pair,
        min_order_value=bot_data.min_order_value,
        min_interval=bot_data.min_interval,
        max_interval=bot_data.max_interval,
        order_percentage_min=bot_data.order_percentage_min,
        order_percentage_max=bot_data.order_percentage_max
    )
    db.add(bot)
    db.commit()
    db.refresh(bot)
    return bot

# View All Bots
@app.get("/bots")
def get_bots(db: Session = Depends(get_db)):
    return db.query(Bot).all()

# Delete a Bot
@app.delete("/bots/{bot_id}")
def delete_bot(bot_id: int, db: Session = Depends(get_db)):
    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    db.delete(bot)
    db.commit()
    return {"message": f"Bot {bot_id} deleted successfully"}

# -------------------- BOT EXECUTION --------------------

# Function to Execute Trades
def execute_trade(bot_id: int):
    global client

    db = SessionLocal()
    bot = db.query(Bot).filter(Bot.id == bot_id).first()

    if bot is None or client is None:
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
            order_book = client.depth(symbol=bot.trading_pair)
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

                response = client.new_order_test(
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

# Run Bot (Start a Separate Thread)
@app.post("/bots/run/{bot_id}")
def run_bot(bot_id: int, db: Session = Depends(get_db), client: Spot = Depends(get_client)):
    global bot_threads

    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    if bot_id in bot_threads:
        raise HTTPException(status_code=400, detail="Bot is already running")

    bot.is_active = True
    db.commit()

    bot_thread = threading.Thread(target=execute_trade, args=(bot_id,))
    bot_thread.daemon = True
    bot_threads[bot_id] = bot_thread
    bot_thread.start()

    return {"message": f"Bot {bot_id} started successfully"}

# Stop a Running Bot
@app.post("/bots/stop/{bot_id}")
def stop_bot(bot_id: int, db: Session = Depends(get_db)):
    global bot_threads

    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    if bot_id not in bot_threads:
        raise HTTPException(status_code=400, detail="Bot is not running")

    bot.is_active = False
    db.commit()

    del bot_threads[bot_id]

    return {"message": f"Bot {bot_id} stopped successfully"}
