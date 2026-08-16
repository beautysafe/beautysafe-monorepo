import { ArgumentsHost, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { QueryFailedErrorFilter } from './query-failed-error.filter';

describe('QueryFailedErrorFilter', () => {
  it('logs database context but returns only a generic 500 response', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const log = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const request = {
      method: 'GET',
      originalUrl: '/products/ean/4005808222520',
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
    const driverError = Object.assign(
      new Error('relation "product_feedback" does not exist'),
      { code: '42P01' },
    );
    const exception = new QueryFailedError(
      'SELECT * FROM "product_feedback"',
      undefined,
      driverError,
    );

    new QueryFailedErrorFilter().catch(exception, host);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('"postgresCode":"42P01"'),
      expect.any(String),
    );
    expect(log.mock.calls[0][0]).toContain(
      '"endpoint":"/products/ean/4005808222520"',
    );
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
    });
    expect(JSON.stringify(json.mock.calls)).not.toContain('product_feedback');

    log.mockRestore();
  });
});
