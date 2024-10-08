const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let appointmentsData = require('../db/appointments.json');

/**
 * @swagger
 * components:
 *   schemas:
 *     appointment:
 *       type: object
 *       required:
 *         - date
 *         - professional
 *         - student
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para a consulta
 *         date:
 *           type: string
 *           description: Data da consulta
 *         professional:
 *           type: string
 *           description: Profissional da consulta
 *         student:
 *           type: string
 *           description: Estudante da consulta
 */

function appointmentsLoad() { //carrega os dados das consultas pelo arquivo JSON
    try {
        appointmentsData = JSON.parse(fs.readFileSync('./src/db/appointments.json', 'utf8'));
        console.log('Dados das consultas carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados das consultas:', err);
    }
}

function appointmentsWrite(data) { //escreve novos dados no arquivo JSON das consultas
    try {
        fs.writeFileSync('./src/db/appointments.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados das consultas escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados das consultas:', err);
    }
}

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Retorna a lista de todas as consultas
 *     tags: [appointment]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Data para filtrar as consultas
 *     responses:
 *       200:
 *         description: A lista de consultas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/appointment'
 *       404:
 *         description: Nenhuma consulta encontrada com os critérios fornecidos
 */

router.get('/', (req, res) => { // Método GET que lista todos os registros ou filtra por data
    appointmentsLoad();
    const { date } = req.query;
    let appointmentsFilter = appointmentsData;

    if (date) {
        appointmentsFilter = appointmentsFilter.filter(appointment => appointment.date.toLowerCase().includes(date.toLowerCase()));
    }

    if (appointmentsFilter.length === 0) {
        return res.status(404).send('Nenhuma consulta encontrada com os critérios fornecidos.');
    }

    res.json(appointmentsFilter);
});

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Retorna uma consulta específica pelo ID
 *     tags: [appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da consulta
 *     responses:
 *       200:
 *         description: A consulta com o ID fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/appointment'
 *       404:
 *         description: Nenhuma consulta encontrada com o ID informado
 */

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    appointmentsLoad();
    const appointment = appointmentsData.find(appointment => appointment.id === req.params.id);
    if (!appointment) return res.status(404).send('Nenhuma consulta encontrada com o ID informado.');
    res.json(appointment);
});

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Atualiza uma consulta pelo ID
 *     tags: [appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da consulta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/appointment'
 *     responses:
 *       200:
 *         description: Consulta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/appointment'
 *       404:
 *         description: Nenhuma consulta encontrada com o ID informado
 */

router.put('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    appointmentsLoad();
    const index = appointmentsData.findIndex(appointment => appointment.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhuma consulta encontrada com o ID informado.');

    appointmentsData[index] = { ...appointmentsData[index], ...req.body };
    appointmentsWrite(appointmentsData);
    res.json({ message: 'Consulta atualizada com sucesso!', appointment: appointmentsData[index] });
});

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Cria uma nova consulta
 *     tags: [appointment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/appointment'
 *     responses:
 *       201:
 *         description: Consulta adicionada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/appointment'
 */

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    appointmentsLoad();
    const appointment = req.body;
    const id = uuidv4();
    const appointmentWithId = { id, ...appointment };
    appointmentsData.push(appointmentWithId);
    appointmentsWrite(appointmentsData);
    res.status(201).json({ message: 'Consulta adicionada com sucesso!', appointment: appointmentWithId });
});

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Remove uma consulta pelo ID
 *     tags: [appointment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da consulta
 *     responses:
 *       200:
 *         description: Consulta removida com sucesso
 *       404:
 *         description: Nenhuma consulta encontrada com o ID informado
 */

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    appointmentsLoad();
    const index = appointmentsData.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhuma consulta encontrada com o ID informado.');

    appointmentsData.splice(index, 1);
    appointmentsWrite(appointmentsData);
    res.status(200).send({ message: 'Consulta removida com sucesso!' });
});

module.exports = router;