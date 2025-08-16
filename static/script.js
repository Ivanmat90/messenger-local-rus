const socket = io();
let nickname = localStorage.getItem('nickname') || '';
let currentTheme = localStorage.getItem('theme') || 'light';

// Элементы интерфейса
const nicknameModal = document.getElementById('nickname-modal');
const chatContainer = document.querySelector('.chat-container');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const onlineCount = document.getElementById('online-count');
const themeToggle = document.getElementById('theme-toggle');
const sideMenu = document.getElementById('side-menu');
const menuToggle = document.getElementById('menu-toggle');
const closeMenu = document.getElementById('close-menu');
const emojiToggle = document.getElementById('emoji-toggle');
const emojiPicker = document.getElementById('emoji-picker');

// Инициализация темы
function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

// Инициализация чата
function initChat() {
  applyTheme();
  
  if (nickname) {
    nicknameModal.style.display = 'none';
    chatContainer.style.display = 'flex';
    socket.emit('user_connected', nickname);
  } else {
    nicknameModal.style.display = 'flex';
  }
}

// Сохранение ника
document.getElementById('save-nickname').addEventListener('click', () => {
  const input = document.getElementById('nickname-input');
  const loader = document.getElementById('nickname-loader');
  const btnText = document.querySelector('#save-nickname span');
  
  nickname = input.value.trim();
  if (nickname) {
    loader.style.display = 'block';
    btnText.textContent = 'Загрузка...';
    
    // Имитация загрузки (в реальном приложении - запрос к серверу)
    setTimeout(() => {
      localStorage.setItem('nickname', nickname);
      nicknameModal.style.display = 'none';
      chatContainer.style.display = 'flex';
      socket.emit('user_connected', nickname);
      
      loader.style.display = 'none';
      btnText.textContent = 'Продолжить';
    }, 800);
  }
});

// Отправка сообщения
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    const messageData = {
      text: message,
      nickname: nickname
    };
    
    // Добавляем сообщение сразу в исходящие
    addMessage(message, true);
    
    // Отправляем на сервер
    socket.emit('message', messageData);
    
    // Очищаем поле ввода
    messageInput.value = '';
  }
}

// Добавление сообщения в чат
function addMessage(text, isOutgoing, senderNickname = nickname) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;
  
  // Заголовок с ником
  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = isOutgoing ? 'Вы' : senderNickname;
  
  // Текст сообщения
  const content = document.createElement('div');
  content.textContent = text;
  
  // Время сообщения
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  // Собираем структуру
  messageDiv.appendChild(header);
  messageDiv.appendChild(content);
  messageDiv.appendChild(time);
  messagesDiv.appendChild(messageDiv);
  
  // Прокрутка вниз
  scrollToBottom();
  
  // Анимация появления
  setTimeout(() => {
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  }, 10);
}

// Обработка входящих сообщений
socket.on('message', (data) => {
  addMessage(data.text, false, data.nickname);
});

// Обновление списка онлайн
socket.on('user_list', (users) => {
  onlineCount.textContent = `👥 ${users.length}`;
});

// Прокрутка вниз
function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Переключение темы
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
  applyTheme();
});

// Боковое меню
menuToggle.addEventListener('click', () => {
  sideMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
  sideMenu.classList.remove('active');
});

// Эмодзи-панель
emojiToggle.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

// Очистка чата
document.getElementById('clear-chat').addEventListener('click', () => {
  messagesDiv.innerHTML = '';
  sideMenu.classList.remove('active');
});

// Отправка по Enter
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Клик по кнопке отправки
sendBtn.addEventListener('click', sendMessage);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  initChat();
  
  // Скрываем приветственное сообщение при первом сообщении
  const welcomeMsg = document.querySelector('.welcome-message');
  if (welcomeMsg) {
    socket.on('message', () => {
      welcomeMsg.style.display = 'none';
    });
  }
});

// Простая реализация эмодзи (для демо)
const emojis = {
  smileys: ['😀', '😊', '😂', '🤣', '😍', '😎', '🥳', '😜', '🤩', '😇'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐮'],
  food: ['🍎', '🍕', '🍔', '🍟', '🍦', '🍩', '🍪', '🍫', '🍓', '🍉']
};

function loadEmojis(category) {
  const container = document.getElementById('emoji-container');
  container.innerHTML = '';
  
  emojis[category].forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      messageInput.value += emoji;
      messageInput.focus();
    });
    container.appendChild(btn);
  });
}

// Загрузка эмодзи по категориям
document.querySelectorAll('[data-category]').forEach(btn => {
  btn.addEventListener('click', () => {
    loadEmojis(btn.dataset.category);
  });
});

// Загружаем первую категорию по умолчанию
loadEmojis('smileys');