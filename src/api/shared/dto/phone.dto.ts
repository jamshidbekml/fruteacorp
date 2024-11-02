import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'phoneNumber', async: false })
export class PhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(phoneNumber: string): boolean {
    if (typeof phoneNumber !== 'string') {
      return false;
    }

    const val = phoneNumber;

    return Number(val) > 998000000000 && Number(val) <= 998999999999;
  }
}

export function IsCorrectPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PhoneNumberConstraint,
    });
  };
}
