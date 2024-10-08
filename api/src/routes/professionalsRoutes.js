const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let professionalsData = require('../db/professionals.json');

function professionalsLoad() { //carrega os dados dos profissionais pelo arquivo JSON
    try {
        professionalsData = JSON.parse(fs.readFileSync('./src/db/professionals.json', 'utf8'));
        console.log('Dados dos profissionais carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados dos profissionais:', err);
    }
}

function professionalsWrite(data) { //escreve novos dados no arquivo JSON dos profissionais
    try {
        fs.writeFileSync('./src/db/professionals.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos profissionais escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados dos profissionais:', err);
    }
}

/**
 * @swagger
 * /professionals:
 *   get:
 *     summary: Retorna a lista de todos os profissionais
 *     tags: [professional]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nome para filtrar os profissionais
 *     responses:
 *       200:
 *         description: A lista de profissionais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/professional'
 *       404:
 *         description: Nenhuma consulta encontrada com os critérios fornecidos
 */

router.get('/', (req, res) => { // Método GET que lista todos os registros ou filtra por nome
    professionalsLoad();
    const { name } = req.query;
    let professionalsFilter = professionalsData;

    if (name) {
        professionalsFilter = professionalsFilter.filter(professional => professional.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (professionalsFilter.length === 0) {
        return res.status(404).send('Nenhuma consulta encontrada com os critérios fornecidos.');
    }

    res.json(professionalsFilter);
});

/**
 * @swagger
 * /professionals/{id}:
 *   get:
 *     summary: Retorna um profissional específico pelo ID
 *     tags: [professional]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do profissional
 *     responses:
 *       200:
 *         description: O profissional com o ID fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/professional'
 *       404:
 *         description: Nenhum profissional encontrado com o ID informado
 */

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    professionalsLoad();
    const professional = professionalsData.find(professional => professional.id === req.params.id);
    if (!professional) return res.status(404).send('Nenhum profissional encontrado com o ID informado.');
    res.json(professional);
});

/**
 * @swagger
 * /professionals/{id}:
 *   put:
 *     summary: Atualiza um profissional pelo ID
 *     tags: [professional]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do profissional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/professional'
 *     responses:
 *       200:
 *         description: Profissional atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/professional'
 *       404:
 *         description: Nenhum profissional encontrado com o ID informado
 */

router.put('/:id', (req, res) => { //método PUT (Upname) que atualiza um registro especificado por ID
    professionalsLoad();
    const index = professionalsData.findIndex(professional => professional.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum profissional encontrado com o ID informado.');

    professionalsData[index] = { ...professionalsData[index], ...req.body };
    professionalsWrite(professionalsData);
    res.json({ message: 'Profissional atualizado com sucesso!', professional: professionalsData[index] });
});

/**
 * @swagger
 * /professionals:
 *   post:
 *     summary: Cria um novo profissional
 *     tags: [professional]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/professional'
 *     responses:
 *       201:
 *         description: Profissional adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/professional'
 */

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    professionalsLoad();
    const professional = req.body;
    const id = uuidv4();
    const professionalWithId = { id, ...professional };
    professionalsData.push(professionalWithId);
    professionalsWrite(professionalsData);
    res.status(201).json({ message: 'Profissional adicionado com sucesso!', professional: professionalWithId });
});

/**
 * @swagger
 * /professionals/{id}:
 *   delete:
 *     summary: Remove um profissional pelo ID
 *     tags: [professional]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do profissional
 *     responses:
 *       200:
 *         description: Profissional removido com sucesso
 *       404:
 *         description: Nenhum profissional encontrado com o ID informado
 */

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    professionalsLoad();
    const index = professionalsData.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum profissional encontrado com o ID informado.');

    professionalsData.splice(index, 1);
    professionalsWrite(professionalsData);
    res.status(200).send({ message: 'Profissional removido com sucesso!' });
});

module.exports = router;