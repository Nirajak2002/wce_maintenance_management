const Joi = require('joi');

const schema = Joi.object()
  .keys({
    // type: Joi.string().required().valid('labour'),
    complaintId: Joi.string().required('Complaint id is required'),
    sign: Joi.string().required('Signature is required'),
  })
  //Newly added by Swapnil-Aprupa
  .when(Joi.object({ type: Joi.string().valid('labour') }).unknown(true), {
    then: Joi.object({
      lType: Joi.string().required('Labour Type not provided'),
      lCharges: Joi.number().required('Labour Charges per Job not provided'),
      lCount: Joi.number().required('Labour count not provided'),
      lAmount: Joi.number().required('Exstimated Amount not provided'),
    }),
  });

const updateSchema = Joi.object()
  .keys({
    // type: Joi.string().required().valid('labour'),
    // quantity: Joi.number().required(),
    complaintId: Joi.string().required('Complaint id is required'),
  })
  .when(
    Joi.object({ type: Joi.string().required().valid('labour') }).unknown(
      true
    ),
    {
      then: Joi.object({
        lType: Joi.string().required(),
        lCharges: Joi.number().required(),
        lCount: Joi.number().required(),
        lAmount: Joi.number().required(),
      }),
    })
  .unknown(true);

const deleteSchema = Joi.object()
  .keys({
    complaintId: Joi.string().required(),
    // type: Joi.string().required().valid('labour'),
  })
  // .when(Joi.object({ type: Joi.string().valid('available') }).unknown(true), {
  //   then: Joi.object({
  //     quantity: Joi.number().required(),
  //   }),
  // })
  .unknown(true);
module.exports.validatePost = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    return res.status(422).json({
      success: 0,
      error: error.details.map((doc) => doc.message).join(','),
    });
  }
};

module.exports.validateUpdate = async (req, res, next) => {
  try {
    await updateSchema.validateAsync(req.body);
    next();
  } catch (error) {
    return res.status(422).json({
      success: 0,
      error: error.details.map((d) => d.message).join(','),
    });
  }
};

module.exports.validateDelete = async (req, res, next) => {
  try {
    await deleteSchema.validateAsync(req.body);
    next();
  } catch (error) {
    return res.status(422).json({
      success: 0,
      error: error.details.map((d) => d.message).join(','),
    });
  }
};
