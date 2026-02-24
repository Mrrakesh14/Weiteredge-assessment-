const generateReply = require("../llm");
const express = require("express");
const router = express.Router();
const db = require("../db");
const fs = require("fs");
const { v4: uuid } = require("uuid");

const docs = JSON.parse(fs.readFileSync("./docs.json", "utf8"));
function findRelevantDocs(question) {
  const q = question.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const doc of docs) {
    const text = (doc.title + " " + doc.content).toLowerCase();

    const words = q.split(" ");
    let score = 0;

    for (const word of words) {
      if (text.includes(word)) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = doc;
    }
  }

  return bestScore > 0 ? bestMatch.content : null;
}
/* ===== Chat Endpoint ===== */
router.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: "Missing sessionId or message",
      });
    }

    const relevantDoc = findRelevantDocs(message);
    if (!relevantDoc) {
      aiReply = "Sorry, I don’t have information about that.";
      res.json({
        reply: aiReply,
        tokensUsed: aiReply.length,
      });
    } else {
      const prompt = `
You are a support assistant.

Answer only from this documentation:

${relevantDoc}

User Question:
${message}
`;

      aiReply = await generateReply(prompt);
      res.json({
        reply: aiReply,
        tokensUsed: aiReply.length,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "LLM error" });
  }
});

/* ===== Fetch Conversation ===== */
router.get("/conversations/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  db.all(
    `SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
    [sessionId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    },
  );
});

/* ===== List Sessions ===== */
router.get("/sessions", (req, res) => {
  db.all(`SELECT * FROM sessions`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

module.exports = router;
