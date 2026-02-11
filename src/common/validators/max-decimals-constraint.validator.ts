import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'maxTwoDecimals', async: false })
export class MaxTwoDecimalsConstraint implements ValidatorConstraintInterface {
  validate(value: number) {
    if (typeof value !== 'number') return false;

    return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
  }

  defaultMessage({ targetName }: ValidationArguments) {
    return `"${targetName}" must have at most 2 decimal places`;
  }
}
