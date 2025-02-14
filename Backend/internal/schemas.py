from pydantic import BaseModel, Field


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