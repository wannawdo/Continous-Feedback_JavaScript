const express = require('express')
const app = express()
const bodyParser=require('body-parser')
const Sequelize=require('sequelize')
const Op=Sequelize.Op

const application=require('./application')


app.get('/',function(req,res){
    res.send('Test 2 10 2 10')
})

const sequelize=new Sequelize('feedback','root','pass',{
    dialect:'mysql',
    host: "localhost"
})

//-------------USER------------
//attribute tabela Profesor
const User=sequelize.define('user',{
  firstName:{
       type:Sequelize.STRING,
       allowNull:true
   },
   lastName:{
      type:Sequelize.STRING,
      allowNull:true
  },
  type:{
    type:Sequelize.INTEGER,
    allowNull:false
  },
   email:{
       type:Sequelize.STRING,
       allowNull:true
   },
   password:{
       type:Sequelize.STRING,
       allowNull:true,
       validate:{
           len:[5,20]
       }
   },
   token:{
     type:Sequelize.STRING,
     allowNull:false
   },
    createdAt: {
      type: Sequelize.DATE(6),
      allowNull: true,
      defaultValue: Sequelize.fn('NOW')
    }
})



//-------------ACTIVITATE------------
//atribute activitati
const Activity=sequelize.define('activity',{
  accessCode:{
      type:Sequelize.STRING,
      allowNull:false
  },
  description:{
       type:Sequelize.STRING,
       allowNull:false
   },
   duration:{
      type:Sequelize.INTEGER,
      allowNull:false
  },
  status:{
      type:Sequelize.INTEGER,
      allowNull:false
  },
  createdAt: {
    type: Sequelize.DATE(6),
    allowNull: true,
    defaultValue: Sequelize.fn('NOW')
  }
})


//-------------Reactie------------
//atribute activitati
const Reaction =sequelize.define('reaction',{
  reaction_type: {
      type:Sequelize.INTEGER,
      allowNull:false
  },
  createdAt: {
    type: Sequelize.DATE(6),
    allowNull: true,
    defaultValue: Sequelize.fn('NOW')
  }
})


Activity.hasMany(Reaction)
User.hasMany(Activity)
User.hasMany(Reaction)
 



 app.use(bodyParser.json())

 //se reseteaza baza de date
 app.get('/create', async (req, res, next) => {
    try {
      await sequelize.sync({ force: true })
      res.status(201).json({ message: 'Database created' })
    } catch (err) {
      next(err)
    }
  })


//-------------Log In------------
const checkLogin = async (req, res, next) => {
  const { token, id } = req.session;

  if (!token || !id) {
    res.status(403).send({ message: "You don't have access!" });
  } else {
    const user = await User.findOne({ where: { token, id }, raw: true })
    if (user) {
      next()
    } else {
      res.status(403).send({ message: "You don't have access!" });
    }
  }
}


//-------------USER------------
  //se afiseaza lista cu profesori
  // app.get('/professors', async (req, res, next) => {
  //   try {
  //       const user= await User.findAll();
  //       res.status(200).json(user);

  //   } catch (err) {
  //       next(err)
  //     }
  //   })

/// se creaza tabela profesori in caz ca nu exista
    app.post('/professors',async (req, res, next) => {
        try {
          const { firstName, lastName, email, password } = req.body;

          const problems = [];

          if (!firstName) {
            problems.push("You must complete first name box")
          }
          if (!lastName) {
            problems.push("You must complete last name box")
          }
          if (!email) {
            problems.push("You must complete e-mail box")
          } else if (!email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)) {
            problems.push("Email structure is invalid") 
          } else if (await User.findOne({ where: { email }, raw: true })) {
            problems.push("You already have an account")
          }
          if (!password) {
            problems.push("You must complete password box")
          }
          if (problems.length === 0) {
            await User.create({ firstName, lastName, type: 1, email, password, token: Math.random().toString(36) })
            req.status(201).json({message:created})
          }
        } catch (err) {
            next(err)
          }
        })
  
//adaugam un profesor 
// app.post('/professors/add', async(req, res, next) => {
//     try {
//         const professor = await User.create(req.body);
//         res.status(200).json({
//            message : 'created!',
//         });
        
//     } catch (err) {
//         next(err);
//     }
// })


//------------Log In------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ where: { email, password }, raw: true })

  if (user) {
    req.session.id = user.id;
    req.session.token = user.token;
    res.status(200).send({ message: "You have been successfully logged in! :)" })
  } 
   else {
    res.status(403).send({ message: "Incorrect email or password :(" })
    }
 })


//------------Log Out------------
 app.get("/logout", async (req, res) => {
  req.session.reset();
  res.status(200).send({ message: "You have been successfully logged out! :)" })
})


//------------ACTIVITATI------------

  //adaugam activitate pt un anumit profesor
  app.post("/professor/:profid/activities/add", checkLogin, async (req, res, next) => {
    try {
      const { duration, description } = req.body;

      const issues = [];

      if (!description) {
        issues.push("Description must be filled in")
      }
      if (!duration) {
        issues.push("Duration must be introduced")
      } else if (!duration.match(/^[0-9]*$/)) {
        issues.push("Please enter a valid duration")
      }

      if (issues.length === 0) {
        const activity = await Activity.create({
          description, accessCode: Math.random().toString(36).slice(6),
          duration, userId: req.session.id, status: 1
        });
        res.status(201).send({
          message: `Activity ${description} was sucessfull created`,
          accessCode: activity.accessCode
        });
      } else {
        res.status(400).send({ issues });
      }   
    } catch (err) {
      next(err)
    }
  })

//sa afisam toate activitatile unui profesor
 app.get('/professor/:profid/activities', async (req, res, next) => {
    try {
      const professor = await User.findByPk(req.params.profid, {
        include: [ Activity ]
      })
      if (professor) {
        res.status(200).json(professor.activities)
      } else {
        res.status(404).json({ message: 'not found '})
      }    
    } catch (err) {
      next(err)
    }
  })
  
  //sa afisam activitatile dupa id-ul lor
  app.get("/activities/:activityId", checkLogin, async (req, res) => {
    try {
      const { activityId } = req.params;
      const activity = await Activity.findOne({
        attributes: ['id', 'accessCode', 'duration', 'status', 'description', 'createdAt'],
        where: {
          id: activityId
        }
      });
      const reactions = await Reaction.findAll({
        attributes: ['reaction_type', 'createdAt'],
        where: {
          activityId
        }
      })
      res.status(200).send({ ...activity.get({ plain: true }), reactions });

    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error! Cannot get activities by id."
      });
    }
  });


   //---------------Student------------   ------------------------ de modificat
   app.post("/student", async (req, res) => {
    try {
      const { accessCode } = req.body

      const activity = await Activity.findOne({
        attributes: ['id', 'description', 'duration', 'createdAt', 'userId'],
        where: { accessCode }
      });
      let user;
      user = await User.create({ type: 2, token: Math.random().toString(36) })
      req.session.id = user.id;
      req.session.token = user.token;

      const professor = await User.findOne({
            attributes: ['firstName', 'lastName', 'email'],
            where: { id: activity.userId },
            raw: true
          })

          res.status(200).send({
            activity: { ...activity.get({ plain: true }), professor, userId: undefined },
            message: "Access granted",
          })
        }    
     catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error"
      });
    }
  });

  
  
  //---------------REACTII------------



  // app.get('reaction/:aid', async (req, res, next) => {
  //   try {
  //       const reactions = await Reaction.findAll()
  //       const activityReaction = []
    
  //       rections.forEach(e => {
  //         if (e.activityId == req.params.aid) {
  //           activityFeedback.push(e)
  //         }
  //       })  
  //       res.status(200).json(activityReaction)  
  //     } 
  //     catch (err) {
  //       next(err)
  //     }
  // })


  // app.post('reactions/add', async(req,res,next)=>
  // {
  //     try{
  //         await Reaction.create(req.body)
  //         res.status(200).json({
  //             message:'Created!'
  //         })
  //     }
  //     catch(err){
  //         next(err)
  //     }
  // })


  // app.post('/reactions', async(req, res, next) => {
  //   try {
  //     const reactions = Reaction.findAll()
  //     res.status(200).json(reactions)
  //   }
  //   catch(err){
  //     next(err)
  //   }
  // })
  app.post("/reactions", checkLogin, async (req, res) => {
    try {
      const { reaction_type, activityId } = req.body;

      const activity = await Activity.findOne({
        attributes: ['id', 'description', 'duration', 'createdAt', 'userId', 'status'],
        where: { id: activityId }
      });

      if (!activity) {
        res.status(400).send({ message: `This activity doesn't exist` });
      } else {
        if (activity.status) {
          await Reaction.create({ reaction_type, activityId, userId: req.session.id })
          res.status(201).send({ message: `Feedback was delivered` });
        } else {
          res.status(403).send({ message: `Activity done` });
        }
      }

    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "The reaction coudn't be submitted."
      });
    }
  });
  app.post("/feedback", checkLogin, async (req, res) => {
    try {
      const { reaction_type, activityId } = req.body;

      const activity = await Activity.findOne({
        attributes: ['id', 'description', 'duration', 'createdAt', 'userId', 'status'],
        where: { id: activityId }
      });

      if (!activity) {
        res.status(400).send({ message: `Activity not exists` });
      } else {
        if (activity.status) {
          await Reaction.create({ reaction_type, activityId, userId: req.session.id })
          res.status(201).send({ message: `Feedback was sent` });
        } else {
          res.status(403).send({ message: `Activity finished` });
        }
      }

    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error"
      });
    }
  });


 app.listen(8080)