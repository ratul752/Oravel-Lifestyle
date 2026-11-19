/* ========================================
   ORAVEL LIFESTYLE - WhatsApp Floating Button
   Uses WHATSAPP_NUMBER from /api/config when configured.
   Falls back to WhatsApp's contact chooser so the button always works.
   ======================================== */
(function () {
  'use strict';

  const MESSAGE = 'Hi! I have a question about Oravel Lifestyle products.';

  function normalizeNumber(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits : '';
  }

  function buildWhatsappUrl(number) {
    const text = encodeURIComponent(MESSAGE);
    return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
  }

  function renderButton(number) {
    if (document.querySelector('.whatsapp-fab')) return;

    const link = document.createElement('a');
    link.className = 'whatsapp-fab';
    link.href = buildWhatsappUrl(number);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', number ? 'Chat with Oravel Lifestyle on WhatsApp' : 'Open WhatsApp');
    link.title = number ? 'Chat with us on WhatsApp' : 'Open WhatsApp';
    link.innerHTML = `
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.34.66 4.523 1.804 6.384L4 29l7.79-1.766A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.7c-1.99 0-3.85-.57-5.42-1.55l-.39-.24-4.62 1.05 1.08-4.5-.26-.4A9.63 9.63 0 0 1 5.3 15c0-5.9 4.8-10.7 10.7-10.7 5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.7-10.7 10.7zm5.87-8.02c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.83 1.05-1.02 1.26-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.6-.95-.85-1.6-1.9-1.78-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.06 1.3 3.27c.16.21 2.24 3.42 5.42 4.79.76.33 1.35.53 1.81.68.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z"/>
      </svg>
    `;
    document.body.appendChild(link);
  }

  async function init() {
    let number = normalizeNumber(window.ORAVEL_WHATSAPP_NUMBER);

    try {
      const response = await window.oravelFetch('/api/config', { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const config = await response.json();
        number = normalizeNumber(config.whatsappNumber) || number;
      }
    } catch (_) {
      // Static hosting or offline preview: use the generic WhatsApp link.
    }

    renderButton(number);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
