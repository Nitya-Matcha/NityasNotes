import { useEffect, useState } from "react";

type Note = {
  id: number;
  text: string;
};

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://nityasnotes-backend.onrender.com";

  // -------------------------
  // GET NOTES (source of truth)
  // -------------------------
  async function fetchNotes() {
    try {
      const res = await fetch(`${API_URL}/notes`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }

  // -------------------------
  // ADD NOTE
  // -------------------------
  async function addNote() {
    if (!input.trim()) return;

    setLoading(true);

    try {
      await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      setInput("");
      await fetchNotes(); // IMPORTANT: always refresh from backend
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // DELETE NOTE
  // -------------------------
  async function deleteNote(id: number) {
    try {
      await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
      });

      await fetchNotes(); // refresh after delete
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  // -------------------------
  // INITIAL LOAD
  // -------------------------
  useEffect(() => {
    fetchNotes();
  }, []);

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Nitya's Notes</h1>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter note"
          style={{ flex: 1 }}
        />

        <button onClick={addNote} disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      <ul style={{ marginTop: "20px" }}>
        {notes.map((note) => (
          <li
            key={note.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span>{note.text}</span>

            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;