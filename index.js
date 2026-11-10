const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const app = express()
const port = process.env.API_PORT
app.use(express.json())

const db = require("./db")

const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")

const cors = require("cors")
app.use(cors())

app.post("/cliente", async (req, res) => {
    try {
        const cliente = req.body
        const senhaCript = bcrypt.hashSync(cliente.senha, 10)
        cliente.senha = senhaCript

        const resultado = await db.pool.query(
            `INSERT INTO cliente (
                nome, cpf, celular, email, senha
            ) VALUES ( ?, ?, ?, ?, ? )`,
            [cliente.nome, cliente.cpf, cliente.celular,
             cliente.email, cliente.senha]
        )
        res.status(201).json({
            msg: "Cliente cadastrado, ID = " + resultado[0].insertId
        })
    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})


app.post("/login", async (req,res) => {
    try {
        const user = req.body
        const resultado = await db.pool.query(
            "SELECT id, nome, email, senha FROM cliente WHERE email = ?", [user.email]
        )
        const dados_bd = resultado[0][0]
        if(!dados_bd) {
            return res.status(401).json({msg: "Email não cadastrado!"})
        }

        const senha_valida = await bcrypt.compare(user.senha, dados_bd.senha)

        if(!senha_valida) {
            return res.status(401).json({msg: "Credenciais inválidas!"})
        }

        const payload = {
            id: dados_bd.id,
            email: dados_bd.email
        } 
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2m' })
        return res.status(200).json({nome: dados_bd.nome, token: token})

    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})

app.get("/cliente/perfil", autenticar, async (req, res)=>{
    try {
        const id = req.usuario.id
        const result = await db.pool.query("SELECT * FROM cliente WHERE id = ?", [id]);
        const perfil = result[0][0]
        delete perfil.senha
        res.status(200).json(perfil)
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
        throw err;
    }
})

app.get("/produto", async (req, res) => {
    try {
        let sql = "SELECT * FROM produto WHERE 1=1"
        const params = []

        // Query Parameters
        const { busca, ordenacao, categoria, preco_min, preco_max, pagina } = req.query

        // 1) Busca por nome (já existia)
        if (busca) {
            sql += " AND nome LIKE ?"
            params.push(`%${busca}%`)
        }

        // 2) Filtro por categoria (ex: categoria=Alimentação)
        if (categoria) {
            sql += " AND categoria = ?"
            params.push(categoria)
        }

        // 3) Filtro por faixa de preço
        if (preco_min !== undefined && preco_min !== "") {
            sql += " AND preco >= ?"
            params.push(Number(preco_min))
        }
        if (preco_max !== undefined && preco_max !== "") {
            sql += " AND preco <= ?"
            params.push(Number(preco_max))
        }

        // 4) Ordenação (já existia)
        if (ordenacao) {
            if (ordenacao === "maior preco") {
                sql += " ORDER BY preco DESC"
            } else {
                sql += " ORDER BY preco ASC"
            }
        }

        // 5) Paginação (LIMIT fixo de 10 + OFFSET dinâmico)
        const LIMIT = 10
        const paginaAtual = Math.max(1, parseInt(pagina) || 1)
        const offset = (paginaAtual - 1) * LIMIT
        sql += " LIMIT ? OFFSET ?"
        params.push(LIMIT, offset)

        const resultado = await db.pool.query(sql, params)

        // Total de itens (sem paginação) — para o front saber quantas páginas existem
        let sqlCount = "SELECT COUNT(*) AS total FROM produto WHERE 1=1"
        const paramsCount = []
        if (busca) {
            sqlCount += " AND nome LIKE ?"
            paramsCount.push(`%${busca}%`)
        }
        if (categoria) {
            sqlCount += " AND categoria = ?"
            paramsCount.push(categoria)
        }
        if (preco_min !== undefined && preco_min !== "") {
            sqlCount += " AND preco >= ?"
            paramsCount.push(Number(preco_min))
        }
        if (preco_max !== undefined && preco_max !== "") {
            sqlCount += " AND preco <= ?"
            paramsCount.push(Number(preco_max))
        }
        const countResult = await db.pool.query(sqlCount, paramsCount)
        const total = countResult[0][0].total
        const totalPaginas = Math.ceil(total / LIMIT)

        res.status(200).json({
            produtos: resultado[0],
            pagina: paginaAtual,
            limite: LIMIT,
            total,
            total_paginas: totalPaginas
        })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

app.get("/produto/:id", async (req, res) => {
    try {
        // Path Parameter
        const id = req.params.id
        const resultado = await db.pool.query("SELECT * FROM produto WHERE id = ?", [id])
        const produto = resultado[0][0]
        res.status(200).json(produto)
    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})


app.listen(port, () => {
    console.log("API rodando na porta " + port)
})

function autenticar(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null){
        return res.status(401).json({erro: "Token não enviado, usar Authorization Bearer <token>"})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({erro: "Token inválido"})
        req.usuario = usuario
        next()
    })   
}
