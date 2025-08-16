from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

connected_users = {}

@app.route('/')
def home():
    return render_template('index.html')

@socketio.on('user_connected')
def handle_user_connected(nickname):
    connected_users[request.sid] = nickname
    emit('user_list', list(connected_users.values()), broadcast=True)

@socketio.on('message')
def handle_message(data):
    nickname = connected_users.get(request.sid, 'Аноним')
    emit('message', {
        'text': data['text'],
        'nickname': nickname,
        'timestamp': datetime.now().isoformat()
    }, broadcast=True, skip_sid=request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in connected_users:
        del connected_users[request.sid]
    emit('user_list', list(connected_users.values()), broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)