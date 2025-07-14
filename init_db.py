import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    mes TEXT,
    tipo TEXT CHECK(tipo IN ('receita','despesa')),
    descricao TEXT,
    valor REAL,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
)
""")

conn.commit()
conn.close()
print("Banco criado com sucesso!")
