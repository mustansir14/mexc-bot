# mexc-bot
Following endpoints have been created for the backend API

1) Connect to API/View Balance
    METHOD : POST
    ENDPOINT: /connect     (requires parameters api_key and secret_key)

  example body :
   {
    "api_key": "Your_api_key",
    "api_secret": "Your_secret_key"
}

2) Disconnect to API
   METHOD : POST
   ENDPOINT :  /disconnect
   
3) bots view
   METHOD : GET
   ENDPOINT : /bots

   
4) Add a bot
   METHOD : POST
   ENDPOINT : /bots/add

   example body:
   {
    "trading_pair": "BTCUSDT",
    "min_order_value": 10,
    "min_interval": 300,
    "max_interval": 1800,
    "order_percentage_min": 50,
    "order_percentage_max": 80
}
   
5) Delete a bot
   METHOD : DELETE
   ENDPOINT : /bots/{bot_id}
                 
6) Run a bot
   METHOD : POST
   ENDPOINT : /bots/run/{bot_id)
   
7) Stop a bot
   METHOD : POST
   ENDPPOINT : /bots/stop({bot_id)
    
