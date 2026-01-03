<div align="center">

# 🍽️ 3D Digital Menu

**A high-performance, multi-template digital menu for restaurants featuring AR/3D visualization and real-time ordering.**

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
    <img src="https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge&logo=supabase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwindcss" />
    <img src="https://img.shields.io/badge/3D-ModelViewer-orange?style=for-the-badge&logo=google" />
  </p>

[View Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Key Features

This project redefines the dining experience with a focus on visual fidelity and performance.

- 🎨 **Multi-Template Architecture:** Seamlessly switch between **Modern**, **Classic**, and the new **Cinematic 3D** themes via database config.
- 📦 **Immersive 3D & AR:** Interactive 360° product visualization with **Smart Blur Loading** (seamless poster-to-model transition) and fixed-scale Augmented Reality.
- ⚡ **Real-time Cart & Ordering:** Instant order syncing using Supabase Realtime channels (Draft/Pending states).
- 🎥 **Smart Media Engine:** Intelligent video handling that serves `.mov` (HEVC) to iOS and `.webm` to Android/Web for optimal performance.
- 📱 **Responsive & Native-Like:** Smooth animations and gesture-based interactions tailored for mobile users.

## 🏗️ Project Structure

Designed for scalability. Templates are isolated, logic is shared.

```bash
src/
├── app/
│   └── [slug]/[table_id]/    # Dynamic Routing Entry
├── components/
│   ├── ui/                   # Global Shared Components (SmartMedia, ARViewer)
│   └── templates/
│       ├── modern/           # 🌑 Modern Theme (Grid Layout, Dark Mode)
│       ├── classic/          # 📜 Classic Theme (Row Layout, Serif Fonts)
│       └── three-d/          # 🧊 3D 360 Theme (R3F, Floating Items, Blur Loader)
├── hooks/                    # Custom Hooks (useCart, Realtime logic)
└── lib/                      # Supabase Client & Utils
```

## 📸 Screenshots

<div align="center">

### Modern Template (Dark)

<img src="https://via.placeholder.com/300x600?text=Modern+UI" alt="Modern UI" width="250"/>

### Classic Template (Light)

<img src="https://via.placeholder.com/300x600?text=Classic+UI" alt="Classic UI" width="250"/>

</div>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  
Built with ❤️ by <b>Erfan</b>

</div>
