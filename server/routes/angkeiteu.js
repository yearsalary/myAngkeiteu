import express from 'express';
import Angkeiteu from '../models/angkeiteu';
import mongoose from 'mongoose';
import moment from 'moment';

const router = express.Router();

// WRITE ANGKEITEU
router.post('/', (req, res)=>{
  // CHECK LOGIN STATUS
  if(typeof req.session.loginInfo === 'undefined') {
      return res.status(403).json({
          error: "NOT LOGGED IN",
          code: 1
      });
  }

  // CHECK ANGKEITEU VAILD
  if(typeof req.body.title !== 'string' ||
      req.body.title === '') {
        return res.status(400).json({
          error: 'EMPTY TITLE',
          code: 2
        });
  }

  if(typeof req.body.description !== 'string' ||
      req.body.description === '') {
        return res.status(400).json({
          error: 'EMPTY DESCRIPTION',
          code: 3
        });
  }

  if(req.body.options.length == 0) {
    return res.status(400).json({
      error: 'EMPTY OPTIONS',
      code: 4
    });
  }

  // CREATE NEW ANGKEITEU
  let angkeiteu = new Angkeiteu({
    writer: req.session.loginInfo.email,
    title: req.body.title,
    description: req.body.description,
    options: req.body.options
  });

  // SAVE IN DATABASE
  angkeiteu.save( err => {
    if(err) throw err;
    return res.json({ success: true});
  });
});

// GET RECENT ANGKEITEU LIST
router.get('/', (req, res) => {
  Angkeiteu.find()
   .sort({"_id": -1})
   .limit(8)
   .exec((err, angkeiteus) => {
       if(err) throw err;
       return res.json(angkeiteus);
   });
});

// GET ANGKEITEU
router.get('/:id', (req, res) => {
  let id = req.params.id;
  let condition = {};
  let update = {};
  let option ={};

  //CHECK ID VALIDITY
  if(!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
          error: "INVALID ID",
          code: 1
      });
  }

  condition = {
    '_id': id
  };
  update = {
    '$inc': {'viewCount': 1}
  };
  option = {
    'new': true
  }
  Angkeiteu.findOneAndUpdate(condition, update, option, (err, angkeiteu) => {
    if(err) throw err;
    return res.json(angkeiteu);
  });
});

// SEARCH ANGKEITEU
router.get('/search/:title', (req, res) => {
  let title = req.params.title;
  let regexp = new RegExp('^' + title);
  let findCondition = {};
  let sortCondition = {};

  findCondition = {'title': {'$regex': regexp}};
  sortCondition = {'title': 1};
  Angkeiteu.find(findCondition)
  .limit(5)
  .sort(sortCondition)
  .exec((err, angkeiteus) => {
    if(err) throw err;
    return res.json(angkeiteus);
  });
});

// GET HOT ANKGEITEU LIST ON SPECIFIC PERIOD
router.get('/hot/:period', (req, res) => {
  let period = req.params.period;
  let today = moment().startOf('day');
  let tomorrow = moment(today).add(1,'days');
  let thisMonth = moment().startOf('month');
  let nextMoth = moment(thisMonth).add(1,'months');
  let condition = {};
  let targetDate = {};
  let targetNextDate = {};

  // CHECK PERIOD VALIDITY
  if(!(period === 'today' || period === 'thisMonth')) {
      return res.status(400).json({
          error: "INVALID PERIOD",
          code: 1
      });
  }

  if(period === 'today') {
    //get api/angkeiteu/hot/today
    targetDate = today.toDate();
    targetNextDate = tomorrow.toDate();
  } else if(period === 'thisMonth') {
    //get api/angkeiteu/hot/thisMonth
    targetDate = thisMonth.toDate();
    targetNextDate = nextMoth.toDate();
  }
  condition = {
    'createdDate': {
      '$gte': targetDate,
      '$lt': targetNextDate
    }
  }
  Angkeiteu.find(condition)
  .sort({viewCount: -1})
  .limit(8)
  .exec((err, angkeiteus) => {
    if(err) throw err;
    return res.json(angkeiteus);
  });
});

// GET OLD OR NEW ANGKEITEU LIST BY LAST ANGKEITEU ID IN CLIENT DATAS
router.get('/:listType/:id', (req, res) => {
  let listType = req.params.listType;
  let id = req.params.id;
  let findCondition = {};
  let sortCondition = {};

  // CHECK LISTTYPE VALIDITY
  if(!(listType === 'old' || listType === 'new')) {
    return res.status(400).json({
      error: "INVALID LISTTYPE",
      code: 1
    });
  }
  //CHECK ID VALIDITY
  if(!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
          error: "INVALID ID",
          code: 2
      });
  }
  if(listType === 'old') {
    findCondition = { '_id': { '$lt': id } };
    sortCondition = { '_id': -1};
  } else if(listType === 'new') {
    findCondition = { '_id': { '$gt': id } };
    sortCondition = { '_id': 1};
  }

  Angkeiteu.find(findCondition)
  .sort(sortCondition)
  .limit(4)
  .exec((err, angkeiteus) => {
    if(err) throw err;
    if(listType === 'old')
      return res.json(angkeiteus);
    else(listType === 'new')
      return res.json(angkeiteus.reverse());
  });
});

// GET OLD OR NEW HOTANGKEITEU LIST BY LAST ANGKEITEU ID IN CLIENT DATAS
router.get('/hot/:period/:listType/:id', (req, res) => {
  let period = req.params.period;
  let listType = req.params.listType;
  let id = req.params.id;
  let today = moment().startOf('day');
  let tomorrow = moment(today).add(1,'days');
  let thisMonth = moment().startOf('month');
  let nextMoth = moment(thisMonth).add(1,'months');
  let findCondition = {};
  let sortCondition = {};
  let targetDate = {};
  let targetNextDate = {};

  // CHECK PERIOD VALIDITY
  if(!(period === 'today' || period === 'thisMonth')) {
      return res.status(400).json({
          error: "INVALID PERIOD",
          code: 1
      });
  }

  if(period === 'today') {
    //get api/angkeiteu/hot/today
    targetDate = today.toDate();
    targetNextDate = tomorrow.toDate();
  } else if(period === 'thisMonth') {
    //get api/angkeiteu/hot/thisMonth
    targetDate = thisMonth.toDate();
    targetNextDate = nextMoth.toDate();
  }
  findCondition = {
    'createdDate': {
      '$gte': targetDate,
      '$lt': targetNextDate
    }
  }
  // CHECK LISTTYPE VALIDITY
  if(!(listType === 'old' || listType === 'new')) {
    return res.status(400).json({
      error: "INVALID LISTTYPE",
      code: 2
    });
  }
  // CHECK ANGKEITEU ID VALIDITY
  if(!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
          error: "INVALID ID",
          code: 2
      });
  }

  Angkeiteu.findOne({
    '_id': id
  }).exec((err, angkeiteu) => {
    if(err) throw err;
    if(listType === 'old') {
      findCondition['viewCount'] = {
        '$lt': angkeiteu.viewCount
      };
      sortCondition = {'viewCount': -1};
    } else if(listType === 'new') {
      findCondition['viewCount'] = {
        '$gt': angkeiteu.viewCount
      };
      sortCondition = {'viewCount': 1};
    }
    return Angkeiteu.find(findCondition)
    .sort(sortCondition)
    .limit(4)
    .exec((err, angkeiteus) => {
      if(err) throw err;
      if(listType === 'old')
        return res.json(angkeiteus);
      else if(listType === 'new')
        return res.json(angkeiteus.reverse());
    });
    return;
  });
});

// PARTICIPATE ANGKEITEU
router.put('/:id/selectOption/:optionId', (req, res) => {
  let id = req.params.id;
  let optionId = req.params.optionId;
  let loginInfo = req.session.loginInfo;
  let condition = {};
  let update = {};
  let option = {};

  //CHECK LOGIN STATUS
  if(typeof loginInfo === 'undefined') {
      return res.status(403).json({
          error: "NOT LOGGED IN",
          code: 1
      });
  }
  //CHECK ANGKEITEU ID VALIDITY
  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error:'INVALID ID',
      code: 2
    });
  }
  //CHECK OPTION ID VALIDITY
  if(!mongoose.Types.ObjectId.isValid(optionId)) {
    return res.status(400).json({
      error:'INVALID OPTION ID',
      code: 3
    });
  }
  //CHECK DUPLICATED PARTICIPATION
  condition = {
    '_id': id, 'participants.email':  loginInfo.email
  }
  Angkeiteu.findOne(condition, (err, angkeiteu) => {
    if(err) throw err;
    if(angkeiteu !== null) {
      return res.status(400).json({
        error: 'DUPLICATED PARTICIPATION',
        code: 4
      });
    }
    //SELECT COUNT INC
    condition = {
      '_id': id, 'options._id': optionId
    };
    update = {
      '$inc': {'options.$.selectCount' :1},
      '$push': {'participants': {'email': loginInfo.email, 'selectedOptionId': optionId} }
    };
    option = {
      'new': true
    }
    Angkeiteu.findOneAndUpdate(condition, update, option, (err, angkeiteu) => {
      if(err) throw err;
      return res.json(angkeiteu);
    });
  });
});

export default router;
