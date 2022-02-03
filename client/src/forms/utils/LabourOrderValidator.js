import FormValidator from '../../helpers/FormValidator';

const emptyCheck = (value) => value && value.trim().length > 0;
const checkValue = (value) => value > 0;

export default function LabourOrderValidator() {
  console.log('called')
    const validator = new FormValidator();
    validator
      .addRule('lType', emptyCheck, 'Please Enter labour type: Skilled,Semi-Skilled,Non-skilled')
      .addRule('lCharges', checkValue, 'Enter Valid labour Charges per job')
      .addRule('lCount', checkValue, 'Enter valid Count')
      .addRule('lAmount', checkValue, 'Enter valid Amount');

    return validator;
}
