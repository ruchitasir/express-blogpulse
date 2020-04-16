var express = require('express')
var db = require('../models')
var router = express.Router()

// POST /articles - create a new post
router.post('/', function(req, res) {
  db.article.create({
    title: req.body.title,
    content: req.body.content,
    authorId: req.body.authorId
  })
  .then(function(post) {
    res.redirect('/')
  })
  .catch(function(error) {
    res.status(400).render('main/404')
  })
})

// GET /articles/new - display form for creating new articles
router.get('/new', function(req, res) {
  db.author.findAll()
  .then(function(authors) {
    res.render('articles/new', { authors: authors })
  })
  .catch(function(error) {
    res.status(400).render('main/404')
  })
})

// GET /articles/:id - display a specific post and its author
router.get('/:id', function(req, res) {
  db.article.findOne({
    where: { id: req.params.id },
    include: [db.author,db.comment]
  })
  .then(function(article) {
    if (!article) throw Error()
       res.render('articles/show', { article: article })
    
  })
  .catch(function(error) {
    console.log(error)
    res.status(400).render('main/404')
  })
})

router.post('/:id',(req,res)=>{
  db.comment.create(req.body)
  .then(()=>{
    console.log(req.params.id);
    page=`/articles/${req.params.id}`
    console.log(page)
    res.redirect(page)
    
  })
  .catch((err)=>{
    console.log('Error',err)
    res.render('error')
  })
  //res.send("post route comments")
})

module.exports = router
