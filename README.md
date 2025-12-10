# Nexus - The Ultimate Gamer Chat

Nexus is a next-generation instant messaging and community platform built specifically for gamers. It combines high-fidelity UI, low-latency communication features, and deeply integrated AI tools to provide a seamless experience for esports teams, casual lobbies, and gaming communities.

![Nexus Hero](https://picsum.photos/id/132/800/300)

## 🚀 Key Features

### 💬 Advanced Chat System
*   **Rich Text & Media**: Support for text, images, emojis, and file uploads.
*   **Interactive Messages**: Polls, gifting system (Nexus Nitro, Game Pass), and reactions.
*   **Context Actions**: Right-click (or kebab menu) to **Forward**, **Copy**, or **Report** messages.
*   **Organization**: Threaded replies, pinned messages, and message filtering by user/keyword/type.
*   **Visuals**: Compact vs Comfortable density modes.

### 🤖 AI-Powered Companion (Gemini 2.5)
Powered by Google's **Gemini 2.5 Flash** and **Flash-Image** models.
*   **Strategy Analysis**: Use `/strat [topic]` to get deep strategic advice for your game (e.g., "how to counter Zerg rush") using advanced reasoning.
*   **Image Generation**: Use `/image [prompt]` to generate unique assets or concept art on the fly.
*   **Real-time News**: Use `/news [topic]` to fetch grounded news updates and patch notes via Google Search.
*   **Contextual Chat**: The AI participates in conversations, offering tips and lore explanations.

### 🎮 Gaming Hub
*   **Tournaments**: Browse, register for, and "watch" live esports events with dynamic status overlays.
*   **Clips**: View community highlights and replays.
*   **Leaderboards**: Track global rankings across supported games with rank change indicators.

### 🔊 Audio & Immersion
*   **Smart Notifications**: Custom sound effects for new messages and mentions (configurable).
*   **Soundboard**: Built-in instant sound effects (Airhorn, GG WP, Oof, Level Up) for hype moments.
*   **Music Player**: Integrated mini-player for background lo-fi/gaming beats.
*   **Voice Channels**: UI support for voice channel management (mute, deafen, active user lists).

### 👤 Profile & Progression
*   **XP System**: Earn XP by chatting and participating. Unlock levels and badges.
*   **Customization**: Dynamic banners, avatars, and bio editing.
*   **Stats**: View win rates, ranks, and match history for connected games (LoL, Valorant, Apex, etc.).

### ⚙️ Settings & Customization
*   **Themes**: Switch between Cyberpunk (Default), Midnight (OLED Dark), and Daylight (Light) modes.
*   **Audio Control**: specific volume sliders and toggles for system sounds.
*   **Streamer Mode**: Options to hide personal information.
*   **Keybinds**: Customizable keyboard shortcuts for power users.

### ✨ UX/UI
*   **Splash Screen**: Cinematic loading sequence.
*   **Animations**: Smooth layout transitions, hover effects, and micro-interactions.
*   **Interactive Footer**: Access downloads, support, and status pages directly within the app.

## 🛠️ Tech Stack

*   **Frontend**: React 19
*   **Styling**: Tailwind CSS (Custom config for animations, glassmorphism, and cyberpunk color palette)
*   **Icons**: Lucide React
*   **AI SDK**: `@google/genai` (Google Gemini API)
*   **Language**: TypeScript

## 📦 Project Structure

```bash
/
├── components/
│   ├── Auth.tsx           # Login/Register screens
│   ├── ChatInterface.tsx  # Main message list, input area, and filtering
│   ├── Dashboard.tsx      # Main application layout manager
│   ├── GamingHub.tsx      # Tournaments, clips, and leaderboards view
│   ├── Landing.tsx        # Marketing landing page with 3D mockups
│   ├── Profile.tsx        # User profile modal and editing
│   ├── Sidebars.tsx       # Server and Channel navigation
│   ├── SplashScreen.tsx   # Initial loading animation
│   └── UIComponents.tsx   # Reusable UI kit (Buttons, Modals, Inputs)
├── services/
│   └── gemini.ts          # AI API integration logic
├── constants.ts           # Mock data (Users, Servers, Items, Sounds) and configuration
├── types.ts               # TypeScript interfaces
├── App.tsx                # Root component and View State management
└── index.tsx              # Entry point
```

## ⌨️ Commands

| Command | Description |
| :--- | :--- |
| `/image [prompt]` | Generate an AI image based on the prompt. |
| `/strat [query]` | Ask the AI for detailed gaming strategy or analysis. |
| `/news [topic]` | Get real-time news grounded in Google Search. |
| `/roll` | Roll a random number (1-100). |
| `/flip` | Flip a coin (Heads/Tails). |
| `/clear` | Clear the local chat history. |

## 🔧 Setup

1.  Clone the repository.
2.  Install dependencies.
3.  Ensure a valid `API_KEY` is present in the environment variables for Google GenAI features to work.
4.  Run the application.

---
*Built with ❤️ for gamers.*