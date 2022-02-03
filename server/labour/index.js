const router = require('express').Router();

const { validatePost, validateUpdate, validateDelete } = require('./validate');
const { verifyAdmin } = require('../verifyAuthToken');
const Labour = require('./model');
const Store = require('../store/model');
var ObjectId = require('mongoose').Types.ObjectId;

router.all('*', verifyAdmin, (req, res, next) => next());

router.get('/', async (req, res) => {
  try {
    const data = await Labour.find();
    return res.status(200).json({
      success: 1,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: 0,
      error: 'Unable to find data',
    });
  }
});
// router.get('/:id', async (req, res) => {
//   try {
//     const data = await Labour.findOne({complaintId:req.params.id});
//     console.log(data);
//     return res.status(200).json({
//       success: 1,
//       data,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       success: 0,
//       error: 'Unable to find data',
//     });
//   }
// });
router.get('/:id', async (req, res) => {
  try {
    const data = await Labour.findOne({complaintId:req.params.id},{labourOrder:1});
    console.log(data);
    return res.status(200).json({
      success: 1,
      labourOrder: data
      ? data.labourOrder
      : [],
    });
  } catch (error) {
    return res.status(400).json({
      success: 0,
      error: 'Unable to find data',
    });
  }
});

router.post('/', validatePost, async (req, res) => {
  try {
    const complaintId = ObjectId(req.body.complaintId);
    var existingLabour = await Labour.findOne({
      complaintId,
    });
    if (!existingLabour) {
      existingLabour = new Labour({
        complaintId: ObjectId(req.body.complaintId),
        sign: req.body.sign,
        labourOrder:
          [//check length
            {
              lType: req.body.lType,
              lCharges: req.body.lCharges,
              lCount: req.body.lCount,
              lAmount: req.body.lAmount,
              addedBy: ObjectId(req.user._id),
            },
          ],
      });
      // const data = await newLabour.save();

    } else {
      existingLabour.labourOrder.push(
        {
          lType: req.body.lType,
          lCharges: req.body.lCharges,
          lCount: req.body.lCount,
          lAmount: req.body.lAmount,
          addedBy: ObjectId(req.user._id),
        });
    }
    const data = await existingLabour.save();


    console.log(data + " line 47 of labour/index.js");
    return res.status(200).json({
      success: 1,
      data,
      _id: req.user._id,
    });
  }
  catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: 'Could not add labour',
    });
  }
});

//New
router.put('/:id', validateUpdate, async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({
        success: 0,
        error: 'Id not provided yes',
      });
    const response = await Labour.updateOne(
      {
        complaintId: ObjectId(req.body.complaintId),
        'labourOrder._id': ObjectId(req.params.id),
      },
      {
        $set: {
          'labourOrder.$.lType': req.body.lType,
          'labourOrder.$.lCount': req.body.lCount,
          'labourOrder.$.lCharges': req.body.lCharges,
          'labourOrder.$.lAmount': req.body.lAmount,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: 1,
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: 'Unable to update data',
    });
  }
});

/*API for Delete*/
router.delete('/:id', validateDelete, async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({
        success: 0,
        error: 'Id not provided',
      });
      await Labour.updateOne(
        { complaintId: req.body.complaintId },
        { $pull: { labourOrder: { _id: req.params.id } } }
      );

    return res.status(200).json({
      success: 1,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: 'Unable to delete record',
    });
  }
});

module.exports = router;



