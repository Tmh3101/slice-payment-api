import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

interface SuccessResponseParams {
    c: Context;
    data: any;
    message?: string;
    status?: ContentfulStatusCode;
}

interface ErrorResponseParams {
    c: Context;
    message: string;
    status?: ContentfulStatusCode;
    errorCode?: string;
    error?: any;
}

export const successResponse = ({ c, data, message = 'Success', status = 200 }: SuccessResponseParams) => {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    status
  );
};

export const createdResponse = ({ c, data, message = 'Resource created successfully' }: SuccessResponseParams) => {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    201
  );
};

export const errorResponse = ({ c, message, status = 500, errorCode, error }: ErrorResponseParams) => {
  return c.json(
    {
      success: false,
      message,
      error_code: errorCode,
      // Chỉ hiện stack trace nếu không phải production
      stack: process.env.NODE_ENV === 'production' ? undefined : error?.stack,
    },
    status
  );
};