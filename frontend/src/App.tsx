import { useEffect, useState } from "react";

type Note = {
  id: number;
  text: string;
};

const API_URL = "https://nityasnotes-backend.onrender.com";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // GET notes
  async function fetchNotes() {
    try {
      const res = await fetch(`${API_URL}/notes`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  // ADD note (optimistic UI update)
  async function addNote() {
    if (!input.trim()) return;

    const tempText = input;

    // optimistic update (instant UI)
    const tempNote: Note = {
      id: Date.now(), // temporary id
      text: tempText,
    };

    setNotes((prev) => [...prev, tempNote]);
    setInput("");

    try {
      const res = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tempText }),
      });

      const newNote = await res.json();

      // replace temp note with real note from backend
      setNotes((prev) =>
        prev.map((note) => (note.id === tempNote.id ? newNote : note))
      );
    } catch (err) {
      console.error("Failed to add note:", err);

      // rollback if failed
      setNotes((prev) => prev.filter((n) => n.id !== tempNote.id));
    }
  }

  // DELETE note (instant UI update)
  async function deleteNote(id: number) {
    const oldNotes = notes;

    // optimistic remove
    setNotes((prev) => prev.filter((note) => note.id !== id));

    try {
      await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete note:", err);

      // rollback
      setNotes(oldNotes);
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>Nitya's Notes</h1>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter note"
          style={{ flex: 1 }}
        />

        <button onClick={addNote}>Add</button>
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