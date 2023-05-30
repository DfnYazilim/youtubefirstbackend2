const TodoSchema = require('../models/todo.model')
const listAll = async (req, res) => {
    try {
        let result = await TodoSchema.find().sort({createdTime : -1})
        res.status(200).json(result)
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }

}

const makeItDone = async (req,res) => {
  try {
      const {id} = req.query
      await TodoSchema.findByIdAndUpdate(id,{isDone : true})
          res.status(200).json()
      } catch (e) {
          console.error(e)
          res.status(500).json(e)
      }
}

const newModel = async (req, res) => {
    let model = new TodoSchema(req.body);
    try {
        console.log(req.body)
        let result = await TodoSchema.create(model);
        res.status(200).json(result)
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
}
const deleteOne = async (req, res) => {
    const id = req.query.id;
    try {
        let result = await TodoSchema.findByIdAndDelete(id);
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json(err)
    }
}
const getOne = async (req, res) => {
    try {
        let result = await TodoSchema.findById(req.query.id)

        res.status(200).json(result)
    } catch (err) {

        res.status(500).json(err)
    }
}
const updateOne = async (req, res) => {
    try {
        let result = await TodoSchema.findByIdAndUpdate(req.body.id, req.body);
        res.status(200).json(result)
    } catch (err) {

        res.status(500).json(err)
    }
}
module.exports = {
    listAll,
    newModel,
    getOne,
    updateOne,
    deleteOne,
    makeItDone
}



