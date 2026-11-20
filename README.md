# ⚽ EPL Auction Platform (Premier League Broadcast Edition)

A broadcast-grade real-time player auction management platform designed for auditorium projectors, franchise bidding desks, and auctioneer control in high-visibility **Light Mode**.

## ✨ Features & Upgrades

- **Permanent Broadcast Light Mode**:
  - Crisp, professional television-broadcast light theme (`#f1f5f9` / `#ffffff`) with crimson red accents (`#dc2626`).
  - High-contrast typography designed for large auditorium projectors and desktop monitors.
  - Switch button removed to ensure a consistent, clean light broadcast experience.

- **Squad of 10 Players Cap per Franchise**:
  - Each team roster is limited to exactly **10 players**.
  - Automated bidding lockout: teams that reach 10 players are flagged as **Squad Full** and prevented from bidding.
  - Live paddle and squad trackers display real-time capacity (e.g. `Squad: 7/10`).

- **Streamlined Player Registration**:
  - Country name and overseas requirements removed from the player registration form for a faster, cleaner setup.
  - High-visibility player showcase with star rating (`★ 98 RATING`), role classification, and career stats.

- **Franchise Photo / Logo URL Integration**:
  - Add custom franchise logos and photo URLs directly in the **Registry & Setup** view.
  - Live thumbnail preview when entering logo URLs.
  - Team logos rendered across interactive bidding paddles, leader spotlight, and squad breakdown pages.

- **10,000 Points Purse Economy**:
  - Each franchise starts with a **10,000 Points (PTS)** purse.
  - Dynamic quick increments: `+25`, `+50`, `+100`, `+200`, `+500`, `+1,000 PTS`.
  - Custom bidding field with automated point sufficiency validation.

- **Real-Time Auction & Roster Management**:
  - Live gavel countdown clock with audio ticks and hammer strike sound effects.
  - Confetti burst on "SOLD" hammer strike.
  - Instant **Undo Sale** rollback engine (reverses sale, refunds points, resets player).
  - One-click squad CSV export for league officials and team owners.

## 🚀 Running Locally

```bash
# Navigate to project
cd c:\Users\acer\OneDrive\Desktop\auction

# Start the dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.
Click the **Projector Mode** icon in the header for fullscreen stage display!
