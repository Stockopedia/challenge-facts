import { DivisionByZeroError, operatorFns } from './operators';
import { Operator } from './schema';

type OperatorCase = [operator: Operator, expectedResult: number];

describe("operators", () => {

  test.each<OperatorCase>([["-", 1], ["+", 3], ["*", 2], ["/", 2]])("%s does basic math", (operator, expectedResult) => {
    const result = operatorFns[operator](2, 1);

    expect(result).toEqual(expectedResult);
  })

  test.each<OperatorCase>([["-", -1], ["/", 0.5]])("%s respects operand order", (operator, expectedResult) => {
    const result = operatorFns[operator](1, 2);

    expect(result).toEqual(expectedResult);
  })

  describe("division by zero", () => {
    test.each([1, -1, 0])("throws when dividing %s by zero", (numerator) => {
      expect(() => operatorFns["/"](numerator, 0)).toThrow(DivisionByZeroError);
    })

    it("throws when dividing by negative zero", () => {
      expect(() => operatorFns["/"](1, -0)).toThrow(DivisionByZeroError);
    })

    it("allows a zero numerator", () => {
      expect(operatorFns["/"](0, 2)).toEqual(0);
    })
  })
})
