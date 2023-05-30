const express = require('express')
const router = express.Router()
const {adminAuthenticationMiddleware} = require('../middleware/auth')
const {listAll, newModel, getOne, updateOne, deleteOne,makeItDone} = require('../controllers/todo.controller')
router.route('/utku').post(makeItDone)
router.route('/').get(listAll)
// router.route('/').get(getOne)
router.route('/').put(updateOne)
router.route('/').post(newModel)
router.route('/').delete(deleteOne)

module.exports = router

