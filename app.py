from flask import Flask, render_template, request, redirect, session, url_for
import sqlite3

app = Flask(__name__)
app.secret_key = 'segredo123'

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return redirect('/login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['usuario'].strip().lower()
        senha = request.form['senha']
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE (email=? OR nome=?) AND senha=?", (usuario, usuario, senha))
        user = cursor.fetchone()
        if user:
            session['usuario_id'] = user['id']
            session['nome'] = user['nome']
            return redirect('/painel')
        else:
            return render_template('index.html', erro="Usuário ou senha inválidos")
    return render_template('index.html')

@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        nome = request.form['nome'].strip()
        email = request.form['email'].strip().lower()
        senha = request.form['senha']
        conn = get_db()
        try:
            conn.execute("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", (nome, email, senha))
            conn.commit()
            return redirect('/login')
        except sqlite3.IntegrityError:
            return render_template('registro.html', erro="Email já cadastrado")
    return render_template('registro.html')

@app.route('/painel', methods=['GET', 'POST'])
def painel():
    if 'usuario_id' not in session:
        return redirect('/login')

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        tipo = request.form['tipo']
        mes = request.form['mes']
        descricao = request.form['descricao']
        valor = float(request.form['valor'])
        cursor.execute(
            "INSERT INTO transacoes (usuario_id, mes, tipo, descricao, valor) VALUES (?, ?, ?, ?, ?)",
            (session['usuario_id'], mes, tipo, descricao, valor)
        )
        conn.commit()

    cursor.execute("SELECT * FROM transacoes WHERE usuario_id = ?", (session['usuario_id'],))
    transacoes = cursor.fetchall()
    return render_template('painel.html', nome=session['nome'], transacoes=transacoes)

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

if __name__ == '__main__':
    app.run(debug=True)
