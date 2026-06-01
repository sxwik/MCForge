const socket = io();

socket.on('connect', () => {
    document.getElementById('connectionStatus').textContent = '● Online';
    document.getElementById('connectionStatus').className = 'status connected';
});

socket.on('disconnect', () => {
    document.getElementById('connectionStatus').textContent = '● Offline';
    document.getElementById('connectionStatus').className = 'status disconnected';
});

socket.on('status', (data) => {
    updateStatus(data);
});

socket.on('chat', (data) => {
    addChatMessage(data.username, data.message);
});

function updateStatus(status) {
    if (status.health !== undefined) {
        document.getElementById('healthValue').textContent = `${Math.ceil(status.health)}/20`;
        document.getElementById('healthBar').style.width = `${(status.health / 20) * 100}%`;
    }

    if (status.hunger !== undefined) {
        document.getElementById('hungerValue').textContent = `${Math.ceil(status.hunger)}/20`;
        document.getElementById('hungerBar').style.width = `${(status.hunger / 20) * 100}%`;
    }

    if (status.position) {
        document.getElementById('positionValue').textContent = 
            `X: ${Math.floor(status.position.x)}, Y: ${Math.floor(status.position.y)}, Z: ${Math.floor(status.position.z)}`;
    }

    if (status.taskStatus && status.taskStatus.currentTask) {
        const task = status.taskStatus.currentTask;
        document.getElementById('taskInfo').innerHTML = `
            <p><strong>Task ID:</strong> ${task.id}</p>
            <p><strong>Type:</strong> ${task.type}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Progress:</strong> ${task.status === 'running' ? 'In Progress' : 'Waiting'}</p>
        `;
    }

    if (status.multiBots && status.multiBots.bots) {
        updateBotsList(status.multiBots);
    }

    fetchInventory();
    fetchMemory();
}

function updateBotsList(multiBotStatus) {
    const container = document.getElementById('botsList');
    if (!multiBotStatus.bots || multiBotStatus.bots.length === 0) {
        container.innerHTML = '<p>No bots active</p>';
        return;
    }

    container.innerHTML = multiBotStatus.bots.map(bot => `
        <div class="bot-card">
            <strong>${bot.name}</strong> (${bot.type})
            <p>Status: ${bot.status}</p>
            <p>Health: ${bot.health}/20</p>
            <p>Position: ${Math.floor(bot.position.x)}, ${Math.floor(bot.position.y)}, ${Math.floor(bot.position.z)}</p>
        </div>
    `).join('');
}

function fetchInventory() {
    fetch('/api/inventory')
        .then(res => res.json())
        .then(inventory => {
            const container = document.getElementById('inventoryContainer');
            const items = inventory.filter(slot => slot.name);
            
            if (items.length === 0) {
                container.innerHTML = '<p>Empty</p>';
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="inventory-slot" title="${item.name}">
                    <span class="slot-name">${item.name.substring(0, 8)}</span>
                    <span class="slot-count">${item.count}</span>
                </div>
            `).join('');
        })
        .catch(err => console.error('Inventory error:', err));
}

function fetchMemory() {
    fetch('/api/memory')
        .then(res => res.json())
        .then(memory => {
            const home = memory.home ? `X: ${memory.home.x}, Y: ${memory.home.y}, Z: ${memory.home.z}` : 'Not set';
            const storage = memory.storage ? `X: ${memory.storage.x}, Y: ${memory.storage.y}, Z: ${memory.storage.z}` : 'Not set';
            
            document.getElementById('homeLocation').textContent = `Home: ${home}`;
            document.getElementById('storageLocation').textContent = `Storage: ${storage}`;
        })
        .catch(err => console.error('Memory error:', err));
}

function sendCommand() {
    const input = document.getElementById('commandInput');
    const command = input.value.trim();
    
    if (!command) return;

    socket.emit('command', { command });
    input.value = '';
}

function sendAICommand() {
    const input = document.getElementById('aiCommandInput');
    const command = input.value.trim();
    
    if (!command) return;

    socket.emit('ai-command', { command });
    input.value = '';
    addChatMessage('System', `Executing AI command: ${command}`);
}

function setHome() {
    socket.emit('command', { command: 'sethome' });
    addChatMessage('System', 'Home location set');
}

function addChatMessage(username, message) {
    const container = document.getElementById('chatContainer');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    msgDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    if (container.children.length > 100) {
        container.removeChild(container.firstChild);
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        const message = document.getElementById('chatInput').value.trim();
        if (message) {
            socket.emit('message', { message });
            document.getElementById('chatInput').value = '';
        }
    }
}

// Load initial data
setInterval(() => {
    fetchInventory();
    fetchMemory();
}, 2000);

// Quick command buttons
document.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' && event.target.id === 'commandInput') {
        sendCommand();
    }
});
