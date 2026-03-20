(function() {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var shopSlug = script.getAttribute('data-shop');
  if (!shopSlug) {
    console.error('[MeetVault] Missing data-shop attribute on embed script');
    return;
  }

  var baseUrl = script.src.replace('/embed.js', '');
  var bookingUrl = baseUrl + '/book/' + shopSlug;
  var buttonText = script.getAttribute('data-text') || 'Book Now';
  var position = script.getAttribute('data-position') || 'bottom-right';
  var color = script.getAttribute('data-color') || '#f59e0b';

  // Positioning
  var posStyles = {
    'bottom-right': 'bottom:24px;right:24px;',
    'bottom-left': 'bottom:24px;left:24px;',
    'top-right': 'top:24px;right:24px;',
    'top-left': 'top:24px;left:24px;',
  };

  // Create floating button
  var btn = document.createElement('a');
  btn.href = bookingUrl;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.textContent = buttonText;
  btn.setAttribute('aria-label', 'Book an appointment');
  btn.style.cssText = [
    'position:fixed;',
    posStyles[position] || posStyles['bottom-right'],
    'z-index:9999;',
    'display:inline-flex;',
    'align-items:center;',
    'gap:8px;',
    'padding:14px 24px;',
    'background:' + color + ';',
    'color:#0f172a;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    'font-size:15px;',
    'font-weight:700;',
    'border-radius:16px;',
    'text-decoration:none;',
    'box-shadow:0 8px 24px rgba(0,0,0,0.15),0 2px 8px ' + color + '33;',
    'transition:transform 0.15s ease,box-shadow 0.15s ease;',
    'cursor:pointer;',
  ].join('');

  // Hover effect
  btn.addEventListener('mouseenter', function() {
    btn.style.transform = 'translateY(-2px)';
    btn.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2),0 4px 12px ' + color + '44';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15),0 2px 8px ' + color + '33';
  });

  // Calendar icon SVG
  var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '18');
  icon.setAttribute('height', '18');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '2');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.innerHTML = '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>';

  btn.insertBefore(icon, btn.firstChild);

  // Inject into page
  document.body.appendChild(btn);
})();
