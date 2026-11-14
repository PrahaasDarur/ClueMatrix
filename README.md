# ClueMatrix

A comprehensive backend system designed to ingest, analyze, and structure digital evidence using AI (OCR, NLP) to identify connections and timelines.

---

✨ Features

This platform is designed to solve complex investigative challenges by providing:

*   **Evidence Ingestion:** Securely upload files (Images, PDFs, etc.).
*   **AI Extraction:** Uses OCR to convert images to text, and NLP (spaCy) to extract key entities (People, Dates, Locations).
*   **Data Organization:** Organizes evidence based on the extracted entities.
*   **Relationship Mapping:** Identifies connections between entities (e.g., "Person A communicated with Person B").
*   **Timeline Generation:** Reconstructs a chronological timeline of events.
*   **Data Summarization (Future):** Ability to generate concise summaries of the incident.
*   **User Management (Future):** Support for multiple users and role-based access.

---

⚙️ Prerequisites (What is Needed)

Before you begin setup, ensure you have the following installed on your machine:

1.  **Python 3.x:** (Check your version: `python --version`)
2.  **PostgreSQL Database:** A running PostgreSQL server.
3.  **Tesseract OCR Engine:** This is an external program. **You must install it and add it to your System PATH.** (See instructions for Windows/Mac in the README).

---

🚀 Getting Started (Setup Guide)

Follow these steps precisely to get the backend running:

Step 1: Clone the Repository
Clone this repository to your local machine:
```basht

Step 2: Setup the Environment
python -m venv venv
.\venv\Scripts\activate  # (Use the correct command for your OS)

Step 3: Install Dependencies
Install all required Python packages from the requirements file:
pip install -r requirements.txt

Step 4: Configure the Database

Edit database/session.py and change the DATABASE_URL string to match your actual PostgreSQL credentials (user, password, database name).

Step 5: Run the Server (The Backend)
Run the server in a separate terminal window:
uvicorn main:app --reload
