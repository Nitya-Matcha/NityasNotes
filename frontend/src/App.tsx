import { useEffect, useState } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");

  // GET notes
  async function fetchNotes() {
    const res = await fetch("http://127.0.0.1:8000/notes");
    const data = await res.json();
    setNotes(data);
  }
//deleten note
  async function deleteNote(id: number) {
  await fetch(`http://127.0.0.1:8000/notes/${id}`, {
    method: "DELETE",
  });

  fetchNotes();
}

  // POST note
  async function addNote() {
    await fetch("http://127.0.0.1:8000/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: input })
    });

    setInput("");
    fetchNotes();
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Nitya's Notes</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter note"
      />

      <button onClick={addNote}>Add</button>

      <ul>
  {notes.map((note: any) => (
    <li key={note.id} style={{ display: "flex", gap: "10px" }}>
      <span>{note.text}</span>

      <button onClick={() => deleteNote(note.id)}>
        Delete
      </button>
    </li>
  ))}
</ul>
    </div>
  );
}

export default App;