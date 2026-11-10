// Generates clean Windows-style illustration data URLs for demo screenshots
export function createSampleIllustration(title: string, subtitle: string, accentColor: string = '#0078d4'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141721" />
        <stop offset="100%" stop-color="#1e2230" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="${accentColor}88" />
      </linearGradient>
      <linearGradient id="cardGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="600" height="340" rx="12" fill="url(#bg)" stroke="#2b3145" stroke-width="2"/>
    
    <!-- Windows Fluent Header bar -->
    <rect x="0" y="0" width="600" height="36" rx="12" fill="#181c28"/>
    <rect x="0" y="24" width="600" height="12" fill="#181c28"/>
    <circle cx="20" cy="18" r="5" fill="#ef4444" opacity="0.8"/>
    <circle cx="36" cy="18" r="5" fill="#f59e0b" opacity="0.8"/>
    <circle cx="52" cy="18" r="5" fill="#10b981" opacity="0.8"/>
    <text x="75" y="22" fill="#8e99b0" font-family="Segoe UI, sans-serif" font-size="11" font-weight="500">TaskFlow Preview - Windows Capture</text>
    
    <!-- Workspace Mockup -->
    <rect x="24" y="56" width="552" height="260" rx="8" fill="url(#cardGlow)" stroke="#374151" stroke-width="1"/>
    
    <!-- Left Navigation Bar -->
    <rect x="36" y="68" width="110" height="236" rx="6" fill="#181c28"/>
    <rect x="46" y="82" width="70" height="8" rx="4" fill="${accentColor}" opacity="0.7"/>
    <rect x="46" y="102" width="85" height="6" rx="3" fill="#3b4252"/>
    <rect x="46" y="118" width="65" height="6" rx="3" fill="#3b4252"/>
    <rect x="46" y="134" width="75" height="6" rx="3" fill="#3b4252"/>
    
    <!-- Center Board Cards -->
    <rect x="160" y="68" width="125" height="236" rx="6" fill="#1b202e"/>
    <text x="170" y="88" fill="#e2e8f0" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold">À FAIRE</text>
    <rect x="168" y="98" width="109" height="50" rx="6" fill="#252b3d" stroke="#3b4252"/>
    <rect x="176" y="108" width="60" height="6" rx="3" fill="#94a3b8"/>
    <rect x="176" y="122" width="80" height="5" rx="2" fill="#475569"/>
    <rect x="168" y="156" width="109" height="60" rx="6" fill="#252b3d" stroke="#3b4252"/>
    <rect x="176" y="166" width="70" height="6" rx="3" fill="#94a3b8"/>
    <rect x="176" y="180" width="85" height="5" rx="2" fill="#475569"/>

    <rect x="295" y="68" width="125" height="236" rx="6" fill="#1b202e"/>
    <text x="305" y="88" fill="#60a5fa" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold">EN COURS</text>
    <rect x="303" y="98" width="109" height="75" rx="6" fill="#252b3d" stroke="${accentColor}" stroke-width="1.5"/>
    <rect x="311" y="108" width="75" height="6" rx="3" fill="#60a5fa"/>
    <rect x="311" y="122" width="90" height="5" rx="2" fill="#94a3b8"/>
    <rect x="311" y="134" width="60" height="5" rx="2" fill="#475569"/>
    <rect x="311" y="150" width="80" height="8" rx="4" fill="#1e3a8a"/>

    <rect x="430" y="68" width="130" height="236" rx="6" fill="#1b202e"/>
    <text x="440" y="88" fill="#34d399" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold">FAIT</text>
    <rect x="438" y="98" width="114" height="55" rx="6" fill="#252b3d" stroke="#10b981" stroke-width="1"/>
    <circle cx="450" cy="114" r="5" fill="#10b981"/>
    <rect x="462" y="111" width="70" height="6" rx="3" fill="#a7f3d0"/>
    <rect x="462" y="125" width="50" height="5" rx="2" fill="#475569"/>

    <!-- Bottom Caption Overlay -->
    <rect x="160" y="275" width="400" height="28" rx="6" fill="#0f1117" opacity="0.9"/>
    <text x="175" y="293" fill="#e2e8f0" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600">${title}</text>
    <text x="380" y="293" fill="#94a3b8" font-family="Segoe UI, sans-serif" font-size="10">${subtitle}</text>
  </svg>`;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
