/* ========================================
   ORAVEL LIFESTYLE - AI Shopping Assistant
   Floating chat widget backed by POST /api/assistant/chat.
   Uses OPENAI_API_KEY from the backend environment when configured.
   The API key is never exposed in browser JavaScript.
   ======================================== */
(function () {
  'use strict';

  const MAX_HISTORY_TURNS = 10;

  class AIAssistant {
    constructor() {
      this.history = [];
      this.isOpen = false;
      this.isLoading = false;
      this.els = {};
      this.init();
    }

    async init() {
      try {
        const res = await window.oravelFetch('/api/config');
        if (!res.ok) return;
        const config = await res.json();
        if (config && config.assistantEnabled && config.assistantConfigured) {
          this.render(config);
        }
      } catch (error) {
        // No config endpoint reachable - stay hidden, no button, no error shown to shopper.
      }
    }

    render(config = {}) {
      const fab = document.createElement('button');
      fab.type = 'button';
      fab.className = 'assistant-fab';
      fab.setAttribute('aria-label', 'Chat with our shopping assistant');
      fab.title = 'Ask our shopping assistant';
      fab.innerHTML = `
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      `;

      const panel = document.createElement('div');
      panel.className = 'assistant-panel';
      panel.innerHTML = `
        <div class="assistant-panel-header">
          <div>
            <div class="assistant-panel-title">Oravel Assistant</div>
            <div class="assistant-panel-subtitle">AI help for products, questions &amp; support</div>
          </div>
          <button type="button" class="assistant-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="assistant-messages"></div>
        <form class="assistant-input-row">
          <textarea class="assistant-input" placeholder="Type a message..." rows="1" maxlength="800"></textarea>
          <button type="submit" class="assistant-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3 20l18-8L3 4v6l12 2-12 2z"/></svg>
          </button>
        </form>
      `;

      document.body.appendChild(fab);
      document.body.appendChild(panel);

      this.els.fab = fab;
      this.els.panel = panel;
      this.els.messages = panel.querySelector('.assistant-messages');
      this.els.form = panel.querySelector('.assistant-input-row');
      this.els.input = panel.querySelector('.assistant-input');
      this.els.closeBtn = panel.querySelector('.assistant-close');

      fab.addEventListener('click', () => this.toggle());
      this.els.closeBtn.addEventListener('click', () => this.toggle(false));
      this.els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSend();
      });
      this.els.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });
      this.els.input.addEventListener('input', () => this.autoGrow());

      this.appendMessage('assistant', "Hi! I'm the Oravel Lifestyle AI assistant. Ask me about products, prices, gift ideas, shipping, returns, or general shopping questions.");
      this.renderQuickActions();
    }

    renderQuickActions() {
      const wrap = document.createElement('div');
      wrap.className = 'assistant-quick-actions';
      const prompts = [
        'Suggest a gift under 2000 BDT',
        'Which lamps are available?',
        'Tell me about shipping',
        'Show me decorative mirrors'
      ];
      prompts.forEach(prompt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = prompt;
        btn.addEventListener('click', () => {
          this.els.input.value = prompt;
          this.handleSend();
        });
        wrap.appendChild(btn);
      });
      this.els.messages.appendChild(wrap);
      this.scrollToBottom();
    }

    autoGrow() {
      const el = this.els.input;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 110) + 'px';
    }

    toggle(force) {
      this.isOpen = typeof force === 'boolean' ? force : !this.isOpen;
      this.els.panel.classList.toggle('open', this.isOpen);
      this.els.fab.classList.toggle('active', this.isOpen);
      if (this.isOpen) {
        this.els.input.focus();
        this.scrollToBottom();
      }
    }

    appendMessage(role, text) {
      const row = document.createElement('div');
      row.className = `assistant-msg ${role}`;
      const bubble = document.createElement('div');
      bubble.className = 'assistant-bubble';
      bubble.textContent = text; // textContent only - never innerHTML with server/user content.
      row.appendChild(bubble);
      this.els.messages.appendChild(row);
      this.scrollToBottom();
      return row;
    }

    appendTyping() {
      const row = document.createElement('div');
      row.className = 'assistant-msg assistant typing';
      row.innerHTML = '<div class="assistant-bubble assistant-typing"><span></span><span></span><span></span></div>';
      this.els.messages.appendChild(row);
      this.scrollToBottom();
      return row;
    }

    scrollToBottom() {
      this.els.messages.scrollTop = this.els.messages.scrollHeight;
    }

    async handleSend() {
      const text = this.els.input.value.trim();
      if (!text || this.isLoading) return;

      this.appendMessage('user', text);
      this.els.input.value = '';
      this.autoGrow();
      this.isLoading = true;
      this.els.input.disabled = true;
      const typingRow = this.appendTyping();

      try {
        const res = await window.oravelFetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: this.history })
        });
        const data = await res.json().catch(() => ({}));
        typingRow.remove();

        if (res.ok && data.success && data.reply) {
          this.appendMessage('assistant', data.reply);
          this.history.push({ role: 'user', content: text });
          this.history.push({ role: 'assistant', content: data.reply });
          if (this.history.length > MAX_HISTORY_TURNS * 2) {
            this.history = this.history.slice(-MAX_HISTORY_TURNS * 2);
          }
        } else {
          this.appendMessage('assistant', (data && data.message) || "Sorry, I couldn't respond just now. Please try again or reach us on WhatsApp.");
        }
      } catch (error) {
        typingRow.remove();
        this.appendMessage('assistant', "I'm having trouble connecting. Please try again shortly or reach us on WhatsApp.");
      } finally {
        this.isLoading = false;
        this.els.input.disabled = false;
        this.els.input.focus();
      }
    }
  }

  function init() {
    window.oravelAssistant = new AIAssistant();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
