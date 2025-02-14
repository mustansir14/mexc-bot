from sqlalchemy import  Column, Integer, String, Float, Boolean
from internal.database import Base

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
