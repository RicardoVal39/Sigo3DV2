import json
from channels.generic.websocket import WebsocketConsumer

class UserConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        print("User connected")
        self.send(text_data=json.dumps({'message': 'User connected'}))

    def disconnect(self, close_code):
        self.send(text_data=json.dumps({'message': 'User disconnected'}))
        print("User disconnected")
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user = text_data_json['user']
        print("mensaje recibido")
        self.send(text_data=json.dumps({
            'message': message,
            'user': user
            }))
        