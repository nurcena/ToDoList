import React, { useState, useEffect } from 'react';
// Firestore/Firebase yerine, uygulamanın basitliğini korumak için 
// şimdilik verileri tarayıcının yerel depolama alanında (localStorage) tutacağız.

// To-Do Arayüzü (Interface)
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  // 1. To-Do Listesini tutan durum (state). İlk yüklemede localStorage'dan çekiyoruz.
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('react-todoist-todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  // 2. Yeni eklenecek To-Do'nun metnini tutan durum
  const [newTodoText, setNewTodoText] = useState<string>('');

  // 3. Düzenlenen görev için ID ve metni tutan durum
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');

  // ⭐️ YENİ: Veri Kaydı (Persistence)
  // 'todos' state'i her değiştiğinde localStorage'ı güncelleyen useEffect
  useEffect(() => {
    localStorage.setItem('react-todoist-todos', JSON.stringify(todos));
  }, [todos]);

  // Yeni To-Do Ekleme İşlevi
  const handleAddTodo = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedText = newTodoText.trim();
    if (trimmedText === '') {
      return;
    }

    const newTodo: Todo = {
      // Rastgele bir ID oluşturmak için Math.random kullanabiliriz
      id: Date.now(),
      text: trimmedText,
      completed: false,
    };

    setTodos([newTodo, ...todos]); // Yeni görevleri listenin başına ekle
    setNewTodoText('');
  };

  // Tamamlanma durumunu değiştiren fonksiyon
  const handleToggleComplete = (id: number) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed
        };
      }
      return todo;
    });

    setTodos(updatedTodos);
  };

  // To-Do Silme İşlevi
  const handleDeleteTodo = (id: number) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
  };

  // ⭐️ YENİ: Düzenleme Başlatma İşlevi
  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  // ⭐️ YENİ: Düzenleme Kaydetme İşlevi
  const handleSaveEdit = (id: number) => {
    if (editText.trim() === '') {
      handleDeleteTodo(id); // Metin boşsa sil
      setEditingId(null);
      return;
    }

    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          text: editText.trim()
        };
      }
      return todo;
    });

    setTodos(updatedTodos);
    setEditingId(null);
  };

  return (
    <div className="todo-container">
      <style>{`
        /* --- Todoist Benzeri STİLLER --- */
        
        /* Font ve Arka Plan */
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f6f6f6; /* Açık gri arka plan */
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 20px;
          margin: 0;
          min-height: 100vh;
        }
        
        /* Ana Kapsayıcı */
        .todo-container {
          background-color: #ffffff;
          padding: 24px 30px;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Yumuşak gölge */
          width: 100%;
          max-width: 600px;
          border: 1px solid #eee;
        }
        
        /* Başlık */
        .title {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
          font-size: 1.75rem;
          font-weight: 800;
          padding-bottom: 10px;
          border-bottom: 3px solid #db4c3f; /* Todoist Kırmızı/Mercan rengi */
        }
        
        /* Form */
        .input-form {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
        }
        
        .todo-input {
          flex-grow: 1;
          padding: 12px 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .todo-input:focus {
          outline: none;
          border-color: #db4c3f;
          box-shadow: 0 0 0 2px rgba(219, 76, 63, 0.3);
        }
        
        /* Ekle Butonu */
        .add-button {
          padding: 10px 18px;
          background-color: #db4c3f;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background-color 0.2s, transform 0.1s;
        }
        
        .add-button:hover {
          background-color: #c03e31;
        }
        
        .add-button:active {
            transform: scale(0.98);
        }

        /* Liste */
        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .empty-message {
            text-align: center;
            color: #999;
            padding: 30px 0;
        }
        
        .todo-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
        }
        
        .todo-item:last-child {
          border-bottom: none;
        }
        
        /* Checkbox ve Metin */
        .todo-checkbox {
          appearance: none;
          min-width: 18px;
          min-height: 18px;
          border: 2px solid #ccc;
          border-radius: 50%; /* Daire şeklinde checkbox */
          cursor: pointer;
          margin-right: 15px;
          transition: background-color 0.2s, border-color 0.2s;
          position: relative;
        }

        .todo-checkbox:checked {
            border-color: #10b981; /* Yeşil sınır */
            background-color: #10b981; /* Yeşil dolgu */
        }
        
        .todo-checkbox:checked::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 10px;
        }

        .todo-text, .edit-input {
          flex-grow: 1;
          font-size: 1rem;
          color: #333;
        }
        
        /* Tamamlanmış öğe stili */
        .todo-item.completed .todo-text {
          text-decoration: line-through;
          color: #999;
        }
        
        /* Düzenleme Girişi */
        .edit-input {
            padding: 5px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-left: -5px; /* Hizalamak için */
        }

        /* Aksiyon Butonları */
        .action-buttons {
            margin-left: 10px;
            display: flex;
            gap: 5px;
        }

        .action-button {
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            padding: 5px;
            font-size: 1rem;
            transition: color 0.2s;
        }

        .action-button:hover {
            color: #333;
        }
        
        .delete-button:hover {
            color: #db4c3f;
        }

        .save-button {
            color: #10b981;
        }
        .save-button:hover {
            color: #059669;
        }

        .cancel-button {
            color: #ef4444;
        }
        .cancel-button:hover {
            color: #dc2626;
        }

        .edit-icon:hover {
            color: #3b82f6; /* Mavi */
        }
      `}</style>

      <h1 className="title">Todoist Benzeri Liste</h1>

      {/* 🚀 To-Do Ekleme Formu */}
      <form onSubmit={handleAddTodo} className="input-form">
        <input
          type="text"
          placeholder="Yeni bir görev yazın..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          className="todo-input"
          disabled={editingId !== null} // Düzenleme varken yeni eklemeyi engelle
        />
        <button
          type="submit"
          className="add-button"
          disabled={editingId !== null}
        >
          Ekle
        </button>
      </form>

      {/* 📋 To-Do Listesi */}
      <ul className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-message">Hiç göreviniz yok. Rahatlayın veya bir tane ekleyin!</p>
        ) : (
          todos.map(todo => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              {editingId === todo.id ? (
                // Düzenleme Modu
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(todo.id);
                      } else if (e.key === 'Escape') {
                        setEditingId(null); // Esc ile iptal
                      }
                    }}
                  />
                  <div className="action-buttons">
                    {/* Kaydet Butonu */}
                    <button
                      onClick={() => handleSaveEdit(todo.id)}
                      className="action-button save-button"
                      aria-label="Kaydet"
                    >
                      &#x2714; {/* Tik işareti */}
                    </button>
                    {/* İptal Butonu */}
                    <button
                      onClick={() => setEditingId(null)}
                      className="action-button cancel-button"
                      aria-label="İptal"
                    >
                      &#x2715; {/* Çarpı işareti (X) */}
                    </button>
                  </div>
                </>
              ) : (
                // Normal Görüntüleme Modu
                <>
                  {/* Checkbox ile tamamlama durumu kontrolü */}
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo.id)}
                    className="todo-checkbox"
                  />

                  <span className="todo-text" onDoubleClick={() => handleStartEdit(todo)}>
                    {todo.text}
                  </span>

                  <div className="action-buttons">
                    {/* Düzenleme Butonu */}
                    <button
                      onClick={() => handleStartEdit(todo)}
                      className="action-button edit-icon"
                      aria-label="Düzenle"
                      title="Görevi Düzenle (çift tıklayarak da düzenleyebilirsiniz)"
                    >
                      &#9998; {/* Kalem simgesi */}
                    </button>

                    {/* Silme Butonu */}
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="action-button delete-button"
                      aria-label={`Görevi sil: ${todo.text}`}
                      title="Görevi Sil"
                    >
                      &#128465; {/* Çöp Kutusu simgesi */}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;