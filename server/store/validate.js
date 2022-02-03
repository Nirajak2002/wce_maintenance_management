const Joi = require('joi');

const schema = Joi.object()
  .keys({
    material: Joi.string().required('Material Name is required'),
    materialSpec: Joi.string().required('Material Specification is required'),
    unitMeasure: Joi.string().required('Unit of Measurement is required'),
    cost: Joi.number().required('Cost is required'),
    quantity: Joi.number().required('Quantity is required'),
    //totalCost:Joi.number().required('totalCost is Required')
  })
  .unknown(true);

module.exports = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(req.body);
    console.log(error);
    return res.status(422).json({
      success: 0,
      error: error.details.map((d) => d.message).join(','),
    });
  }
};
