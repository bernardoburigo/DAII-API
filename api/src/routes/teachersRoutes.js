const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let teachersData = require('../db/teachers.json');

/**
 * @swagger
 * components:
 *   schemas:
 *     teacher:
 *       type: object
 *       required:
 *         - name
 *         - contact
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o estudante
 *         name:
 *           type: string
 *           description: Nome do estudante
 *         contact:
 *           type: string
 *           description: Contato do professor
 */

function teachersLoad() { //carrega os dados dos professores pelo arquivo JSON
    try {
        teachersData = JSON.parse(fs.readFileSync('./src/db/teachers.json', 'utf8'));
        console.log('Dados dos professores carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados dos professores:', err);
    }
}

function teachersWrite(data) { //escreve novos dados no arquivo JSON dos professores
    try {
        fs.writeFileSync('./src/db/teachers.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos professores escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados dos professores:', err);
    }
}

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Retorna a lista de todos os professores
 *     tags: [teacher]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nome para filtrar os professores
 *     responses:
 *       200:
 *         description: A lista de professores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/teacher'
 *       404:
 *         description: Nenhuma consulta encontrada com os critérios fornecidos
 */


router.get('/', (req, res) => { // Método GET que lista todos os registros ou filtra por nome
    teachersLoad();
    const { name } = req.query;
    let teachersFilter = teachersData;

    if (name) {
        teachersFilter = teachersFilter.filter(teacher => teacher.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (teachersFilter.length === 0) {
        return res.status(404).send('Nenhuma consulta encontrada com os critérios fornecidos.');
    }

    res.json(teachersFilter);
});

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Retorna um professor específico pelo ID
 *     tags: [teacher]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do professor
 *     responses:
 *       200:
 *         description: O professor com o ID fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/teacher'
 *       404:
 *         description: Nenhum professor encontrado com o ID informado
 */

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    teachersLoad();
    const teacher = teachersData.find(teacher => teacher.id === req.params.id);
    if (!teacher) return res.status(404).send('Nenhum professor encontrado com o ID informado.');
    res.json(teacher);
});

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Atualiza um professor pelo ID
 *     tags: [teacher]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do professor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/teacher'
 *     responses:
 *       200:
 *         description: Professor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/teacher'
 *       404:
 *         description: Nenhum professor encontrado com o ID informado
 */

router.put('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    teachersLoad();
    const index = teachersData.findIndex(teacher => teacher.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum professor encontrado com o ID informado.');

    teachersData[index] = { ...teachersData[index], ...req.body };
    teachersWrite(teachersData);
    res.json({ message: 'Professor atualizado com sucesso!', teacher: teachersData[index] });
});

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Cria um novo professor
 *     tags: [teacher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/teacher'
 *     responses:
 *       201:
 *         description: Professor adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/teacher'
 */

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    teachersLoad();
    const teacher = req.body;
    const id = uuidv4();
    const teacherWithId = { id, ...teacher };
    teachersData.push(teacherWithId);
    teachersWrite(teachersData);
    res.status(201).json({ message: 'Professor adicionado com sucesso!', teacher: teacherWithId });
});

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Remove um professor pelo ID
 *     tags: [teacher]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do professor
 *     responses:
 *       200:
 *         description: Professor removido com sucesso
 *       404:
 *         description: Nenhum professor encontrado com o ID informado
 */

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    teachersLoad();
    const index = teachersData.findIndex(teacher => teacher.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum professor encontrado com o ID informado.');

    teachersData.splice(index, 1);
    teachersWrite(teachersData);
    res.status(200).send({ message: 'Professor removido com sucesso!' });
});

module.exports = router;