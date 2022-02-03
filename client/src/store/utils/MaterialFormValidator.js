import FormValidator from '../../helpers/FormValidator';

const emptyCheck = (value) => value && value.trim().length > 0;
const checkValue = (value) => value > 0;

export default function MaterialFormValidator() {
  const validator = new FormValidator();
  validator
    .addRule('material', emptyCheck, 'Please Enter Material')
    .addRule('materialSpec', emptyCheck, 'Please Enter Material Specification')
    .addRule('unitMeasure', emptyCheck, 'Please Enter a Valid Unit of Measurement')
    .addRule('unitCost', checkValue, 'Please Enter a Valid Cost')
    .addRule('units', checkValue, 'Please Enter a valid quantity');

  return validator;
}