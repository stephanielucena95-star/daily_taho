
# 🗞️ Daily Taho
**Ang inyong araw-araw na mapagkukunan ng balita.**

Daily Taho is a high-performance, mobile-first news aggregator specifically engineered for the Philippine landscape. It leverages the **Google Gemini API** to transform raw RSS feeds into concise, bilingual (English & Filipino) summaries.

[![GitHub Repo](https://img.shields.io/badge/GitHub-daily__taho-181717.svg?style=flat-square&logo=github)](https://github.com/stephanielucena95-star/daily_taho)

## 🚀 Key Features

- **RSS Container-First Fetching**: Bypasses traditional scraping to fetch structured data directly from major Philippine publishers (GMA, Inquirer, PhilStar, MB, Rappler).
- **AI-Driven Summaries**: Real-time generation of 3-5 sentence summaries in both English and Filipino via **Gemini 3 Flash**.
- **Data Saver Mode**: Optimized for limited bandwidth/4G environments. Disables image fetching to minimize data consumption.
- **The "Perfect Link" Rule**: Advanced validation logic ensures headlines match their URL paths, discarding mis-categorized or broken links.
- **Bilingual Interface**: Seamlessly toggle between English and Filipino summaries.

## 🛠️ Technical Stack

- **Frontend**: React (v19) + TypeScript
- **Styling**: Tailwind CSS (Utility-first newspaper aesthetic)
- **AI Engine**: Google Gemini 3 Flash Preview (via `@google/genai`)
- **Data**: RSS-to-JSON aggregation with cross-origin proxy support.

## 📦 Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/stephanielucena95-star/daily_taho.git
   cd daily_taho
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root and add your Gemini API Key:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## ⚖️ Validation Logic

The application implements a strict **Container-First** approach:
- **Regex Consistency**: Discards items if "Politics" keywords appear in "Weather" URL paths to prevent hallucinated context.
- **Safety Net**: Automatically falls back to the publisher's root domain if RSS links are broken or relative.
- **No-Scrape Policy**: Reliant solely on structured XML data to ensure content integrity and high performance.

---
*Created with ❤️ for the Filipino Community by [Stephanie Lucena](https://github.com/stephanielucena95-star).*
