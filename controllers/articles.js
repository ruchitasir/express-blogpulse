var async=require('async')
var express = require('express')
var db = require('../models')
var router = express.Router()

// POST /articles - create a new post
router.post('/', function(req, res) {
    console.log('post after article post')
    let tags =[]
    if(req.body.tags){
      tags = req.body.tags.split(',')
    }
    console.log(tags)
      db.article.create({
      title: req.body.title,
      content: req.body.content,
      authorId: req.body.authorId
    })
    .then(function(article) {
        if(tags.length){
          // async.forEach(array, normal forEach func, func to run at the end)
          async.forEach(tags,(t,done)=>{
              console.log('inside async')
            // this func gets called for every item in the tags array
             db.tag.findOrCreate({
               where: { name: t.trim() }
             })
             .then(([tag, wasCreated])=>{
               console.log('tag ', t," created successfully")
               // tag was found or created successfullly, now we 
               // need to add to the join table
               //<model1>.add<model2>(model2 instance)
               article.addTag(tag)
               .then(()=>{
                 console.log('associated tag ',t, ' with the article')
                // all done adding tag and relation in join table
                // call done to indicate that we are done with this
                // iteration of the forEach 
                done()
               })
             })
             
          },()=>{
            // runs when everything has resolved, all tags have gone into database
            // now we safely move on to the next page
            res.redirect('/articles/'+article.id)
          })

        } else {
          res.redirect('/articles/'+article.id)
        }
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
    include: [db.author,db.comment,db.tag]
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
    console.log('EDITED ARTILCE',req.body);
    console.log(req.params.id);
    page=`/articles/${req.params.id}`
    console.log(page)
    res.redirect(page)
    
  })
  .catch((err)=>{
    console.log('Error',err)
    res.render('error')
  })
 
})

router.put('/:id',(req,res)=>{
  
  db.article.update({
    content: req.body.content
  }, {
    where: {
      id: req.body.id
    }
  }).then(function(art) {
    // do something when done updating
    res.redirect('/articles/'+req.body.id)
  })
})

router.get('/:id/update',(req,res)=>{
  db.article.findOne({
    where: { id: req.params.id }
  })
  .then(function(article) {
    if (!article) throw Error()
    //console.log('update article',article)
       res.render('articles/update', { article: article })
    
  })
  .catch(function(error) {
    console.log(error)
    res.status(400).render('main/404')
  })

})


module.exports = router
