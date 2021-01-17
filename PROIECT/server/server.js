const express = require("express");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const session = require("client-sessions");
const cors = require("cors");

const connection = new Sequelize("reactions", "root", "", {
  dialect: "mysql",
});

const User = connection.define("user", {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  type: Sequelize.INTEGER,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  token: Sequelize.STRING,
  createdAt: {
    type: Sequelize.DATE(6),
    allowNull: true,
    defaultValue: Sequelize.fn("NOW"),
  },
});

const Activity = connection.define("activity", {
  accessCode: Sequelize.STRING,
  duration: Sequelize.INTEGER,
  status: Sequelize.INTEGER,
  description: Sequelize.STRING,
  createdAt: {
    type: Sequelize.DATE(6),
    allowNull: true,
    defaultValue: Sequelize.fn("NOW"),
  },
});

const Reaction = connection.define("reaction", {
  emoticon: Sequelize.INTEGER,
  createdAt: {
    type: Sequelize.DATE(6),
    allowNull: true,
    defaultValue: Sequelize.fn("NOW"),
  },
});

User.hasMany(Activity, { onDelete: "Cascade" });
Activity.hasMany(Reaction, { onDelete: "Cascade" });
User.hasMany(Reaction, { onDelete: "Cascade" });

const checkLogin = async (req, res, next) => {
  const { token, id } = req.session;

  if (!token || !id) {
    res.status(403).send({ message: "Forbidden" });
  } else {
    const user = await User.findOne({ where: { token, id }, raw: true });

    if (!user) {
      res.status(403).send({ message: "Forbidden" });
    } else {
      next();
    }
  }
};

const app = express();
const clientUrl = "http://localhost:3000";
const configure = (app) => {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", clientUrl);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  app.options("*", cors({ origin: clientUrl }));

  app.get("/*", (req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store");
    next();
  });

  app.use(
    session({
      cookieName: "session",
      secret:
        "eg[isfd-8yF9-7w2315dfergergpok123+Ijsli;;termgerdfkhmdkrherhhehwemgro8",
      duration: 7200000,
      activeDuration: 300000,
      httpOnly: true,
      ephemeral: true,
    })
  );
  app.use(bodyParser.json());

  app.get("/reset", async (req, res) => {
    try {
      await connection.sync({ force: true });
      res.status(201).send({
        message: "Database reset",
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error",
      });
    }
  });

  app.post("/professors", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const errors = [];

      if (!firstName) {
        errors.push("First name is empty");
      }
      if (!lastName) {
        errors.push("Last name is empty");
      }
      if (!email) {
        errors.push("Email is empty");
      } else if (
        !email.match(
          /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        )
      ) {
        errors.push("Email is not valid");
      } else if (await User.findOne({ where: { email }, raw: true })) {
        errors.push("Email already used");
      }
      if (!password) {
        errors.push("Password is empty");
      }

      if (errors.length === 0) {
        await User.create({
          firstName,
          lastName,
          email,
          password,
          type: 1,
          token: Math.random().toString(36),
        });
        res.status(201).send({
          message: `Professor ${firstName} ${lastName} was sucessfull created`,
        });
      } else {
        res.status(400).send({ errors });
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error",
      });
    }
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, password }, raw: true });

    if (!user) {
      res.status(403).send({ message: "Incorrect email or password" });
    } else {
      if (req.session.id) {
        res.status(202).send({ message: "Already logged it" });
      } else {
        req.session.id = user.id;
        req.session.token = user.token;
        res.status(200).send({ message: "Successful login" });
      }
    }
  });

  app.get("/logout", async (req, res) => {
    req.session.reset();
    res.status(200).send({ message: "Successful logout" });
  });

  app.post("/activities", checkLogin, async (req, res) => {
    try {
      const { duration, description } = req.body;

      const errors = [];

      if (!description) {
        errors.push("Description is empty");
      }
      if (!duration) {
        errors.push("Duration is empty");
      } else if (!duration.match(/^[0-9]*$/)) {
        errors.push("Duration is not valid");
      }

      if (errors.length === 0) {
        const activity = await Activity.create({
          description,
          accessCode: Math.random().toString(36).slice(6),
          duration,
          userId: req.session.id,
          status: 1,
        });
        res.status(201).send({
          message: `Activity ${description} was sucessfull created`,
          accessCode: activity.accessCode,
        });
      } else {
        res.status(400).send({ errors });
      }
      //
    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error",
      });
    }
  });

  app.get("/activities", checkLogin, async (req, res) => {
    try {
      const activities = await Activity.findAll({
        attributes: [
          "id",
          "accessCode",
          "duration",
          "status",
          "description",
          "createdAt",
        ],
        where: {
          userId: req.session.id,
        },
      });
      const formattedActivities = await Promise.all(
        await activities.map(async (item) => {
          const itemTime = new Date(item.createdAt);

          if (itemTime.getTime() + item.duration * 60 * 1000 < Date.now()) {
            await item.update({ ...item, status: 0 });
          }

          const reactions = await Reaction.findAll({
            attributes: ["emoticon", "createdAt"],
            where: {
              activityId: item.id,
            },
          });

          return { ...item.get({ plain: true }), reactions };
        })
      );

      res.status(200).send(formattedActivities);
    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error",
      });
    }
  });

  app.get("/activities/:activityId", checkLogin, async (req, res) => {
    try {
      const { activityId } = req.params;
      const activity = await Activity.findOne({
        attributes: [
          "id",
          "accessCode",
          "duration",
          "status",
          "description",
          "createdAt",
        ],
        where: {
          id: activityId,
        },
      });
      const itemTime = new Date(activity.createdAt);

      if (itemTime.getTime() + activity.duration * 60 * 1000 < Date.now()) {
        await activity.update({ ...activity, status: 0 });
      }

      const reactions = await Reaction.findAll({
        attributes: ["emoticon", "createdAt"],
        where: {
          activityId,
        },
      });
      res.status(200).send({ ...activity.get({ plain: true }), reactions });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error",
      });
    }
  });

  app.post("/student", async (req, res) => {
    try {
      const { accessCode, email } = req.body;

      const activity = await Activity.findOne({
        attributes: ["id", "description", "duration", "createdAt", "userId"],
        where: { accessCode, status: 1 },
      });

      if (!activity) {
        res.status(404).send({
          message: `Activity not found`,
        });
      } else {
        const itemTime = new Date(activity.createdAt);

        if (itemTime.getTime() + activity.duration * 60 * 1000 < Date.now()) {
          await activity.update({ ...activity, status: 0 });
        }
        let user;
        const errors = [];
        if (email) {
          user = await User.findOne({ where: { email }, raw: true });
        }
        if (!user) {
          if (!email) {
            errors.push("Email is empty");
          } else if (
            !email.match(
              /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
            )
          ) {
            errors.push("Email is not valid");
          } else if (await User.findOne({ where: { email }, raw: true })) {
            errors.push("Email already used");
          }
          if (errors.length === 0) {
            user = await User.create({
              email,
              type: 2,
              token: Math.random().toString(36),
            });
          } else {
            res.status(400).send({ errors });
          }
        }
        if (errors.length === 0) {
          req.session.id = user.id;
          req.session.token = user.token;

          const professor = await User.findOne({
            attributes: ["firstName", "lastName", "email"],
            where: { id: activity.userId },
            raw: true,
          });

          res.status(200).send({
            activity: {
              ...activity.get({ plain: true }),
              professor,
              userId: undefined,
            },
            message: "Access granted",
          });
        }
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error",
      });
    }
  });

  app.post("/reaction", checkLogin, async (req, res) => {
    try {
      const { emoticon, activityId } = req.body;

      const activity = await Activity.findOne({
        attributes: [
          "id",
          "description",
          "duration",
          "createdAt",
          "userId",
          "status",
        ],
        where: { id: activityId },
      });

      if (!activity) {
        res.status(400).send({ message: `Activity not exists` });
      } else {
        if (activity.status) {
          await Reaction.create({
            emoticon,
            activityId,
            userId: req.session.id,
          });
          res.status(201).send({ message: `Reaction was sent` });
        } else {
          res.status(403).send({ message: `Activity finished` });
        }
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({
        message: "Error",
      });
    }
  });
};
module.exports = configure;

configure(app);

app.listen(8081, () => {
  console.log("server started on http://localhost:8081");
});
