import threading
import logging
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from internal.models import Bot
from internal.schemas import APIConnectRequest, BotCreate
from internal.trade_executor import executor
from internal.dependencies import get_db




# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# FastAPI App
app = FastAPI()

@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    db.query(Bot).filter(Bot.is_active == True).update({"is_active" : False})
    db.commit()


# Connect to MEXC API
@app.post("/connect")
def connect_to_api(request: APIConnectRequest):
    try:
        balance = executor.connect(request.api_key, request.api_secret)
        return {"message": "Connected to MEXC API", "balances": balance["balances"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect: {str(e)}")

# Disconnect from MEXC API
@app.post("/disconnect")
def disconnect_api():
    executor.disconnect()
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
    if bot.is_active:
        raise HTTPException(status_code=400, detail="Cannot Delete bot, it is running")
    db.delete(bot)
    db.commit()
    return {"message": f"Bot {bot_id} deleted successfully"}

# Run Bot (Start a Separate Thread)
@app.post("/bots/run/{bot_id}")
def run_bot(bot_id: int, db: Session = Depends(get_db)):

    if not executor.is_connected():
        raise HTTPException(status_code=400, detail="API is not connected")

    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    if bot.is_active:
        raise HTTPException(status_code=400, detail="Bot is already running")

    bot.is_active = True
    db.commit()

    bot_thread = threading.Thread(target=executor.execute_trade, args=(bot_id,))
    bot_thread.daemon = True
    bot_thread.start()

    return {"message": f"Bot {bot_id} started successfully"}

# Stop a Running Bot
@app.post("/bots/stop/{bot_id}")
def stop_bot(bot_id: int, db: Session = Depends(get_db)):

    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    if not bot.is_active:
        raise HTTPException(status_code=400, detail="Bot is not running")

    bot.is_active = False
    db.commit()

    return {"message": f"Bot {bot_id} stopped successfully"}