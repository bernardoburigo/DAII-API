const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
let eventsData = require('./src/db/events.json');

function eventsLoad() { //carrega os dados dos eventos pelo arquivo JSON
    try {
        eventsData = JSON.parse(fs.readFileSync('./src/db/events.json', 'utf8'));
        console.log('Dados dos eventos carregados com sucesso.');
    } catch (err) {
        console.log('Erro ao carregar os dados dos eventos:', err);
    }
}

function eventsWrite(data) { //escreve novos dados no arquivo JSON dos eventos
    try {
        fs.writeFileSync('./src/db/events.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos eventos escritos com sucesso.');
    } catch (err) {
        console.error('Não foi possível escrever os dados dos eventos:', err);
    }
}

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retorna a lista de todos os eventos
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Data para filtrar os eventos
 *     responses:
 *       200:
 *         description: A lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       404:
 *         description: Nenhuma consulta encontrada com os critérios fornecidos
 */

router.get('/', (req, res) => { // Método GET que lista todos os registros ou filtra por data
    eventsLoad();
    const { date } = req.query;
    let eventsFilter = eventsData;

    if (date) {
        eventsFilter = eventsFilter.filter(event => event.date.toLowerCase().includes(date.toLowerCase()));
    }

    if (eventsFilter.length === 0) {
        return res.status(404).send('Nenhuma consulta encontrada com os critérios fornecidos.');
    }

    res.json(eventsFilter);
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retorna um evento específico pelo ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: O evento com o ID fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Nenhum evento encontrado com o ID informado
 */

router.get('/:id', (req, res) => { //método GET por ID que lista apenas um registro
    eventsLoad();
    const event = eventsData.find(event => event.id === req.params.id);
    if (!event) return res.status(404).send('Nenhum evento encontrado com o ID informado.');
    res.json(event);
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Atualiza um evento pelo ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Nenhum evento encontrado com o ID informado
 */

router.put('/:id', (req, res) => { //método PUT (Update) que atualiza um registro especificado por ID
    eventsLoad();
    const index = eventsData.findIndex(event => event.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum evento encontrado com o ID informado.');

    eventsData[index] = { ...eventsData[index], ...req.body };
    eventsWrite(eventsData);
    res.json({ message: 'Evento atualizado com sucesso!', event: eventsData[index] });
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Cria um novo evento
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Evento adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */

router.post('/', (req, res) => { // método POST que cadastra um novo registro
    eventsLoad();
    const event = req.body;
    const id = uuidv4();
    const eventWithId = { id, ...event };
    eventsData.push(eventWithId);
    eventsWrite(eventsData);
    res.status(201).json({ message: 'Evento adicionado com sucesso!', event: eventWithId });
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Remove um evento pelo ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento removido com sucesso
 *       404:
 *         description: Nenhum evento encontrado com o ID informado
 */

router.delete('/:id', (req, res) => { // método DELETE que deleta um registro especificado por ID
    eventsLoad();
    const index = eventsData.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Nenhum evento encontrado com o ID informado.');

    eventsData.splice(index, 1);
    eventsWrite(eventsData);
    res.status(200).send({ message: 'Evento removido com sucesso!' });
});

module.exports = router;