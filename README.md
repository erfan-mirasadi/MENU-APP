<div align="center">

# 🍽️ Next.js 3D Digital Menu

**A high-performance, multi-template digital menu for restaurants featuring AR/3D visualization and real-time ordering.**

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
    <img src="https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge&logo=supabase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwindcss" />
    <img src="https://img.shields.io/badge/3D-ModelViewer-orange?style=for-the-badge&logo=google" />
  </p>

[View Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Key Features

This project redefines the dining experience with a focus on visual fidelity, performance, and ease of use.

- 🎨 **Multi-Template Architecture:** Seamlessly switch between **Modern** (Dark/Neon) and **Classic** (Luxury/Paper) themes via database config.
- 📦 **Advanced AR & 3D Integration:** High-performance 3D product visualization with smooth transitions and fixed-scale AR using `@google/model-viewer`.
- ⚡ **Real-time Cart & Ordering:** Instant order syncing using Supabase Realtime channels (Draft/Pending states).
- 📷 **Dynamic QR Code System:** Integrated QR code generator with custom styles (round, classy), logo support, and live preview for each table.
- 🎥 **Smart Media Engine:** Intelligent video handling that serves `.mov` (HEVC) to iOS and `.webm` to Android/Web for optimal performance.
- 📱 **Responsive & Native-Like:** Smooth animations and gesture-based interactions tailored for mobile users.
- 🚀 **Modern Tech Stack:** Built on Next.js 16, React 19, and Three.js for cutting-edge performance.

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
│       └── classic/          # 📜 Classic Theme (Row Layout, Serif Fonts)
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
