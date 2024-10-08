const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const appointment = require('./appointmentsRoutes');
const event = require('./eventsRoutes');
const professional = require('./professionalsRoutes');
const student = require('./studentsRoutes');
const teacher = require('./teachersRoutes');
const user = require('./usersRoutes');

router.use(express.json());
router.use('/appointments', appointment );
router.use('/events', event);
router.use('/professionals', professional);
router.use('/students', student);
router.use('/teachers', teacher);
router.use('/users', user);

module.exports = router;
