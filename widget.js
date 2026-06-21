let sevtEmotes = new Map();
let globalMaxMessages = 50;
let globalEntranceDirection = 'bottom';
let globalBubbleAlignment = 'left';
let globalShowSubs = false;
let globalShowCheers = false;
let globalShowTips = false;

// Global message listener to discover elements
window.addEventListener('message', function(event) {
    if (event.data) {
        if (typeof event.data === 'string' || (event.data.type && event.data.type.includes('event')) || event.data.method) {
            console.log('[Chatbox Widget] window.message:', event.data);
        }
    }
});

// Fetch 7TV Emotes globally and configure settings
window.addEventListener('onWidgetLoad', function (obj) {
    console.log('[Chatbox Widget] onWidgetLoad event received', obj);
    const fieldData = obj.detail.fieldData;
    if (!fieldData) return;
    
    globalMaxMessages = fieldData.maxMessages || 50;
    globalEntranceDirection = fieldData.entranceDirection || 'bottom';
    globalBubbleAlignment = fieldData.bubbleAlignment || 'left';
    globalShowSubs = fieldData.showSubs === true;
    globalShowCheers = fieldData.showCheers === true;
    globalShowTips = fieldData.showTips === true;
    
    // Apply container alignment style
    const container = document.getElementById('log');
    if (container) {
        if (globalBubbleAlignment === 'right') {
            container.style.alignItems = 'flex-end';
        } else if (globalBubbleAlignment === 'center') {
            container.style.alignItems = 'center';
        } else {
            container.style.alignItems = 'flex-start';
        }
    }

    // Helper to convert hex to rgba
    function hexToRgba(hex, opacity) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
        return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : null;
    }

    // Parse theme customization settings
    const bubbleBg = fieldData.bubbleBgColor || '#171f33';
    const bubbleBgOpacity = fieldData.bubbleBgOpacity !== undefined ? fieldData.bubbleBgOpacity : 0.6;
    const bubbleBorder = fieldData.bubbleBorderColor || '#dae2fd';
    const bubbleBorderOpacity = fieldData.bubbleBorderOpacity !== undefined ? fieldData.bubbleBorderOpacity : 0.1;
    const usernameColor = fieldData.usernameColor || '#d2bbff';
    const textColor = fieldData.textColor || '#ccc3d8';
    const shadowColor = fieldData.shadowColor || '#d2bbff';
    const shadowOpacity = fieldData.shadowOpacity !== undefined ? fieldData.shadowOpacity : 0.3;
    const borderRadius = fieldData.borderRadius !== undefined ? fieldData.borderRadius : 8;
    const fontSize = fieldData.fontSize !== undefined ? fieldData.fontSize : 13;

    // Apply CSS Variables dynamically to document root
    const root = document.documentElement;
    root.style.setProperty('--bubble-bg', hexToRgba(bubbleBg, bubbleBgOpacity));
    root.style.setProperty('--bubble-border', hexToRgba(bubbleBorder, bubbleBorderOpacity));
    root.style.setProperty('--username-fallback', usernameColor);
    root.style.setProperty('--text-color', textColor);
    root.style.setProperty('--username-shadow', hexToRgba(shadowColor, shadowOpacity));
    root.style.setProperty('--bubble-radius', `${borderRadius}px`);
    root.style.setProperty('--font-size-text', `${fontSize}px`);
    root.style.setProperty('--font-size-username', `${fontSize + 1}px`);
    
    // Clear existing emotes map if reloading
    sevtEmotes.clear();

    const twitchId = fieldData.seventvTwitchId;
    if (twitchId && twitchId.trim() !== '') {
        fetch(`https://7tv.io/v3/users/twitch/${twitchId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.emote_set && data.emote_set.emotes) {
                    data.emote_set.emotes.forEach(emote => {
                        const url = `https://cdn.7tv.app/emote/${emote.id}/2x.webp`;
                        sevtEmotes.set(emote.name, url);
                    });
                    console.log(`[Chatbox Widget] Loaded ${sevtEmotes.size} 7TV emotes.`);
                }
            })
            .catch(err => console.error('[Chatbox Widget] Error fetching 7TV emotes:', err));
    }
});

// Listen directly to StreamElements events
window.addEventListener('onEventReceived', function (obj) {
    console.log('[Chatbox Widget] onEventReceived fired', obj);
    if (!obj.detail || !obj.detail.event) return;
    
    const listener = obj.detail.listener;
    const event = obj.detail.event;
    
    const container = document.getElementById('log');
    if (!container) return;

    if (listener === 'message') {
        addMessage(event.data, container);
    } else if (listener === 'subscriber-latest' && globalShowSubs) {
        addEventMessage('sub', event, container);
    } else if (listener === 'cheer-latest' && globalShowCheers) {
        addEventMessage('cheer', event, container);
    } else if (listener === 'tip-latest' && globalShowTips) {
        addEventMessage('tip', event, container);
    } else if (listener === 'delete-message') {
        deleteMessage(event.msgId, container);
    } else if (listener === 'delete-messages') {
        deleteMessages(event.userId, container);
    }
});

// Delete a single message by ID
function deleteMessage(msgId, container) {
    const messageEl = container.querySelector(`[data-msg-id="${msgId}"]`);
    if (messageEl) {
        messageEl.classList.add('fade-out');
        setTimeout(() => {
            if (messageEl.parentNode === container) {
                container.removeChild(messageEl);
            }
        }, 300);
    }
}

// Delete all messages from a user by user ID
function deleteMessages(userId, container) {
    const messages = container.querySelectorAll(`[data-user-id="${userId}"]`);
    messages.forEach(messageEl => {
        messageEl.classList.add('fade-out');
        setTimeout(() => {
            if (messageEl.parentNode === container) {
                container.removeChild(messageEl);
            }
        }, 300);
    });
}

// Logic to construct and append the message to the container
function addMessage(data, container) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message');
    messageEl.classList.add(`slide-${globalEntranceDirection}`);
    
    // Attach IDs as data attributes for deletion/moderation
    if (data.msgId) {
        messageEl.setAttribute('data-msg-id', data.msgId);
    }
    if (data.userId) {
        messageEl.setAttribute('data-user-id', data.userId);
    }

    // Header (Badges + Username)
    const headerEl = document.createElement('div');
    headerEl.classList.add('chat-header');

    // Badges
    if (data.badges && data.badges.length > 0) {
        const badgesEl = document.createElement('div');
        badgesEl.classList.add('chat-badges');
        data.badges.forEach(badge => {
            const img = document.createElement('img');
            img.classList.add('chat-badge');
            img.src = badge.url;
            badgesEl.appendChild(img);
        });
        headerEl.appendChild(badgesEl);
    }

    // Username
    const usernameEl = document.createElement('span');
    usernameEl.classList.add('chat-username');
    usernameEl.style.color = data.displayColor || 'var(--username-fallback)';
    usernameEl.innerText = data.displayName;
    headerEl.appendChild(usernameEl);

    messageEl.appendChild(headerEl);

    // Content
    const contentEl = document.createElement('div');
    contentEl.classList.add('chat-content');
    
    // Process Emotes (StreamElements native + 7TV)
    let parsedText = parseSEEmotes(data.text, data.emotes);
    parsedText = parse7TVEmotes(parsedText);
    
    contentEl.innerHTML = parsedText;

    // Check if the message is a single emote (1 child element with class 'chat-emote', and no other text)
    const textTrimmed = contentEl.textContent.trim();
    if (contentEl.children.length === 1 && contentEl.children[0].classList.contains('chat-emote') && textTrimmed === '') {
        contentEl.classList.add('large-emote');
        messageEl.classList.add('single-emote-msg');
    }

    messageEl.appendChild(contentEl);

    container.appendChild(messageEl);

    // Manage Max Messages
    while (container.childElementCount > globalMaxMessages) {
        container.removeChild(container.firstChild);
    }
    
    // Auto-scroll to bottom of the window
    window.scrollTo(0, document.body.scrollHeight);
}

// Replace StreamElements provided emotes
function parseSEEmotes(text, emotes) {
    if (!emotes || emotes.length === 0) return escapeHTML(text);
    
    let escaped = escapeHTML(text);
    emotes.forEach(emote => {
        const emoteUrl = emote.urls['2'] || emote.urls['1']; 
        if (emoteUrl) {
            const regex = new RegExp(`\\b${escapeRegExp(emote.name)}\\b`, 'g');
            escaped = escaped.replace(regex, `<img src="${emoteUrl}" class="chat-emote" alt="${emote.name}"/>`);
        }
    });
    return escaped;
}

// Replace 7TV emotes loaded from our map
function parse7TVEmotes(htmlText) {
    if (sevtEmotes.size === 0) return htmlText;
    
    const words = htmlText.split(' ');
    const newWords = words.map(word => {
        if (sevtEmotes.has(word)) {
            return `<img src="${sevtEmotes.get(word)}" class="chat-emote" alt="${word}"/>`;
        }
        return word;
    });
    
    return newWords.join(' ');
}

// Utility to escape HTML to prevent XSS
function escapeHTML(str) {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Logic to construct and append event messages (sub, cheer, tip)
function addEventMessage(type, eventData, container) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message', 'event-message', `event-${type}`);
    messageEl.classList.add(`slide-${globalEntranceDirection}`);
    
    // Attach IDs as data attributes if present
    if (eventData.msgId) {
        messageEl.setAttribute('data-msg-id', eventData.msgId);
    }
    if (eventData.userId) {
        messageEl.setAttribute('data-user-id', eventData.userId);
    }

    // Header for the event (uppercase tracking metadata badge + username)
    const headerEl = document.createElement('div');
    headerEl.classList.add('chat-header');
    
    const badgeEl = document.createElement('span');
    badgeEl.classList.add('event-badge');
    
    let titleText = '';
    let bodyText = '';
    
    if (type === 'sub') {
        badgeEl.textContent = 'SUSCRIPCIÓN';
        badgeEl.classList.add('badge-sub');
        
        const tierName = eventData.tier === 'prime' ? 'Prime' : (eventData.tier ? `Tier ${eventData.tier[0]}` : 'Tier 1');
        
        if (eventData.gifted) {
            titleText = eventData.sender || 'Un espectador';
            bodyText = `¡Regaló una suscripción (${tierName}) a ${eventData.name}!`;
        } else {
            titleText = eventData.name;
            const months = parseInt(eventData.amount) || 1;
            bodyText = months > 1 
                ? `¡Se suscribió por ${months} meses (${tierName})!` 
                : `¡Se suscribió (${tierName})!`;
        }
    } else if (type === 'cheer') {
        badgeEl.textContent = 'BITS';
        badgeEl.classList.add('badge-cheer');
        titleText = eventData.name;
        bodyText = `¡Envió ${eventData.amount} bits!`;
    } else if (type === 'tip') {
        badgeEl.textContent = 'DONACIÓN';
        badgeEl.classList.add('badge-tip');
        titleText = eventData.name;
        
        // Format amount with currency symbol
        const currency = eventData.currency || '$';
        let amountFormatted = eventData.amount;
        if (typeof eventData.amount === 'number') {
            amountFormatted = eventData.amount.toFixed(2);
        } else if (!isNaN(eventData.amount)) {
            amountFormatted = parseFloat(eventData.amount).toFixed(2);
        }
            
        bodyText = `¡Donó ${currency}${amountFormatted}!`;
    }
    
    headerEl.appendChild(badgeEl);
    
    // Event Username
    const usernameEl = document.createElement('span');
    usernameEl.classList.add('chat-username', 'event-username');
    usernameEl.innerText = titleText;
    headerEl.appendChild(usernameEl);
    
    messageEl.appendChild(headerEl);
    
    // Content / Event Body
    const contentEl = document.createElement('div');
    contentEl.classList.add('chat-content', 'event-content');
    
    const bodyEl = document.createElement('span');
    bodyEl.classList.add('event-body-text');
    bodyEl.innerText = bodyText;
    contentEl.appendChild(bodyEl);
    
    // User message (if they sent one along with sub/cheer/tip)
    if (eventData.message && eventData.message.trim() !== '') {
        const userMsgEl = document.createElement('div');
        userMsgEl.classList.add('event-user-message');
        userMsgEl.innerText = eventData.message;
        contentEl.appendChild(userMsgEl);
    }
    
    messageEl.appendChild(contentEl);
    container.appendChild(messageEl);
    
    // Manage Max Messages
    while (container.childElementCount > globalMaxMessages) {
        container.removeChild(container.firstChild);
    }
    
    // Auto-scroll to bottom of the window
    window.scrollTo(0, document.body.scrollHeight);
}
