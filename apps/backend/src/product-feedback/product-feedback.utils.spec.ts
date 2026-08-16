import { validate } from 'class-validator';
import { CreateProductFeedbackDto } from './dto/create-product-feedback.dto';
import {
  calculateFeedbackAverage,
  calculateProductAverage,
} from './product-feedback.utils';

describe('product feedback ratings', () => {
  it('rejects ratings outside 1–5', async () => {
    const dto = Object.assign(new CreateProductFeedbackDto(), {
      effectivenessRating: 0,
      needsRating: 4,
      repurchaseRating: 6,
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['effectivenessRating', 'repurchaseRating']),
    );
  });

  it('calculates the three-question and product averages', () => {
    const userA = {
      effectivenessRating: 5,
      needsRating: 4,
      repurchaseRating: 5,
    };
    const userB = {
      effectivenessRating: 4,
      needsRating: 4,
      repurchaseRating: 5,
    };

    expect(calculateFeedbackAverage(userA)).toBeCloseTo(4.6667, 4);
    expect(calculateFeedbackAverage(userB)).toBeCloseTo(4.3333, 4);
    expect(calculateProductAverage([userA, userB])).toBe(4.5);
  });
});
